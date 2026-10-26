/**
 * Report Export Generators for FoodieHub
 * Supports:
 * 1. RFC 4180 CSV with Formula Injection Mitigation & UTF-8 BOM
 * 2. Multi-sheet Open XML Excel (.xlsx) with DEFLATE, Frozen Panes, Auto-Filter & Brand Green Styles
 * 3. Tabular Vector PDF with Multi-page Pagination, Company Logo, Headers, and Footers
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ============================================================================
// 1. CSV GENERATION & FORMULA INJECTION MITIGATION
// ============================================================================

/**
 * Mitigate CSV formula injection (DDE / Spreadsheet formula injection).
 * If a textual value starts with '=', '+', '-', '@', '\t', or '\r',
 * it is prepended with a single quote "'" to force spreadsheet applications
 * to treat it as a literal string.
 * Genuine numbers (even negative numbers like -42.50 or positive +10) are NOT prepended.
 *
 * @param {any} val - The raw cell value
 * @returns {string|number} Sanitized string or native number
 */
function sanitizeCsvValue(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'number') {
        if (Number.isNaN(val) || !Number.isFinite(val)) return '';
        return val;
    }

    const str = String(val);

    // If it is a clean numeric string (e.g. "123", "-45.67", "+10"), keep as-is
    if (/^[-+]?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(str.trim())) {
        return str.trim();
    }

    // Check for formula injection triggers at start or after leading whitespace
    const trimmed = str.replace(/^[\s\uFEFF\xA0]+/, '');
    if (/^[=+\-@\t\r]/.test(trimmed)) {
        return "'" + str;
    }

    return str;
}

/**
 * Format a single CSV cell according to RFC 4180.
 * Escapes double quotes, wraps in quotes if needed.
 */
function formatCsvField(val) {
    const sanitized = sanitizeCsvValue(val);
    const str = String(sanitized).replace(/"/g, '""');
    return `"${str}"`;
}

/**
 * Generate a complete CSV buffer with UTF-8 BOM.
 *
 * @param {Array<Array<any>>} rows - 2D array of rows
 * @returns {Buffer} UTF-8 encoded buffer starting with BOM
 */
function generateCsv(rows) {
    const lines = rows.map((row) => row.map(formatCsvField).join(','));
    const content = lines.join('\r\n');
    // Prepend UTF-8 BOM (0xEF, 0xBB, 0xBF) so Excel correctly recognizes UTF-8 (e.g. Amharic text)
    const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
    const body = Buffer.from(content, 'utf8');
    return Buffer.concat([bom, body]);
}

// ============================================================================
// 2. OPEN XML (.XLSX) GENERATION WITH FROZEN PANES & STYLES
// ============================================================================

/**
 * Escape string for XML and strip invalid XML 1.0 control characters.
 * XML 1.0 strictly forbids characters in ranges [\x00-\x08\x0B\x0C\x0E-\x1F].
 */
const xmlEsc = (s) =>
    String(s ?? '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

/**
 * Safely escape text for PDF 1.4 literal string syntax (...).
 * 1. Escapes backslashes and parentheses: \ -> \\, ( -> \(, ) -> \)
 * 2. Normalizes linebreaks and tabs to single spaces
 * 3. Replaces typographic unicode (quotes, dashes) with ASCII equivalents
 * 4. Safely maps characters outside WinAnsi / Latin-1 so standard Helvetica
 *    font streams do not break byte-length calculations or crash PDF parsers.
 */
function escapePdfString(val) {
    if (val === null || val === undefined) return '';
    const cleanStr = String(val)
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\u2026/g, '...');

    let out = '';
    for (let i = 0; i < cleanStr.length; i++) {
        const char = cleanStr[i];
        const code = cleanStr.charCodeAt(i);
        if (char === '\\') {
            out += '\\\\';
        } else if (char === '(') {
            out += '\\(';
        } else if (char === ')') {
            out += '\\)';
        } else if (code >= 32 && code <= 126) {
            out += char;
        } else if (code >= 160 && code <= 255) {
            out += char;
        } else {
            // Character outside WinAnsi (e.g. Amharic / Ethiopic or emoji)
            // Replace with safe ASCII placeholder without crashing the PDF stream
            out += '?';
        }
    }
    return out;
}

/** Convert 0-based col index to Excel letter: 0->A, 25->Z, 26->AA */
const colLetter = (n) => {
    let s = '';
    let col = n;
    while (col >= 0) {
        s = String.fromCharCode(65 + (col % 26)) + s;
        col = Math.floor(col / 26) - 1;
    }
    return s;
};

const cellRef = (c, r) => `${colLetter(c)}${r + 1}`;

/** Calculate CRC32 for standard ZIP entries */
const crc32Table = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[i] = c;
    }
    return table;
})();

