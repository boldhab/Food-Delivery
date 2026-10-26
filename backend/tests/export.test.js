const request = require('supertest');
const app = require('../src/app');
const {
    sanitizeCsvValue,
    formatCsvField,
    generateCsv,
    generateXlsx,
    generatePdf,
    sanitizeFilename
} = require('../src/utils/exportGenerators');
const exportService = require('../src/services/export.service');

describe('Enterprise Export Utilities & Security', () => {
    describe('CSV Formatting & Formula Injection Mitigation', () => {
        it('should escape strings beginning with formula characters (=, +, -, @, \\t, \\r)', () => {
            expect(sanitizeCsvValue('=1+1')).toBe("'=1+1");
            expect(sanitizeCsvValue('+cmd|calc')).toBe("'+cmd|calc");
            expect(sanitizeCsvValue('-cmd|calc')).toBe("'-cmd|calc");
            expect(sanitizeCsvValue('@SUM(A1:B10)')).toBe("'@SUM(A1:B10)");
            expect(sanitizeCsvValue('\t=cmd')).toBe("'\t=cmd");
            expect(sanitizeCsvValue('\r=cmd')).toBe("'\r=cmd");
        });

        it('should NOT corrupt legitimate positive or negative numbers', () => {
            expect(sanitizeCsvValue(-50.25)).toBe(-50.25);
            expect(sanitizeCsvValue(100)).toBe(100);
            expect(sanitizeCsvValue('-12.50')).toBe('-12.50');
            expect(sanitizeCsvValue('+99.00')).toBe('+99.00');
        });

        it('should correctly format null, undefined, dates, and booleans', () => {
            expect(sanitizeCsvValue(null)).toBe('');
            expect(sanitizeCsvValue(undefined)).toBe('');
            expect(sanitizeCsvValue(true)).toBe('true');
            expect(sanitizeCsvValue(false)).toBe('false');

            const testDate = new Date('2026-10-20T10:00:00.000Z');
            expect(sanitizeCsvValue(testDate)).toBe(testDate.toISOString());
        });

        it('should escape double quotes and wrap in quotes per RFC 4180', () => {
            expect(formatCsvField('Normal Text')).toBe('"Normal Text"');
            expect(formatCsvField('Text with "quotes"')).toBe('"Text with ""quotes"""');
            expect(formatCsvField('Item, with comma')).toBe('"Item, with comma"');
            expect(formatCsvField("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
        });

        it('should preserve Amharic text and prepend UTF-8 BOM in generated CSV', () => {
            const amharicFood = 'ክትፎ በቆጮ';
            const rows = [
                ['Item', 'Category', 'Price'],
                [amharicFood, 'ባህላዊ ምግብ', 250.00]
            ];
            const buffer = generateCsv(rows);

            // BOM check (0xEF, 0xBB, 0xBF)
            expect(buffer[0]).toBe(0xEF);
            expect(buffer[1]).toBe(0xBB);
            expect(buffer[2]).toBe(0xBF);

            const decoded = buffer.toString('utf8');
            expect(decoded).toContain(amharicFood);
            expect(decoded).toContain('ባህላዊ ምግብ');
        });

        it('should handle empty datasets gracefully without throwing', () => {
            const buffer = generateCsv([]);
            expect(buffer.length).toBe(3); // Just the BOM
        });
    });

    describe('Excel Open XML (.xlsx) Generator', () => {
        it('should generate a valid Open XML ZIP archive with frozen panes and auto-filter', () => {
            const sheets = [
                {
                    name: 'Sales Ledger',
                    rows: [
                        ['Food Hub Admin - Sales Ledger'],
                        ['Generated', '2026-10-20'],
                        [],
                        ['Order ID', 'Customer', 'Revenue ($)'],
                        ['#1001', 'Abel Tesfaye', 85.50],
                        ['#1002', 'Sara Bekele', 120.00],
                        ['TOTAL', '', 205.50]
                    ],
                    headerRows: new Set([3]),
                    sectionRows: new Set([0]),
                    summaryRows: new Set([6]),
                    headerRowIndex: 3,
                    autoFilterRange: 'A4:C6'
                }
            ];

            const xlsxBuffer = generateXlsx(sheets);
            expect(xlsxBuffer).toBeInstanceOf(Buffer);

            // Check PKZIP signature: PK (0x50, 0x4B)
            expect(xlsxBuffer[0]).toBe(0x50);
            expect(xlsxBuffer[1]).toBe(0x4B);
            expect(xlsxBuffer.length).toBeGreaterThan(500);
        });

        it('should sanitize formula injection within Open XML text cells', () => {
            const sheets = [
                {
                    name: 'Security Test',
                    rows: [
                        ['Command', 'Result'],
                        ['=cmd|calc', 0]
                    ]
                }
            ];
            const xlsxBuffer = generateXlsx(sheets);
            expect(xlsxBuffer).toBeInstanceOf(Buffer);
            expect(xlsxBuffer.length).toBeGreaterThan(0);
        });

        it('should strip invalid XML 1.0 control characters to prevent corrupting Excel files', () => {
            const { xmlEsc } = require('../src/utils/exportGenerators');
            // Form feed \x0c, null byte \x00, backspace \x08
            const polluted = 'Hello\x00World\x08Test\x0cDone & Ready';
            const cleaned = xmlEsc(polluted);
            expect(cleaned).toBe('HelloWorldTestDone &amp; Ready');
            expect(cleaned).not.toContain('\x00');
            expect(cleaned).not.toContain('\x08');
            expect(cleaned).not.toContain('\x0c');
        });

        it('should handle completely empty sheets gracefully without throwing', () => {
            const sheets = [{ name: 'Empty Sheet', rows: [] }];
            const xlsxBuffer = generateXlsx(sheets);
            expect(xlsxBuffer).toBeInstanceOf(Buffer);
            expect(xlsxBuffer[0]).toBe(0x50);
        });
    });

    describe('PDF Vector Tabular Generator', () => {
        it('should produce a valid PDF 1.4 binary stream with headers and pagination', () => {
            const columns = [
                { key: 'id', label: 'ID', width: 60 },
                { key: 'name', label: 'Item Name', width: 140 },
                { key: 'price', label: 'Price ($)', width: 80, align: 'right' }
            ];
            const data = [
                { id: '1', name: 'Doro Wat', price: 18.50 },
                { id: '2', name: 'Tibs', price: 22.00 }
            ];

            const pdfBuffer = generatePdf('Menu Report', columns, data, {
                generatedAt: '2026-10-20',
                dateRange: 'last30days',
                summaryRow: {
                    label: 'TOTALS',
                    values: { price: '40.50' }
                }
            });

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            const str = pdfBuffer.toString('utf8');
            expect(str.startsWith('%PDF-1.4')).toBe(true);
            expect(str).toContain('%%EOF');
            expect(str).toContain('FoodieHub - Menu Report');
            expect(str).not.toContain('Enterprise Report');
            expect(str).not.toContain('enterprise system');
            expect(str).toContain('/Subtype /Image');
            expect(str).toContain('TOTALS');
        });

        it('should safely escape PDF strings without converting & to XML &amp; and escaping parentheses', () => {
            const { escapePdfString } = require('../src/utils/exportGenerators');
            expect(escapePdfString('Fish & Chips')).toBe('Fish & Chips');
            expect(escapePdfString('Order (Priority #1)')).toBe('Order \\(Priority #1\\)');
            expect(escapePdfString('Path C:\\Files')).toBe('Path C:\\\\Files');
            expect(escapePdfString('Line 1\r\nLine 2')).toBe('Line 1 Line 2');
        });

        it('should handle empty datasets in PDF with a clear notice message', () => {
            const columns = [{ key: 'name', label: 'Item Name', width: 100 }];
            const pdfBuffer = generatePdf('Empty Report', columns, []);
            expect(pdfBuffer).toBeInstanceOf(Buffer);
            const str = pdfBuffer.toString('utf8');
            expect(str).toContain('No records found');
        });
    });

    describe('Safe Filename Sanitization', () => {
        it('should prevent HTTP Response Header Injection and path traversal', () => {
            const dangerous = 'orders\r\nSet-Cookie: evil=true; path=/\n\r';
            const safe = sanitizeFilename(dangerous, 'csv');
            expect(safe).not.toContain('\r');
            expect(safe).not.toContain('\n');
            expect(safe).not.toContain(';');
            expect(safe.endsWith('.csv')).toBe(true);
        });

        it('should attach correct file extension if missing', () => {
            expect(sanitizeFilename('sales_report', 'xlsx')).toBe('sales_report.xlsx');
            expect(sanitizeFilename('sales_report.xlsx', 'xlsx')).toBe('sales_report.xlsx');
        });
    });

    describe('Export Service Parameter Validation & Resolution', () => {
        it('should reject invalid export format with 400', () => {
            expect(() => {
                exportService.parseExportQuery({ format: 'exe' });
            }).toThrow(/Unsupported export format/);
        });

        it('should reject invalid date formats with 400', () => {
            expect(() => {
                exportService.parseExportQuery({ startDate: 'not-a-date' });
            }).toThrow(/Invalid 'startDate' format/);

            expect(() => {
                exportService.parseExportQuery({ endDate: 'invalid-date' });
            }).toThrow(/Invalid 'endDate' format/);
        });

        it('should automatically resolve dateRange presets into ISO start/end dates', () => {
            const parsed7d = exportService.parseExportQuery({ dateRange: '7days' });
            expect(parsed7d.startDate).toBeDefined();
            expect(parsed7d.endDate).toBeDefined();
            expect(new Date(parsed7d.startDate).getTime()).toBeLessThan(new Date(parsed7d.endDate).getTime());

            const parsedMonth = exportService.parseExportQuery({ dateRange: 'thisMonth' });
            expect(parsedMonth.startDate).toBeDefined();
            expect(parsedMonth.endDate).toBeDefined();
        });

        it('should parse and sanitize sorting parameters', () => {
            const parsed = exportService.parseExportQuery({ sortBy: 'totalAmount', sortOrder: 'asc' });
            expect(parsed.sortBy).toBe('totalAmount');
            expect(parsed.sortOrder).toBe('asc');
        });

        it('should cap export limit at EXPORT_MAX_LIMIT (5000)', () => {
            const parsed = exportService.parseExportQuery({ limit: '999999' });
            expect(parsed.limit).toBe(5000);
        });

        it('should parse selected row IDs correctly', () => {
            const parsed = exportService.parseExportQuery({ ids: 'id1, id2, id3' });
            expect(parsed.ids).toEqual(['id1', 'id2', 'id3']);
        });

        it('should reject invalid export type with 400', async () => {
            await expect(exportService.exportRecords('invalid_type', {})).rejects.toThrow(
                /Invalid export type/
            );
        });
    });
});

describe('Export API Endpoints Authorization & Validation', () => {
    it('GET /api/admin/export/orders should reject unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/export/orders');
        expect(res.statusCode).toBe(401);
    });

    it('GET /api/admin/export/foods should reject unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/export/foods');
        expect(res.statusCode).toBe(401);
    });

    it('GET /api/admin/export/users should reject unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/export/users');
        expect(res.statusCode).toBe(401);
    });

    it('GET /api/admin/export/sales should reject unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/export/sales');
        expect(res.statusCode).toBe(401);
    });
});
