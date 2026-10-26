/**
 * Food Hub Admin — Report Export Utility
 * Supports: CSV, real XLSX (Open XML via JSZip-free binary), and Print/PDF
 *
 * Excel (.xlsx) generation is done without any external library by
 * manually assembling the Open XML ZIP structure using a minimal
 * pure-JS ZIP builder included below.
 */

// ─────────────────────────────────────────────
// CSV helpers with Formula Injection Mitigation
// ─────────────────────────────────────────────
const sanitizeCsvValue = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'number') {
    if (Number.isNaN(val) || !Number.isFinite(val)) return '';
    return val;
  }

  const str = String(val);

  // If it is a clean numeric string, keep as-is
  if (/^[-+]?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(str.trim())) {
    return str.trim();
  }

  // Prepend single quote if string starts with formula trigger characters
  const trimmed = str.replace(/^[\s\uFEFF\xA0]+/, '');
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return "'" + str;
  }

  return str;
};

const formatCSVField = (val) => {
  const sanitized = sanitizeCsvValue(val);
  const str = String(sanitized).replace(/"/g, '""');
  return `"${str}"`;
};

const triggerDownload = (content, fileName, mimeType) => {
  const blob =
    content instanceof Uint8Array
      ? new Blob([content], { type: mimeType })
      : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ─────────────────────────────────────────────
// Minimal pure-JS XLSX builder (Open XML / OOXML)
// Produces a valid .xlsx that Excel, LibreOffice, and Google Sheets open natively.
// ─────────────────────────────────────────────

/** Escape a string for XML content and strip invalid XML 1.0 control characters */
const xmlEsc = (s) =>
  String(s ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Convert a column index (0-based) to Excel letter(s): 0→A, 25→Z, 26→AA */
const colLetter = (n) => {
  let s = '';
  let col = n;
  while (col >= 0) {
    s = String.fromCharCode(65 + (col % 26)) + s;
    col = Math.floor(col / 26) - 1;
  }
  return s;
};

/** Cell reference: colIdx, rowIdx (both 0-based) → "A1" */
const cellRef = (c, r) => `${colLetter(c)}${r + 1}`;

/**
 * Build the XML for a single worksheet.
 * @param {Array<Array<string|number>>} rows  - 2D array of cell values
 * @param {Object} opts
 * @param {Set<number>} opts.headerRows        - Row indices (0-based) to style as bold header
 * @param {Set<number>} opts.sectionRows       - Row indices to style as section title (italic/gray)
 * @param {number} sharedStringsIdx            - Starting index in shared strings table
 * @param {string[]} sharedStrings             - Mutable array to push strings into
 */
const buildSheetXml = (rows, opts, sharedStringsIdx, sharedStrings) => {
  const ssMap = new Map(); // string → shared strings index
  const getSSI = (s) => {
    let key = String(s ?? '');
    // Prevent formula injection in text strings
    const trimmed = key.replace(/^[\s\uFEFF\xA0]+/, '');
    if (/^[=+\-@\t\r]/.test(trimmed) && !/^[-+]?\d+(\.\d+)?$/.test(trimmed)) {
      key = "'" + key;
    }
    if (!ssMap.has(key)) {
      ssMap.set(key, sharedStringsIdx + sharedStrings.length);
      sharedStrings.push(key);
    }
    return ssMap.get(key);
  };

  if (!rows || rows.length === 0) {
    const ssi = getSSI('No Records');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView tabSelected="1" workbookViewId="0"><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="16"/>
  <cols><col min="1" max="1" width="16" bestFit="1" customWidth="1"/></cols>
  <sheetData><row r="1"><c r="A1" s="0" t="s"><v>${ssi}</v></c></row></sheetData>
</worksheet>`;
  }

  let cellsXml = '';
  let rowsXml = '';

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    cellsXml = '';

    // Pick style index
    // 0 = normal, 1 = bold header, 2 = section gray, 3 = number, 4 = currency
    const isHeader = opts?.headerRows?.has(r);
    const isSection = opts?.sectionRows?.has(r);

    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      const ref = cellRef(c, r);

      if (val === null || val === undefined || val === '') {
        cellsXml += `<c r="${ref}"/>`;
        continue;
      }

      const num = typeof val === 'number' ? val : Number(val);
      const isNum = !Number.isNaN(num) && typeof val === 'number';

      if (isNum) {
        const sIdx = 3; // number style
        cellsXml += `<c r="${ref}" s="${sIdx}" t="n"><v>${num}</v></c>`;
      } else {
        const ssi = getSSI(val);
        const sIdx = isHeader ? 1 : isSection ? 2 : 0;
        cellsXml += `<c r="${ref}" s="${sIdx}" t="s"><v>${ssi}</v></c>`;
      }
    }

    rowsXml += `<row r="${r + 1}">${cellsXml}</row>`;
  }

  // Compute column widths (min 8, max 40, based on max content length per col)
  const colWidths = [];
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const len = String(rows[r][c] ?? '').length;
      colWidths[c] = Math.min(40, Math.max(colWidths[c] || 8, len + 2));
    }
  }
  const colsXml = colWidths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" bestFit="1" customWidth="1"/>`)
    .join('');

  const headerIdx = opts?.headerRows ? Math.min(...opts.headerRows) : 5;
  const splitRow = Number.isFinite(headerIdx) ? headerIdx + 1 : 6;
  const lastColLetter = colLetter(Math.max(0, (rows[0]?.length || 1) - 1));
  const autoFilterXml = rows.length > splitRow ? `<autoFilter ref="A${splitRow}:${lastColLetter}${rows.length}"/>` : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0">
      <pane ySplit="${splitRow}" topLeftCell="A${splitRow + 1}" activePane="bottomLeft" state="frozen"/>
      <selection activeCell="A1" sqref="A1"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="16"/>
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  ${autoFilterXml}
</worksheet>`;
};

/** Build the styles XML with 5 cell styles: normal, bold, section, number, currency */
const buildStylesXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="10"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><name val="Calibri"/><color rgb="FF059669"/></font>
    <font><i/><sz val="10"/><name val="Calibri"/><color rgb="FF64748B"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/><color rgb="FF0F172A"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="5">
    <xf numFmtId="0"  fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="0"  fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0"  fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="2"  fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyNumberFormat="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyNumberFormat="1"/>
  </cellXfs>
</styleSheet>`;

/** Build shared strings XML */
const buildSharedStringsXml = (strings) => {
  const items = strings
    .map((s) => `<si><t xml:space="preserve">${xmlEsc(s)}</t></si>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
${items}
</sst>`;
};

/** Build workbook XML for N sheets */
const buildWorkbookXml = (sheetNames) => {
  const sheets = sheetNames
    .map((n, i) => `<sheet name="${xmlEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 2}"/>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="14400" windowHeight="8700"/></bookViews>
  <sheets>${sheets}</sheets>
</workbook>`;
};

/** Build workbook relationships XML */
const buildWorkbookRels = (sheetCount) => {
  let rels = `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`;
  for (let i = 0; i < sheetCount; i++) {
    rels += `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`;
  }
  rels += `<Relationship Id="rId${sheetCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels}
</Relationships>`;
};

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml"        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/sharedStrings.xml"   ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/xl/styles.xml"          ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  {{SHEET_OVERRIDES}}
</Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

// ─────────────────────────────────────────────
// Minimal pure-JS ZIP builder
// Produces a valid ZIP (DEFLATE store-only for simplicity, all files stored uncompressed)
// ─────────────────────────────────────────────
const encodeUTF8 = (str) => new TextEncoder().encode(str);

const crc32 = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return (data) => {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };
})();

const u32le = (n) => new Uint8Array([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]);
const u16le = (n) => new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
const concat = (...bufs) => {
  const total = bufs.reduce((s, b) => s + b.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const b of bufs) { out.set(b, pos); pos += b.length; }
  return out;
};

/**
 * Build a .xlsx binary (ZIP of XML files) for multiple sheets.
 * @param {{ name: string, rows: Array<Array>, headerRows?: Set<number>, sectionRows?: Set<number> }[]} sheets
 * @returns {Uint8Array}
 */
const buildXlsx = (sheets) => {
  const sharedStrings = [];
  const sheetXmls = [];

  for (const sheet of sheets) {
    const xml = buildSheetXml(
      sheet.rows,
      { headerRows: sheet.headerRows, sectionRows: sheet.sectionRows },
      sharedStrings.length,
      sharedStrings
    );
    sheetXmls.push(xml);
  }

  const sheetOverrides = sheets
    .map((_, i) => `  <Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
    .join('\n');

  const files = {
    '[Content_Types].xml': CONTENT_TYPES_XML.replace('{{SHEET_OVERRIDES}}', sheetOverrides),
    '_rels/.rels': ROOT_RELS_XML,
    'xl/workbook.xml': buildWorkbookXml(sheets.map((s) => s.name)),
    'xl/_rels/workbook.xml.rels': buildWorkbookRels(sheets.length),
    'xl/styles.xml': buildStylesXml(),
    'xl/sharedStrings.xml': buildSharedStringsXml(sharedStrings),
  };

  sheetXmls.forEach((xml, i) => {
    files[`xl/worksheets/sheet${i + 1}.xml`] = xml;
  });

  // Build ZIP entries
  const localHeaders = [];
  const centralDir = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encodeUTF8(name);
    const data = encodeUTF8(content);
    const crc = crc32(data);
    const size = data.length;

    // Local file header (signature 0x04034b50)
    const local = concat(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // signature
      u16le(20),      // version needed
      u16le(0),       // flags
      u16le(0),       // compression: stored
      u16le(0),       // mod time
      u16le(0),       // mod date
      u32le(crc),
      u32le(size),    // compressed size
      u32le(size),    // uncompressed size
      u16le(nameBytes.length),
      u16le(0),       // extra field length
      nameBytes,
      data
    );
    localHeaders.push(local);

    // Central directory entry (signature 0x02014b50)
    const cd = concat(
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
      u16le(20),  // version made by
      u16le(20),  // version needed
      u16le(0),   // flags
      u16le(0),   // compression: stored
      u16le(0),   // mod time
      u16le(0),   // mod date
      u32le(crc),
      u32le(size),
      u32le(size),
      u16le(nameBytes.length),
      u16le(0),   // extra
      u16le(0),   // comment
      u16le(0),   // disk start
      u16le(0),   // internal attrs
      u32le(0),   // external attrs
      u32le(offset),
      nameBytes
    );
    centralDir.push(cd);
    offset += local.length;
  }

  const localPart = concat(...localHeaders);
  const cdPart = concat(...centralDir);
  const cdOffset = localPart.length;
  const cdSize = cdPart.length;
  const fileCount = sheets.length + Object.keys(files).length;

  // End of central directory (signature 0x06054b50)
  const eocd = concat(
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    u16le(0),                      // disk number
    u16le(0),                      // disk with CD
    u16le(centralDir.length),      // entries on disk
    u16le(centralDir.length),      // total entries
    u32le(cdSize),
    u32le(cdOffset),
    u16le(0)                       // comment length
  );

  return concat(localPart, cdPart, eocd);
};

// ─────────────────────────────────────────────
// Build report-specific sheet data
// ─────────────────────────────────────────────

/** Returns an array of { name, rows, headerRows, sectionRows } for a given report type */
const buildXlsxSheets = (reportType, reportData, filters, dateStamp) => {
  const sheets = [];

  const metaRows = [
    ['Food Hub Admin — Report Export'],
    ['Generated', dateStamp],
    ['Report Type', reportType],
    ['Date Range', filters.dateRange || 'last30days'],
    [],
  ];
  const metaSectionRows = new Set([0]);
  const metaHeaderRows = new Set();

  if (reportType === 'sales') {
    const kpis = reportData.kpis || {};
    const salesData = reportData.salesData || [];
    const topFoods = reportData.topSellingItems || [];

    // Sheet 1: Summary & KPIs
    const kpiRows = [
      ...metaRows,
      ['EXECUTIVE SUMMARY'],
      ['Metric', 'Value'],
      ['Total Revenue (ETB)', Number(kpis.totalRevenue || 0)],
      ['Total Orders', Number(kpis.totalOrders || 0)],
      ['Avg Order Value (ETB)', Number(kpis.avgOrderValue || 0)],
      ['Fulfillment Rate (%)', Number(kpis.conversionRate || 100)],
      ['Revenue Change vs Prior (%)', Number(kpis.revenueChange || 0)],
    ];
    sheets.push({ name: 'KPI Summary', rows: kpiRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

    // Sheet 2: Daily Breakdown
    const salesRows = [
      ...metaRows,
      ['DAILY SALES BREAKDOWN'],
      ['Date', 'Orders', 'Revenue (ETB)', 'Avg Order Value (ETB)'],
      ...salesData.map((r) => [
        r.date,
        Number(r.orders || 0),
        Number(r.revenue || 0),
        r.orders > 0 ? Number((r.revenue / r.orders).toFixed(2)) : 0,
      ]),
    ];
    const salesH = new Set([5, 6]);
    const salesS = new Set([0, 5]);
    sheets.push({ name: 'Daily Sales', rows: salesRows, headerRows: salesH, sectionRows: salesS });

    // Sheet 3: Top Items
    const itemRows = [
      ...metaRows,
      ['TOP SELLING ITEMS'],
      ['Rank', 'Item Name', 'Units Sold', 'Total Revenue (ETB)'],
      ...topFoods.map((f, i) => [i + 1, f.name, Number(f.count || f.orders || 0), Number(f.revenue || 0)]),
    ];
    sheets.push({ name: 'Top Items', rows: itemRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

  } else if (reportType === 'drivers') {
    const fleet = reportData.fleetSummary || {};
    const drivers = reportData.driverPerformance || [];

    const summaryRows = [
      ...metaRows,
      ['FLEET OVERVIEW'],
      ['Metric', 'Value'],
      ['Total Registered Drivers', Number(fleet.totalDrivers || drivers.length)],
      ['Available Drivers', Number(fleet.activeDrivers || 0)],
      ['Period Deliveries', Number(fleet.totalDeliveries || 0)],
      ['Courier Payouts (ETB)', Number(fleet.totalEarnings || 0)],
      ['COD Cash in Hand (ETB)', Number(fleet.totalCodCollected || 0)],
    ];
    sheets.push({ name: 'Fleet Summary', rows: summaryRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

    const rosterRows = [
      ...metaRows,
      ['COURIER ROSTER'],
      ['Driver', 'Email', 'Phone', 'Vehicle', 'Status', 'Trips', 'Earnings (ETB)', 'COD (ETB)', 'Rating'],
      ...drivers.map((d) => [
        d.driver,
        d.email || 'N/A',
        d.phone || 'N/A',
        d.vehicleType || 'Courier',
        d.isAvailable ? 'Online' : 'Offline',
        Number(d.deliveries || 0),
        Number(d.earnings || 0),
        Number(d.codCollected || 0),
        Number((d.rating || 5).toFixed(1)),
      ]),
    ];
    sheets.push({ name: 'Driver Roster', rows: rosterRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

  } else if (reportType === 'inventory') {
    const summary = reportData.summary || {};
    const items = reportData.items || reportData.inventoryAlerts || [];

    const summaryRows = [
      ...metaRows,
      ['INVENTORY OVERVIEW'],
      ['Metric', 'Value'],
      ['Total Menu Items', Number(summary.totalMenuItems || items.length)],
      ['Active Dishes', Number(summary.activeItems || 0)],
      ['Out of Stock', Number(summary.outOfStockCount || 0)],
      ['Low Velocity (<3 orders/wk)', Number(summary.lowVelocityCount || 0)],
      ['High Velocity (>10 orders/wk)', Number(summary.highDemandCount || 0)],
    ];
    sheets.push({ name: 'Inventory Summary', rows: summaryRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

    const itemRows = [
      ...metaRows,
      ['MENU ITEMS & VELOCITY'],
      ['Item Name', 'Category', 'Price (ETB)', 'Status', 'Weekly Orders', 'Qty Sold', 'Revenue (ETB)', 'Demand Tag'],
      ...items.map((item) => [
        item.name || item.item,
        item.category || 'General',
        Number(item.price || 0),
        item.isAvailable !== false ? 'In Stock' : 'Out of Stock',
        Number(item.orderCount || 0),
        Number(item.quantity || item.current || 0),
        Number(item.revenue || 0),
        item.status || (item.isAvailable === false ? 'Out of Stock' : 'Normal'),
      ]),
    ];
    sheets.push({ name: 'Menu Items', rows: itemRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

  } else if (reportType === 'sla') {
    const kpis = reportData.kpis || {};
    const delayed = reportData.delayedOrders || [];

    const kpiRows = [
      ...metaRows,
      ['SLA PERFORMANCE'],
      ['Metric', 'Value'],
      ['Target SLA (mins)', Number(kpis.targetSlaMinutes || 45)],
      ['On-Time Rate (%)', Number(kpis.onTimeRate || 95)],
      ['Total Delivered Orders', Number(kpis.totalDelivered || 0)],
      ['Avg Door-to-Door (mins)', Number(kpis.avgFulfillmentMinutes || 32)],
      ['Avg Kitchen Prep (mins)', Number(kpis.avgPrepMinutes || 18)],
      ['Avg Courier Transit (mins)', Number(kpis.avgTransitMinutes || 14)],
      ['Delayed Orders Count', Number(kpis.delayedOrdersCount || 0)],
    ];
    sheets.push({ name: 'SLA Summary', rows: kpiRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

    const delayRows = [
      ...metaRows,
      ['DELAYED DELIVERIES LOG (>45 mins)'],
      ['Order #', 'Customer', 'Driver', 'Address', 'Duration (mins)', 'Excess Late (mins)'],
      ...delayed.map((o) => [
        o.orderNumber,
        o.customerName,
        o.driverName,
        o.address,
        Number(o.durationMinutes || 0),
        Number(o.excessMinutes || 0),
      ]),
    ];
    sheets.push({ name: 'Delayed Orders', rows: delayRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

  } else if (reportType === 'financial') {
    const summary = reportData.summary || {};
    const payment = reportData.paymentBreakdown || {};
    const balances = reportData.driverCashBalances || [];
    const cashflow = reportData.dailyCashflow || [];

    const summaryRows = [
      ...metaRows,
      ['FINANCIAL OVERVIEW'],
      ['Metric', 'Value (ETB)'],
      ['Gross Merchandise Value (GMV)', Number(summary.gmv || 0)],
      ['Food Subtotal', Number(summary.foodSubtotal || 0)],
      ['Platform Net Revenue', Number(summary.platformNetRevenue || 0)],
      ['Courier Payouts', Number(summary.courierPayouts || 0)],
      ['Sales Tax Collected', Number(summary.taxesCollected || 0)],
      ['Cancelled Order Loss', Number(summary.cancelledLoss || 0)],
      [],
      ['Payment Channels'],
      ['Channel', 'Revenue (ETB)', 'Share (%)'],
      ['Online / Card', Number(payment.cardRevenue || 0), Number(payment.cardPercent || 0)],
      ['Cash on Delivery', Number(payment.codRevenue || 0), Number(payment.codPercent || 0)],
    ];
    sheets.push({ name: 'Financial Summary', rows: summaryRows, headerRows: new Set([5, 6, 11, 12]), sectionRows: new Set([0, 5, 11]) });

    const codRows = [
      ...metaRows,
      ['DRIVER COD RECONCILIATION'],
      ['Courier', 'Phone', 'COD Orders', 'Cash Collected (ETB)', 'Fees Earned (ETB)', 'Net Deposit Owed (ETB)'],
      ...balances.map((d) => [
        d.driverName,
        d.phone || 'N/A',
        Number(d.ordersCount || 0),
        Number(d.codCollected || 0),
        Number(d.deliveryFeesEarned || 0),
        Number(d.netDepositOwed || 0),
      ]),
    ];
    sheets.push({ name: 'COD Reconciliation', rows: codRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

    if (cashflow.length > 0) {
      const cfRows = [
        ...metaRows,
        ['DAILY CASHFLOW'],
        ['Date', 'Gross Spend (ETB)', 'Platform Net (ETB)'],
        ...cashflow.map((r) => [r.date, Number(r.gmv || 0), Number(r.platformNet || 0)]),
      ];
      sheets.push({ name: 'Daily Cashflow', rows: cfRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });
    }

  } else if (reportType === 'foods') {
    const foodsList = Array.isArray(reportData.foods) ? reportData.foods : Array.isArray(reportData) ? reportData : [];
    const foodRows = [
      ...metaRows,
      ['MENU CATALOG & INVENTORY'],
      ['Item Name', 'Category', 'Price (ETB)', 'Status', 'Rating', 'Stock', 'Threshold', 'Vegetarian'],
      ...foodsList.map((f) => [
        f.name,
        f.category || 'General',
        Number(f.price || 0),
        f.isAvailable !== false ? 'In Stock' : 'Out of Stock',
        Number(f.rating || 0),
        Number(f.stockQuantity || 0),
        Number(f.lowStockThreshold || 0),
        f.isVegetarian ? 'Yes' : 'No'
      ])
    ];
    sheets.push({ name: 'Menu Items', rows: foodRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

  } else if (reportType === 'users') {
    const usersList = Array.isArray(reportData.users) ? reportData.users : Array.isArray(reportData) ? reportData : [];
    const userRows = [
      ...metaRows,
      ['USERS & FLEET ROSTER'],
      ['Full Name', 'Email', 'Phone', 'Role', 'Status', 'Vehicle', 'Deliveries'],
      ...usersList.map((u) => [
        u.name,
        u.email,
        u.phone || 'N/A',
        String(u.role || 'user').toUpperCase(),
        u.isActive !== false ? 'Active' : 'Inactive',
        u.driverProfile?.vehicleType || 'N/A',
        Number(u.driverProfile?.completedDeliveries || 0)
      ])
    ];
    sheets.push({ name: 'Users Roster', rows: userRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

  } else {
    // dashboard / orders / fallback
    const kpis = reportData.kpis || {};
    const ordersList = Array.isArray(reportData.orders) ? reportData.orders : [];
    const salesData = reportData.salesData || [];

    const kpiRows = [
      ...metaRows,
      ['EXECUTIVE SUMMARY'],
      ['Metric', 'Value'],
      ['Total Revenue (ETB)', Number(kpis.totalRevenue || 0)],
      ['Total Orders', Number(kpis.totalOrders || ordersList.length)],
      ['Avg Order Value (ETB)', Number(kpis.avgOrderValue || 0)],
    ];
    sheets.push({ name: 'Summary', rows: kpiRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });

    if (ordersList.length > 0) {
      const orderRows = [
        ...metaRows,
        ['ORDER LEDGER'],
        ['Order #', 'Date', 'Customer', 'Phone', 'Address', 'Status', 'Payment', 'Items', 'Total (ETB)'],
        ...ordersList.map((o) => [
          o.orderNumber,
          o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A',
          o.customer?.name || o.customerName || 'Customer',
          o.customer?.phone || 'N/A',
          o.deliveryStreet || o.deliveryAddress?.street || 'N/A',
          o.orderStatus,
          o.paymentMethod,
          Number(o.items?.length || 0),
          Number(o.totalAmount || 0),
        ]),
      ];
      sheets.push({ name: 'Orders', rows: orderRows, headerRows: new Set([5, 6]), sectionRows: new Set([0, 5]) });
    }
  }

  return sheets;
};

// ─────────────────────────────────────────────
// CSV builder (keep original logic, now a helper)
// ─────────────────────────────────────────────
const buildCsvLines = (reportType, reportData, filters, dateStamp) => {
  const lines = [];
  const addRow = (rowArray) => lines.push(rowArray.map(formatCSVField).join(','));

  if (reportType === 'sales') {
    const kpis = reportData.kpis || {};
    const salesData = reportData.salesData || [];
    const topFoods = reportData.topSellingItems || [];
    addRow(['Food Hub Admin - Sales & Revenue Report']);
    addRow(['Generated Date', dateStamp]);
    addRow(['Filter Date Range', filters.dateRange || 'last30days']);
    addRow([]);
    addRow(['--- EXECUTIVE SUMMARY ---']);
    addRow(['Total Revenue', `${Number(kpis.totalRevenue || 0).toFixed(2)} ETB`]);
    addRow(['Total Orders', kpis.totalOrders || 0]);
    addRow(['Average Order Value', `${Number(kpis.avgOrderValue || 0).toFixed(2)} ETB`]);
    addRow(['Fulfillment Rate', `${kpis.conversionRate || 100}%`]);
    addRow(['Revenue Change vs Prior Period', `${kpis.revenueChange || 0}%`]);
    addRow([]);
    addRow(['--- DAILY SALES BREAKDOWN ---']);
    addRow(['Date', 'Orders', 'Revenue (ETB)', 'Avg Order Value (ETB)']);
    salesData.forEach((row) => {
      const aov = row.orders > 0 ? (row.revenue / row.orders).toFixed(2) : '0.00';
      addRow([row.date, row.orders, Number(row.revenue || 0).toFixed(2), aov]);
    });
    addRow([]);
    addRow(['--- TOP SELLING ITEMS ---']);
    addRow(['Rank', 'Item Name', 'Units Sold', 'Total Revenue (ETB)']);
    topFoods.forEach((food, idx) => {
      addRow([idx + 1, food.name, food.count || food.orders, Number(food.revenue || 0).toFixed(2)]);
    });
  } else if (reportType === 'drivers') {
    const fleet = reportData.fleetSummary || {};
    const drivers = reportData.driverPerformance || [];
    addRow(['Food Hub Admin - Driver Fleet Analytics Report']);
    addRow(['Generated Date', dateStamp]);
    addRow(['Filter Date Range', filters.dateRange || 'last30days']);
    addRow([]);
    addRow(['--- FLEET OVERVIEW ---']);
    addRow(['Total Registered Drivers', fleet.totalDrivers || drivers.length]);
    addRow(['Available Drivers', fleet.activeDrivers || 0]);
    addRow(['Period Deliveries Completed', fleet.totalDeliveries || 0]);
    addRow(['Period Courier Payouts', `${Number(fleet.totalEarnings || 0).toFixed(2)} ETB`]);
    addRow(['Unremitted COD Cash in Hand', `${Number(fleet.totalCodCollected || 0).toFixed(2)} ETB`]);
    addRow([]);
    addRow(['--- COURIER ROSTER BREAKDOWN ---']);
    addRow(['Courier Name', 'Email', 'Phone', 'Vehicle', 'Status', 'Deliveries', 'Lifetime Deliveries', 'Earnings (ETB)', 'COD (ETB)', 'Rating']);
    drivers.forEach((d) => {
      addRow([d.driver, d.email || 'N/A', d.phone || 'N/A', d.vehicleType || 'Courier', d.isAvailable ? 'Online' : 'Offline', d.deliveries, d.lifetimeDeliveries || d.deliveries, Number(d.earnings || 0).toFixed(2), Number(d.codCollected || 0).toFixed(2), Number(d.rating || 5.0).toFixed(1)]);
    });
  } else if (reportType === 'inventory') {
    const summary = reportData.summary || {};
    const items = reportData.items || reportData.inventoryAlerts || [];
    addRow(['Food Hub Admin - Menu Availability & Velocity Report']);
    addRow(['Generated Date', dateStamp]);
    addRow([]);
    addRow(['--- MENU INVENTORY OVERVIEW ---']);
    addRow(['Total Menu Items', summary.totalMenuItems || items.length]);
    addRow(['Active Dishes', summary.activeItems || items.length]);
    addRow(['Out of Stock Dishes', summary.outOfStockCount || 0]);
    addRow(['Low Demand Dishes (<3 orders/wk)', summary.lowVelocityCount || 0]);
    addRow(['High Demand Dishes (>10 orders/wk)', summary.highDemandCount || 0]);
    addRow([]);
    addRow(['--- MENU ITEMS & VELOCITY STATUS ---']);
    addRow(['Item Name', 'Category', 'Price (ETB)', 'Availability', 'Weekly Orders', 'Qty Sold', 'Revenue (ETB)', 'Demand Class']);
    items.forEach((item) => {
      addRow([item.name || item.item, item.category || 'General', Number(item.price || 0).toFixed(2), item.isAvailable !== false ? 'In Stock' : 'Out of Stock', item.orderCount || 0, item.quantity || item.current || 0, Number(item.revenue || 0).toFixed(2), item.status || (item.isAvailable === false ? 'Out of Stock' : 'Normal')]);
    });
  } else if (reportType === 'sla') {
    const kpis = reportData.kpis || {};
    const delayed = reportData.delayedOrders || [];
    addRow(['Food Hub Admin - Delivery SLA & Fulfillment Report']);
    addRow(['Generated Date', dateStamp]);
    addRow([]);
    addRow(['--- SLA PERFORMANCE SUMMARY ---']);
    addRow(['Target SLA Threshold', `${kpis.targetSlaMinutes || 45} minutes`]);
    addRow(['On-Time Delivery Rate', `${kpis.onTimeRate || 95}%`]);
    addRow(['Total Delivered Orders', kpis.totalDelivered || 0]);
    addRow(['Average Door-to-Door Time', `${kpis.avgFulfillmentMinutes || 32} minutes`]);
    addRow(['Average Kitchen Prep Time', `${kpis.avgPrepMinutes || 18} minutes`]);
    addRow(['Average Courier Transit Time', `${kpis.avgTransitMinutes || 14} minutes`]);
    addRow(['Delayed Orders Count (> 45m)', kpis.delayedOrdersCount || 0]);
    addRow([]);
    addRow(['--- DELAYED DELIVERIES LOG ---']);
    addRow(['Order Number', 'Customer', 'Courier', 'Address', 'Duration (mins)', 'Excess (mins)']);
    delayed.forEach((o) => { addRow([o.orderNumber, o.customerName, o.driverName, o.address, o.durationMinutes, o.excessMinutes]); });
  } else if (reportType === 'financial') {
    const summary = reportData.summary || {};
    const payment = reportData.paymentBreakdown || {};
    const driverBalances = reportData.driverCashBalances || [];
    addRow(['Food Hub Admin - Financial Cashflow & COD Settlement Report']);
    addRow(['Generated Date', dateStamp]);
    addRow([]);
    addRow(['--- FINANCIAL OVERVIEW ---']);
    addRow(['Gross Merchandise Value (GMV)', `${Number(summary.gmv || 0).toFixed(2)} ETB`]);
    addRow(['Food Subtotal', `${Number(summary.foodSubtotal || 0).toFixed(2)} ETB`]);
    addRow(['Platform Net Revenue (Take)', `${Number(summary.platformNetRevenue || 0).toFixed(2)} ETB`]);
    addRow(['Courier Delivery Payouts', `${Number(summary.courierPayouts || 0).toFixed(2)} ETB`]);
    addRow(['Sales Tax Collected', `${Number(summary.taxesCollected || 0).toFixed(2)} ETB`]);
    addRow(['Cancelled Orders Loss', `${Number(summary.cancelledLoss || 0).toFixed(2)} ETB`]);
    addRow(['Online Card Revenue', `${Number(payment.cardRevenue || 0).toFixed(2)} ETB (${payment.cardPercent || 0}%)`]);
    addRow(['Cash on Delivery Revenue', `${Number(payment.codRevenue || 0).toFixed(2)} ETB (${payment.codPercent || 0}%)`]);
    addRow([]);
    addRow(['--- DRIVER COD CASH RECONCILIATION ---']);
    addRow(['Courier Name', 'Phone', 'COD Trips', 'Cash Collected (ETB)', 'Fees Earned (ETB)', 'Net Deposit Owed (ETB)']);
    driverBalances.forEach((d) => { addRow([d.driverName, d.phone || 'N/A', d.ordersCount, Number(d.codCollected || 0).toFixed(2), Number(d.deliveryFeesEarned || 0).toFixed(2), Number(d.netDepositOwed || 0).toFixed(2)]); });
  } else if (reportType === 'foods') {
    const foodsList = Array.isArray(reportData.foods) ? reportData.foods : Array.isArray(reportData) ? reportData : [];
    addRow(['Food Hub Admin - Food Catalog Export']);
    addRow(['Generated Date', dateStamp]);
    addRow([]);
    addRow(['--- MENU ITEMS & INVENTORY ---']);
    addRow(['Item Name', 'Category', 'Price (ETB)', 'Status', 'Rating', 'Stock', 'Threshold', 'Vegetarian']);
    foodsList.forEach((f) => {
      addRow([
        f.name,
        f.category || 'General',
        Number(f.price || 0).toFixed(2),
        f.isAvailable !== false ? 'In Stock' : 'Out of Stock',
        Number(f.rating || 0).toFixed(1),
        Number(f.stockQuantity || 0),
        Number(f.lowStockThreshold || 0),
        f.isVegetarian ? 'Yes' : 'No'
      ]);
    });
  } else if (reportType === 'users') {
    const usersList = Array.isArray(reportData.users) ? reportData.users : Array.isArray(reportData) ? reportData : [];
    addRow(['Food Hub Admin - Users & Fleet Roster']);
    addRow(['Generated Date', dateStamp]);
    addRow([]);
    addRow(['--- USERS & DRIVERS ---']);
    addRow(['Full Name', 'Email', 'Phone', 'Role', 'Status', 'Vehicle', 'Deliveries']);
    usersList.forEach((u) => {
      addRow([
        u.name,
        u.email,
        u.phone || 'N/A',
        String(u.role || 'user').toUpperCase(),
        u.isActive !== false ? 'Active' : 'Inactive',
        u.driverProfile?.vehicleType || 'N/A',
        Number(u.driverProfile?.completedDeliveries || 0)
      ]);
    });
  } else {
    const kpis = reportData.kpis || {};
    const ordersList = Array.isArray(reportData.orders) ? reportData.orders : Array.isArray(reportData) ? reportData : [];
    const salesData = reportData.salesData || [];
    addRow(['Food Hub Admin - Orders & Performance Export']);
    addRow(['Generated Date', dateStamp]);
    addRow(['Filter Date Range', filters.dateRange || 'Current Period']);
    addRow([]);
    if (kpis.totalRevenue !== undefined) {
      addRow(['--- EXECUTIVE SUMMARY ---']);
      addRow(['Total Period Revenue', `${Number(kpis.totalRevenue || 0).toFixed(2)} ETB`]);
      addRow(['Total Orders', kpis.totalOrders || ordersList.length]);
      addRow(['Average Order Value', `${Number(kpis.avgOrderValue || 0).toFixed(2)} ETB`]);
      addRow([]);
    }
    if (salesData.length > 0) {
      addRow(['--- DAILY SALES SUMMARY ---']);
      addRow(['Date', 'Orders Count', 'Revenue (ETB)']);
      salesData.forEach((row) => { addRow([row.date || row._id, row.orders, Number(row.revenue || 0).toFixed(2)]); });
      addRow([]);
    }
    addRow(['--- ORDERS TRANSACTION LEDGER ---']);
    addRow(['Order Number', 'Date', 'Customer Name', 'Phone', 'Address', 'Status', 'Payment Method', 'Payment Status', 'Items Count', 'Total Amount (ETB)']);
    ordersList.forEach((ord) => {
      addRow([ord.orderNumber, ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'N/A', ord.customer?.name || ord.customerName || 'Customer', ord.customer?.phone || 'N/A', ord.deliveryStreet || ord.deliveryAddress?.street || 'N/A', ord.orderStatus, ord.paymentMethod, ord.paymentStatus || 'paid', ord.items?.length || 0, Number(ord.totalAmount || 0).toFixed(2)]);
    });
  }
  return lines;
};

// ─────────────────────────────────────────────
// Main export function
// ─────────────────────────────────────────────
export const exportReport = (reportType, reportData, format = 'csv', filters = {}) => {
  if (!reportData) {
    throw new Error('No report data available to export');
  }

  const dateStamp = new Date().toISOString().slice(0, 10);

  if (format === 'excel') {
    // Real multi-sheet .xlsx
    const sheets = buildXlsxSheets(reportType, reportData, filters, dateStamp);
    const xlsxBytes = buildXlsx(sheets);
    triggerDownload(
      xlsxBytes,
      `${reportType}_report_${dateStamp}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    return `Excel (.xlsx) exported with ${sheets.length} sheet${sheets.length !== 1 ? 's' : ''} (${dateStamp})`;

  } else if (format === 'csv') {
    const lines = buildCsvLines(reportType, reportData, filters, dateStamp);
    const csvContent = '\uFEFF' + lines.join('\r\n');
    triggerDownload(csvContent, `${reportType}_report_${dateStamp}.csv`, 'text/csv;charset=utf-8;');
    return `CSV export generated successfully (${dateStamp})`;

  } else if (format === 'pdf') {
    document.body.setAttribute('data-print-date', new Date().toLocaleString());
    window.print();
    return 'Print view opened for PDF saving';
  }

  return 'Export completed';
};