function calculateCrc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc = crc32Table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

/** Build XML for a worksheet */
function buildSheetXml(sheet, sharedStrings, ssMap) {
    const rows = sheet.rows || [];
    if (rows.length === 0) {
        if (!ssMap.has('No Records')) {
            ssMap.set('No Records', sharedStrings.length);
            sharedStrings.push('No Records');
        }
        const ssi = ssMap.get('No Records');
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="16"/>
  <cols><col min="1" max="1" width="20" bestFit="1" customWidth="1"/></cols>
  <sheetData><row r="1"><c r="A1" s="0" t="s"><v>${ssi}</v></c></row></sheetData>
</worksheet>`;
    }

    const headerRowIdx = sheet.headerRowIndex ?? (rows.findIndex((r) => sheet.headerRows?.has?.(r)) !== -1 ? sheet.headerRowIndex : 5);
    const autoFilterRef = sheet.autoFilterRange || null;
    const freezeHeader = sheet.freezeHeader !== false;

    let rowsXml = '';

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        let cellsXml = '';
        const isHeader = sheet.headerRows?.has(r);
        const isSection = sheet.sectionRows?.has(r);
        const isSummary = sheet.summaryRows?.has(r);

        for (let c = 0; c < row.length; c++) {
            const val = row[c];
            const ref = cellRef(c, r);

            if (val === null || val === undefined || val === '') {
                cellsXml += `<c r="${ref}"/>`;
                continue;
            }

            const num = typeof val === 'number' ? val : Number(val);
            const isNum = !Number.isNaN(num) && typeof val === 'number' && Number.isFinite(val);

            if (isNum) {
                // Style: 4 = summary bold number, 5 = integer count, 3 = decimal number
                const isInteger = Number.isInteger(num);
                const sIdx = isSummary ? 4 : isInteger ? 5 : 3;
                cellsXml += `<c r="${ref}" s="${sIdx}" t="n"><v>${num}</v></c>`;
            } else {
                // Prevent formula injection in text strings
                let textVal = String(val);
                const trimmed = textVal.replace(/^[\s\uFEFF\xA0]+/, '');
                if (/^[=+\-@\t\r]/.test(trimmed) && !/^[-+]?\d+(\.\d+)?$/.test(trimmed)) {
                    textVal = "'" + textVal;
                }

                if (!ssMap.has(textVal)) {
                    ssMap.set(textVal, sharedStrings.length);
                    sharedStrings.push(textVal);
                }
                const ssi = ssMap.get(textVal);

                // Style: 1 = header bold, 2 = section gray, 4 = summary, 0 = normal
                const sIdx = isHeader ? 1 : isSection ? 2 : isSummary ? 4 : 0;
                cellsXml += `<c r="${ref}" s="${sIdx}" t="s"><v>${ssi}</v></c>`;
            }
        }

        const customHeight = isHeader ? ' customHeight="1" ht="24"' : isSummary ? ' customHeight="1" ht="20"' : '';
        rowsXml += `<row r="${r + 1}"${customHeight}>${cellsXml}</row>`;
    }

    // Auto calculate column widths
    const colWidths = [];
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
            const len = String(rows[r][c] ?? '').length;
            colWidths[c] = Math.min(45, Math.max(colWidths[c] || 10, len + 3));
        }
    }
    const colsXml = colWidths
        .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" bestFit="1" customWidth="1"/>`)
        .join('');

    // Sheet views (frozen pane)
    let sheetViewsXml = '<sheetViews><sheetView tabSelected="1" workbookViewId="0">';
    if (freezeHeader && headerRowIdx !== null && headerRowIdx >= 0) {
        const splitRow = headerRowIdx + 1; // 1-based split
        sheetViewsXml += `<pane ySplit="${splitRow}" topLeftCell="A${splitRow + 1}" activePane="bottomLeft" state="frozen"/>`;
    }
    sheetViewsXml += '<selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>';

    // AutoFilter
    const autoFilterXml = autoFilterRef ? `<autoFilter ref="${autoFilterRef}"/>` : '';

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  ${sheetViewsXml}
  <sheetFormatPr defaultRowHeight="16"/>
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  ${autoFilterXml}
</worksheet>`;
}

/** Build Open XML styles with brand green header accents */
function buildStylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="5">
    <font><sz val="10"/><name val="Segoe UI"/></font>
    <font><b/><sz val="10"/><name val="Segoe UI"/><color rgb="FFFFFFFF"/></font>
    <font><b/><sz val="11"/><name val="Segoe UI"/><color rgb="FF0F172A"/></font>
    <font><i/><sz val="9.5"/><name val="Segoe UI"/><color rgb="FF64748B"/></font>
    <font><b/><sz val="10"/><name val="Segoe UI"/><color rgb="FF0F172A"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF059669"/></fill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></fill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
    </border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FF94A3B8"/></top>
      <bottom style="double"><color rgb="FF0F172A"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <!-- 0: Normal -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <!-- 1: Header (Brand green background, white bold text) -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <!-- 2: Section/Subheader (light gray fill, dark bold) -->
    <xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
    <!-- 3: Numeric (2 decimals) -->
    <xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right"/>
    </xf>
    <!-- 4: Summary / Total row (Bold, double bottom border) -->
    <xf numFmtId="4" fontId="4" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right"/>
    </xf>
    <!-- 5: Integer count (no decimal places) -->
    <xf numFmtId="1" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right"/>
    </xf>
  </cellXfs>
</styleSheet>`;
}

/** Build Shared Strings XML */
function buildSharedStringsXml(strings) {
    const items = strings.map((s) => `<si><t xml:space="preserve">${xmlEsc(s)}</t></si>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
${items}
</sst>`;
}

/** Build workbook XML */
function buildWorkbookXml(sheetNames) {
    const sheets = sheetNames
        .map((n, i) => `<sheet name="${xmlEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 2}"/>`)
        .join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheets}</sheets>
</workbook>`;
}

/** Build workbook relationships XML */
function buildWorkbookRels(sheetCount) {
    let rels = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>';
    for (let i = 0; i < sheetCount; i++) {
        rels += `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`;
    }
    rels += `<Relationship Id="rId${sheetCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels}
</Relationships>`;
}

/**
 * Assemble multiple files into a standard compressed PKZIP buffer.
 * Uses Node.js built-in zlib.deflateRawSync for optimal compression.
 *
 * @param {Record<string, string|Buffer>} filesMap
 * @returns {Buffer} Valid ZIP binary buffer
 */
function createZipArchive(filesMap) {
    const localHeaders = [];
    const cdEntries = [];
    let offset = 0;

    for (const [filePath, content] of Object.entries(filesMap)) {
        const nameBytes = Buffer.from(filePath, 'utf8');
        const rawData = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
        const crc = calculateCrc32(rawData);
        const uncompressedSize = rawData.length;

        // Compress with DEFLATE (level 6)
        const compressedData = zlib.deflateRawSync(rawData, { level: 6 });
        const compressedSize = compressedData.length;

        // Local header (0x04034b50)
        const localHeader = Buffer.alloc(30 + nameBytes.length);
        localHeader.writeUInt32LE(0x04034b50, 0); // Signature
        localHeader.writeUInt16LE(20, 4);         // Version needed: 2.0
        localHeader.writeUInt16LE(0, 6);          // General flags
        localHeader.writeUInt16LE(8, 8);          // Compression: DEFLATE (8)
        localHeader.writeUInt16LE(0, 10);         // Last mod time
        localHeader.writeUInt16LE(0, 12);         // Last mod date
        localHeader.writeUInt32LE(crc, 14);       // CRC32
        localHeader.writeUInt32LE(compressedSize, 18);
        localHeader.writeUInt32LE(uncompressedSize, 22);
        localHeader.writeUInt16LE(nameBytes.length, 26);
        localHeader.writeUInt16LE(0, 28);         // Extra field length
        nameBytes.copy(localHeader, 30);

        localHeaders.push(localHeader, compressedData);

        // Central Directory Entry (0x02014b50)
        const cdEntry = Buffer.alloc(46 + nameBytes.length);
        cdEntry.writeUInt32LE(0x02014b50, 0);
        cdEntry.writeUInt16LE(20, 4); // Made by
        cdEntry.writeUInt16LE(20, 6); // Version needed
        cdEntry.writeUInt16LE(0, 8);  // Flags
        cdEntry.writeUInt16LE(8, 10); // DEFLATE
        cdEntry.writeUInt16LE(0, 12);
        cdEntry.writeUInt16LE(0, 14);
        cdEntry.writeUInt32LE(crc, 16);
        cdEntry.writeUInt32LE(compressedSize, 20);
        cdEntry.writeUInt32LE(uncompressedSize, 24);
        cdEntry.writeUInt16LE(nameBytes.length, 28);
        cdEntry.writeUInt16LE(0, 30); // Extra field
        cdEntry.writeUInt16LE(0, 32); // Comment
        cdEntry.writeUInt16LE(0, 34); // Disk #
        cdEntry.writeUInt16LE(0, 36); // Internal attr
        cdEntry.writeUInt32LE(0, 38); // External attr
        cdEntry.writeUInt32LE(offset, 42); // Relative offset
        nameBytes.copy(cdEntry, 46);

        cdEntries.push(cdEntry);
        offset += localHeader.length + compressedData.length;
    }

    const localBuffer = Buffer.concat(localHeaders);
    const cdBuffer = Buffer.concat(cdEntries);
    const cdOffset = localBuffer.length;
    const cdSize = cdBuffer.length;
    const totalFiles = Object.keys(filesMap).length;

    // End of Central Directory (0x06054b50)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4);          // Disk number
    eocd.writeUInt16LE(0, 6);          // Disk with CD
    eocd.writeUInt16LE(totalFiles, 8); // Entries on this disk
    eocd.writeUInt16LE(totalFiles, 10);// Total entries
    eocd.writeUInt32LE(cdSize, 12);    // Size of CD
    eocd.writeUInt32LE(cdOffset, 16);  // Offset of CD
    eocd.writeUInt16LE(0, 20);         // Comment length

    return Buffer.concat([localBuffer, cdBuffer, eocd]);
}

/**
 * Generate a complete, compressed, multi-sheet .xlsx file.
 *
 * @param {Array<{ name: string, rows: Array<Array<any>>, headerRows?: Set<number>, sectionRows?: Set<number>, summaryRows?: Set<number>, headerRowIndex?: number, autoFilterRange?: string }>} sheets
 * @returns {Buffer} Valid .xlsx binary Buffer
 */
function generateXlsx(sheets) {
    const sharedStrings = [];
    const ssMap = new Map();
    const sheetXmls = [];

    for (const sheet of sheets) {
        const xml = buildSheetXml(sheet, sharedStrings, ssMap);
        sheetXmls.push(xml);
    }

    const sheetOverrides = sheets
        .map((_, i) => `  <Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
        .join('\n');

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml"        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/sharedStrings.xml"   ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/xl/styles.xml"          ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheetOverrides}
</Types>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const files = {
        '[Content_Types].xml': contentTypesXml,
        '_rels/.rels': rootRelsXml,
        'xl/workbook.xml': buildWorkbookXml(sheets.map((s) => s.name)),
        'xl/_rels/workbook.xml.rels': buildWorkbookRels(sheets.length),
        'xl/styles.xml': buildStylesXml(),
        'xl/sharedStrings.xml': buildSharedStringsXml(sharedStrings)
    };

    sheetXmls.forEach((xml, i) => {
        files[`xl/worksheets/sheet${i + 1}.xml`] = xml;
    });

    return createZipArchive(files);
}

// ============================================================================
// 3. TABULAR VECTOR PDF GENERATOR (A4 Landscape with Brand Green & Logo)
// ============================================================================

let cachedLogo = null;

/**
 * Load and cache company logo as a deflated RGB thumbnail for embedding in PDF reports.
 * Downsamples the 1536x1024 RGBA image to 192x128 RGB deflated stream (~19.4KB).
 *
 * @returns {{ width: number, height: number, deflatedData: Buffer } | false}
 */
function getCompanyLogo() {
    if (cachedLogo !== null) return cachedLogo;

    const candidates = [
        path.join(__dirname, '../../public/assets/logo.png'),
        path.join(__dirname, '../../public/assets/LOGO.png'),
        path.join(process.cwd(), 'backend/public/assets/logo.png'),
        path.join(process.cwd(), 'public/assets/logo.png'),
        path.join(__dirname, '../public/assets/logo.png')
    ];

    let logoPath = null;
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            logoPath = p;
            break;
        }
    }

    if (!logoPath) {
        cachedLogo = false;
        return false;
    }

    try {
        const buf = fs.readFileSync(logoPath);
        let pos = 8;
        const idats = [];
        let srcW = 0, srcH = 0;

        while (pos < buf.length) {
            const len = buf.readUInt32BE(pos);
            const type = buf.toString('ascii', pos + 4, pos + 8);
            if (type === 'IHDR') {
                srcW = buf.readUInt32BE(pos + 8);
                srcH = buf.readUInt32BE(pos + 12);
            } else if (type === 'IDAT') {
                idats.push(buf.slice(pos + 8, pos + 8 + len));
            } else if (type === 'IEND') {
                break;
            }
            pos += 12 + len;
        }

        if (idats.length === 0 || srcW === 0 || srcH === 0) {
            cachedLogo = false;
            return false;
        }

        const raw = zlib.inflateSync(Buffer.concat(idats));
        const bpp = 4;
        const stride = 1 + srcW * bpp;
        const img = Buffer.alloc(srcW * srcH * 4);
        let prevRow = Buffer.alloc(srcW * bpp);

        for (let y = 0; y < srcH; y++) {
            const filter = raw[y * stride];
            const row = Buffer.alloc(srcW * bpp);
            for (let x = 0; x < srcW * bpp; x++) {
                const rawByte = raw[y * stride + 1 + x];
                const a = x >= bpp ? row[x - bpp] : 0;
                const b = prevRow[x];
                const c = x >= bpp ? prevRow[x - bpp] : 0;
                let val = rawByte;
                if (filter === 1) val = (rawByte + a) & 0xff;
                else if (filter === 2) val = (rawByte + b) & 0xff;
                else if (filter === 3) val = (rawByte + Math.floor((a + b) / 2)) & 0xff;
                else if (filter === 4) {
                    const p = a + b - c;
                    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
                    const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
                    val = (rawByte + pr) & 0xff;
                }
                row[x] = val;
            }
            row.copy(img, y * srcW * bpp);
            prevRow = row;
        }

        // Downsample to 192 x 128 (maintaining 3:2 aspect ratio)
        const targetW = 192;
        const targetH = 128;
        const rgb = Buffer.alloc(targetW * targetH * 3);
        const scaleX = srcW / targetW;
        const scaleY = srcH / targetH;

        for (let ty = 0; ty < targetH; ty++) {
            for (let tx = 0; tx < targetW; tx++) {
                const sx = Math.floor(tx * scaleX);
                const sy = Math.floor(ty * scaleY);
                const srcIdx = (sy * srcW + sx) * 4;
                const r = img[srcIdx];
                const g = img[srcIdx + 1];
                const b = img[srcIdx + 2];
                const a = img[srcIdx + 3] / 255;
                const dstIdx = (ty * targetW + tx) * 3;
                // Composite over clean white background
                rgb[dstIdx] = Math.round(r * a + 255 * (1 - a));
                rgb[dstIdx + 1] = Math.round(g * a + 255 * (1 - a));
                rgb[dstIdx + 2] = Math.round(b * a + 255 * (1 - a));
            }
        }

        const deflated = zlib.deflateSync(rgb, { level: 9 });
        cachedLogo = {
            width: targetW,
            height: targetH,
            deflatedData: deflated
        };
        return cachedLogo;
    } catch {
        cachedLogo = false;
        return false;
    }
}

/**
 * Standard PDF 1.4 Vector Tabular Generator
 * Produces structured A4 landscape reports with headers, brand green accents,
 * embedded company logo, alternating rows, summary lines, and page numbers.
 *
 * @param {string} title - Report title
 * @param {Array<{ key: string, label: string, width?: number, align?: 'left'|'right'|'center' }>} columns
 * @param {Array<Record<string, any>>} data - Records to render
 * @param {Object} metadata - Context info (e.g. dateRange, totalCount, summaryRow)
 * @returns {Buffer} PDF binary buffer
 */
function generatePdf(title, columns, data = [], metadata = {}) {
    const pageWidth = 841.89; // A4 Landscape width in pt
    const pageHeight = 595.28; // A4 Landscape height in pt
    const margin = 36; // 0.5 inch margins
    const usableWidth = pageWidth - margin * 2;
    const headerHeight = 24;
    const rowHeight = 18;
    const topMargin = 85;
    const bottomMargin = 40;
    const maxRowsPerPage = Math.floor((pageHeight - topMargin - bottomMargin - headerHeight) / rowHeight);

    // Compute column widths proportionally
    const totalExplicitWidth = columns.reduce((s, c) => s + (c.width || 100), 0);
    const colLayout = columns.map((col) => ({
        ...col,
        renderedWidth: Math.floor(((col.width || 100) / totalExplicitWidth) * usableWidth)
    }));

    // Split data into pages
    const pages = [];
    for (let i = 0; i < Math.max(1, data.length); i += maxRowsPerPage) {
        pages.push(data.slice(i, i + maxRowsPerPage));
    }

    // Pre-allocate slots 0..4 for objects 1..5 (Catalog, Outlines, Pages Tree, FontNormal, FontBold)
    const objects = [null, null, null, null, null];
    const addObject = (content) => {
        objects.push(content);
        return objects.length; // 1-indexed object id (>= 6)
    };

    // Object 1: Catalog
    // Object 2: Outlines
    // Object 3: Pages tree
    // Object 4: Font Helvetica
    // Object 5: Font Helvetica-Bold
    const fontNormalId = 4;
    const fontBoldId = 5;

    // Load logo if available
    const logo = getCompanyLogo();
    let logoObjId = null;
    if (logo) {
        const imgHeader = Buffer.from(
            `<< /Type /XObject\n   /Subtype /Image\n   /Width ${logo.width}\n   /Height ${logo.height}\n   /ColorSpace /DeviceRGB\n   /BitsPerComponent 8\n   /Filter /FlateDecode\n   /Length ${logo.deflatedData.length}\n>>\nstream\n`,
            'ascii'
        );
        const imgFooter = Buffer.from('\nendstream', 'ascii');
        logoObjId = addObject(Buffer.concat([imgHeader, logo.deflatedData, imgFooter]));
    }

    const pageObjectIds = [];
    const dateStamp = metadata.generatedAt || new Date().toISOString().slice(0, 10);
    const filterInfo = metadata.dateRange ? `Date Range: ${metadata.dateRange}` : '';
    const totalRecordsText = `Total Records: ${data.length}`;

    // Build page content streams
    pages.forEach((pageRows, pageIdx) => {
        let stream = '';

        // Brand Green Colors: #059669 -> 0.02, 0.588, 0.412
        const primaryFill = '0.02 0.588 0.412 rg';
        const darkText = '0.06 0.09 0.16 rg';
        const grayText = '0.39 0.45 0.54 rg';
        const borderStroke = '0.88 0.91 0.94 RG';
        const altRowBg = '0.96 0.97 0.98 rg';

        // 1. Top Report Header (Title + Metadata)
        stream += 'BT\n';
        stream += `/F2 16 Tf\n${primaryFill}\n`;
        stream += `${margin} ${pageHeight - 38} Td\n(FoodieHub - ${escapePdfString(title)}) Tj\n`;
        stream += 'ET\n';

        stream += 'BT\n';
        stream += `/F1 9 Tf\n${grayText}\n`;
        stream += `${margin} ${pageHeight - 52} Td\n(Generated: ${escapePdfString(dateStamp)}   |   ${escapePdfString(filterInfo)}   |   ${escapePdfString(totalRecordsText)}) Tj\n`;
        stream += 'ET\n';

        // Embed Company Logo at Top Right
        if (logoObjId) {
            const logoW = 60;
            const logoH = 40;
            const logoX = pageWidth - margin - logoW;
            const logoY = pageHeight - 65;
            stream += `q\n${logoW} 0 0 ${logoH} ${logoX} ${logoY} cm\n/Im1 Do\nQ\n`;
        }

        // 2. Table Header Background Bar
        const tableTopY = pageHeight - topMargin;
        stream += `q\n${primaryFill}\n${margin} ${tableTopY - headerHeight} ${usableWidth} ${headerHeight} re f\nQ\n`;

        // 3. Table Header Text
        let colX = margin;
        colLayout.forEach((col) => {
            const label = String(col.label || col.key);
            const escapedLabel = escapePdfString(label);
            const approxWidth = escapedLabel.length * 5.2;
            const textX = col.align === 'right'
                ? Math.max(colX + 4, colX + col.renderedWidth - approxWidth - 6)
                : colX + 6;

            stream += 'BT\n';
            stream += '/F2 9.5 Tf\n1 1 1 rg\n'; // White bold text
            stream += `${textX} ${tableTopY - 16} Td\n(${escapedLabel}) Tj\n`;
            stream += 'ET\n';
            colX += col.renderedWidth;
        });

        // 4. Data Rows or Empty State
        if (pageRows.length === 0) {
            const emptyY = tableTopY - headerHeight - 20;
            stream += 'BT\n';
            stream += `/F1 10 Tf\n${grayText}\n`;
            stream += `${margin + 12} ${emptyY} Td\n(No records found matching the active filters or scope.) Tj\n`;
            stream += 'ET\n';
        } else {
            pageRows.forEach((row, rowIdx) => {
                const currentY = tableTopY - headerHeight - (rowIdx + 1) * rowHeight;

                // Alternating row background
                if (rowIdx % 2 === 1) {
                    stream += `q\n${altRowBg}\n${margin} ${currentY} ${usableWidth} ${rowHeight} re f\nQ\n`;
                }

                // Bottom row border
                stream += `q\n${borderStroke}\n0.5 w\n${margin} ${currentY} m ${margin + usableWidth} ${currentY} l S\nQ\n`;

                let cellX = margin;
                colLayout.forEach((col) => {
                    let val = row[col.key];
                    if (val === null || val === undefined) val = '-';
                    else if (typeof val === 'number') {
                        val = Number.isInteger(val) ? String(val) : val.toFixed(2);
                    } else if (typeof val === 'boolean') {
                        val = val ? 'Yes' : 'No';
                    } else {
                        val = String(val);
                    }

                    // Truncate text if unusually long to prevent overflow
                    const maxChars = Math.max(4, Math.floor(col.renderedWidth / 5.5));
                    if (val.length > maxChars) {
                        val = val.slice(0, maxChars - 3) + '...';
                    }

                    const escapedVal = escapePdfString(val);
                    const approxWidth = escapedVal.length * 5.0;
                    const textX = col.align === 'right'
                        ? Math.max(cellX + 4, cellX + col.renderedWidth - approxWidth - 6)
                        : cellX + 6;

                    stream += 'BT\n';
                    stream += `/F1 9 Tf\n${darkText}\n`;
                    stream += `${textX} ${currentY + 5} Td\n(${escapedVal}) Tj\n`;
                    stream += 'ET\n';

                    cellX += col.renderedWidth;
                });
            });
        }

        // Render Summary / Totals Row on the last page if provided
        if (metadata.summaryRow && pageIdx === pages.length - 1 && pageRows.length > 0) {
            const summaryY = tableTopY - headerHeight - (pageRows.length + 1) * rowHeight;
            // Draw summary background bar
            stream += `q\n${altRowBg}\n${margin} ${summaryY} ${usableWidth} ${rowHeight} re f\nQ\n`;
            // Top stroke
            stream += `q\n0.15 0.23 0.36 RG\n1 w\n${margin} ${summaryY + rowHeight} m ${margin + usableWidth} ${summaryY + rowHeight} l S\nQ\n`;
            // Bottom stroke
            stream += `q\n0.15 0.23 0.36 RG\n1 w\n${margin} ${summaryY} m ${margin + usableWidth} ${summaryY} l S\nQ\n`;

            let sumCellX = margin;
            colLayout.forEach((col, idx) => {
                let sumVal = '';
                if (idx === 0) {
                    sumVal = metadata.summaryRow.label || 'TOTALS';
                } else if (metadata.summaryRow.values && metadata.summaryRow.values[col.key] !== undefined) {
                    sumVal = String(metadata.summaryRow.values[col.key]);
                }

                if (sumVal) {
                    const escapedSum = escapePdfString(sumVal);
                    const approxWidth = escapedSum.length * 5.2;
                    const textX = col.align === 'right'
                        ? Math.max(sumCellX + 4, sumCellX + col.renderedWidth - approxWidth - 6)
                        : sumCellX + 6;

                    stream += 'BT\n';
                    stream += `/F2 9.5 Tf\n${darkText}\n`;
                    stream += `${textX} ${summaryY + 5} Td\n(${escapedSum}) Tj\n`;
                    stream += 'ET\n';
                }
                sumCellX += col.renderedWidth;
            });
        }

        // 5. Page Number in Footer
        const pageNumText = `Page ${pageIdx + 1} of ${pages.length}`;
        stream += 'BT\n';
        stream += `/F1 8.5 Tf\n${grayText}\n`;
        stream += `${pageWidth - margin - 80} 20 Td\n(${pageNumText}) Tj\n`;
        stream += 'ET\n';

        stream += 'BT\n';
        stream += `/F1 8.5 Tf\n${grayText}\n`;
        stream += `${margin} 20 Td\n(Confidential - FoodieHub Administrative Operations) Tj\n`;
        stream += 'ET\n';

        // Content stream object
        const contentStreamId = addObject(
            `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`
        );

        // Page object with optional XObject Image resource
        const xObjRes = logoObjId ? `/XObject << /Im1 ${logoObjId} 0 R >>` : '';
        const pageId = addObject(
            `<< /Type /Page\n   /Parent 3 0 R\n   /MediaBox [0 0 ${pageWidth} ${pageHeight}]\n   /Contents ${contentStreamId} 0 R\n   /Resources << /Font << /F1 ${fontNormalId} 0 R /F2 ${fontBoldId} 0 R >> ${xObjRes} >>\n>>`
        );
        pageObjectIds.push(pageId);
    });

    // Object 1: Catalog
    const catalog = `<< /Type /Catalog /Pages 3 0 R >>`;
    // Object 2: Outlines
    const outlines = `<< /Type /Outlines /Count 0 >>`;
    // Object 3: Pages Tree
    const kids = pageObjectIds.map((id) => `${id} 0 R`).join(' ');
    const pagesTree = `<< /Type /Pages /Kids [${kids}] /Count ${pageObjectIds.length} >>`;
    // Object 4: Font Helvetica
    const fontNormal = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
    // Object 5: Font Helvetica-Bold
    const fontBold = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;

    // Put fixed objects in their slots
    objects[0] = catalog;
    objects[1] = outlines;
    objects[2] = pagesTree;
    objects[3] = fontNormal;
    objects[4] = fontBold;

    // Build the final PDF binary buffer preserving binary image streams
    const chunks = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'utf8')];
    let curOffset = chunks[0].length;
    const xrefOffsets = [0];

    for (let i = 0; i < objects.length; i++) {
        xrefOffsets.push(curOffset);
        const objHead = Buffer.from(`${i + 1} 0 obj\n`, 'utf8');
        const objBody = Buffer.isBuffer(objects[i])
            ? objects[i]
            : Buffer.from(String(objects[i]), 'utf8');
        const objTail = Buffer.from('\nendobj\n', 'utf8');
        chunks.push(objHead, objBody, objTail);
        curOffset += objHead.length + objBody.length + objTail.length;
    }

    const startXref = curOffset;
    let xrefStr = `xref\n0 ${objects.length + 1}\n`;
    xrefStr += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i++) {
        xrefStr += `${String(xrefOffsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    xrefStr += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    chunks.push(Buffer.from(xrefStr, 'utf8'));

    return Buffer.concat(chunks);
}

// ============================================================================
// 4. SAFE FILENAME SANITIZATION (Header Injection Protection)
// ============================================================================

/**
 * Sanitize a filename to prevent HTTP Response Header Injection and path traversal.
 * Strips \r, \n, quotes, control chars, path delimiters, and limits length.
 *
 * @param {string} rawName - User or generated filename
 * @param {string} extension - Expected extension (e.g. '.csv', '.xlsx', '.pdf')
 * @returns {string} Safe ASCII filename
 */
function sanitizeFilename(rawName, extension = '') {
    if (!rawName || typeof rawName !== 'string') {
        rawName = 'report';
    }

    // Strip carriage returns, newlines, control characters, quotes, and slashes
    let safe = rawName
        .replace(/[\r\n\0\x08\x09\x1a"'\\/;:*?<>|]+/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^[._]+|[._]+$/g, '')
        .slice(0, 60);

    if (!safe) safe = 'report';

    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    if (!safe.toLowerCase().endsWith(ext.toLowerCase())) {
        safe += ext;
    }

    return safe;
}

module.exports = {
    sanitizeCsvValue,
    formatCsvField,
    generateCsv,
    generateXlsx,
    generatePdf,
    sanitizeFilename,
    escapePdfString,
    xmlEsc,
    getCompanyLogo
};
