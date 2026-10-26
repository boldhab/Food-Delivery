/**
 * Enterprise Report Export Service
 * Handles data extraction, filter scoping, selection scoping,
 * format conversion (CSV, XLSX, PDF), and safe file generation.
 */

const prisma = require('../config/prisma');
const orderService = require('./order.service');
const foodService = require('./food.service');
const {
    generateCsv,
    generateXlsx,
    generatePdf,
    sanitizeFilename
} = require('../utils/exportGenerators');

const EXPORT_MAX_LIMIT = 5000;
const EXPORT_DEFAULT_LIMIT = 1000;

class ExportService {
    /**
     * Parse and sanitize common export query parameters.
     */
    parseExportQuery(query = {}) {
        const format = String(query.format || 'csv').toLowerCase().trim();
        const validFormats = ['csv', 'excel', 'xlsx', 'pdf', 'json'];
        if (!validFormats.includes(format)) {
            const err = new Error(`Unsupported export format '${format}'. Valid formats: csv, excel, pdf, json`);
            err.statusCode = 400;
            throw err;
        }

        const limit = Math.min(
            Math.max(1, parseInt(query.limit, 10) || EXPORT_DEFAULT_LIMIT),
            EXPORT_MAX_LIMIT
        );

        // Parse selected IDs (comma-separated or array)
        let ids = [];
        if (query.ids) {
            if (Array.isArray(query.ids)) {
                ids = query.ids.map(String).map((s) => s.trim()).filter(Boolean);
            } else if (typeof query.ids === 'string') {
                ids = query.ids.split(',').map((s) => s.trim()).filter(Boolean);
            }
        }

        // Validate and sanitize dates
        let startDate = query.startDate ? String(query.startDate).trim() : undefined;
        let endDate = query.endDate ? String(query.endDate).trim() : undefined;

        if (startDate) {
            const parsedStart = Date.parse(startDate);
            if (Number.isNaN(parsedStart)) {
                const err = new Error(`Invalid 'startDate' format: '${startDate}'. Expected ISO or valid date string.`);
                err.statusCode = 400;
                throw err;
            }
            startDate = new Date(parsedStart).toISOString();
        }

        if (endDate) {
            const parsedEnd = Date.parse(endDate);
            if (Number.isNaN(parsedEnd)) {
                const err = new Error(`Invalid 'endDate' format: '${endDate}'. Expected ISO or valid date string.`);
                err.statusCode = 400;
                throw err;
            }
            endDate = new Date(parsedEnd).toISOString();
        }

        // Resolve common dateRange presets if explicit startDate/endDate are not supplied
        let dateRange = query.dateRange ? String(query.dateRange).trim() : undefined;
        if (dateRange && !startDate && !endDate) {
            const now = new Date();
            if (dateRange === 'today') {
                const s = new Date(now);
                s.setHours(0, 0, 0, 0);
                startDate = s.toISOString();
                endDate = now.toISOString();
            } else if (dateRange === 'yesterday') {
                const s = new Date(now);
                s.setDate(s.getDate() - 1);
                s.setHours(0, 0, 0, 0);
                const e = new Date(s);
                e.setHours(23, 59, 59, 999);
                startDate = s.toISOString();
                endDate = e.toISOString();
            } else if (dateRange === '7days' || dateRange === '7') {
                const s = new Date(now);
                s.setDate(s.getDate() - 7);
                startDate = s.toISOString();
                endDate = now.toISOString();
            } else if (dateRange === '30days' || dateRange === '30' || dateRange === 'last30days') {
                const s = new Date(now);
                s.setDate(s.getDate() - 30);
                startDate = s.toISOString();
                endDate = now.toISOString();
            } else if (dateRange === 'thisMonth') {
                const s = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate = s.toISOString();
                endDate = now.toISOString();
            } else if (dateRange === 'lastMonth') {
                const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                startDate = s.toISOString();
                endDate = e.toISOString();
            }
        }

        // Parse sorting parameters
        const sortBy = query.sortBy ? String(query.sortBy).trim() : undefined;
        const sortOrder = String(query.sortOrder || 'desc').toLowerCase().trim() === 'asc' ? 'asc' : 'desc';

        return {
            format: format === 'xlsx' ? 'excel' : format,
            limit,
            ids,
            search: query.search?.trim(),
            startDate,
            endDate,
            dateRange,
            sortBy,
            sortOrder,
            status: query.status,
            paymentStatus: query.paymentStatus,
            category: query.category,
            role: query.role,
            isAvailable: query.isAvailable
        };
    }

    /**
     * Main entry point to export records based on type and format.
     */
    async exportRecords(type, query = {}) {
        const normType = String(type || '').toLowerCase().trim();
        const validTypes = ['orders', 'foods', 'users', 'sales', 'drivers', 'inventory', 'sla', 'financial'];
        if (!validTypes.includes(normType)) {
            const err = new Error(`Invalid export type '${normType}'. Valid types: ${validTypes.join(', ')}`);
            err.statusCode = 400;
            throw err;
        }

        const opts = this.parseExportQuery(query);
        const dateStamp = new Date().toISOString().slice(0, 10);

        switch (normType) {
            case 'orders':
                return this.exportOrders(opts, dateStamp);
            case 'foods':
                return this.exportFoods(opts, dateStamp);
            case 'users':
                return this.exportUsers(opts, dateStamp);
            case 'sales':
                return this.exportSalesReport(opts, dateStamp);
            case 'drivers':
                return this.exportDriverReport(opts, dateStamp);
            case 'inventory':
                return this.exportInventoryReport(opts, dateStamp);
            case 'sla':
                return this.exportSlaReport(opts, dateStamp);
            case 'financial':
                return this.exportFinancialReport(opts, dateStamp);
            default:
                throw new Error(`Unhandled export type: ${normType}`);
        }
    }

    // ========================================================================
    // ORDERS EXPORT
    // ========================================================================
    async exportOrders(opts, dateStamp) {
        const where = {};

        // Scope to explicitly selected orders if provided
        if (opts.ids && opts.ids.length > 0) {
            where.OR = [
                { id: { in: opts.ids } },
                { orderNumber: { in: opts.ids } }
            ];
        } else {
            if (opts.status && opts.status !== 'all') where.orderStatus = opts.status;
            if (opts.paymentStatus && opts.paymentStatus !== 'all') where.paymentStatus = opts.paymentStatus;
            if (opts.startDate || opts.endDate) {
                where.createdAt = {};
                if (opts.startDate) where.createdAt.gte = new Date(opts.startDate);
                if (opts.endDate) {
                    const end = new Date(opts.endDate);
                    end.setHours(23, 59, 59, 999);
                    where.createdAt.lte = end;
                }
            }
            if (opts.search) {
                where.OR = [
                    { orderNumber: { contains: opts.search, mode: 'insensitive' } },
                    { customerName: { contains: opts.search, mode: 'insensitive' } },
                    { customerEmail: { contains: opts.search, mode: 'insensitive' } },
                    { customerPhone: { contains: opts.search, mode: 'insensitive' } }
                ];
            }
        }

        // Whitelist allowed sort keys to prevent arbitrary database field sorting
        let orderBy = { createdAt: 'desc' };
        const allowedOrderSorts = ['createdAt', 'orderNumber', 'totalAmount', 'orderStatus', 'customerName', 'subtotal'];
        if (opts.sortBy && allowedOrderSorts.includes(opts.sortBy)) {
            orderBy = { [opts.sortBy]: opts.sortOrder || 'desc' };
        }

        const orders = await prisma.order.findMany({
            where,
            orderBy,
            take: opts.limit,
            include: {
                driver: { select: { name: true, phone: true } },
                items: true
            }
        });

        const columns = [
            { key: 'orderNumber', label: 'Order #', width: 90 },
            { key: 'date', label: 'Date & Time', width: 110 },
            { key: 'customer', label: 'Customer Name', width: 110 },
            { key: 'phone', label: 'Phone', width: 90 },
            { key: 'address', label: 'Delivery Address', width: 140 },
            { key: 'status', label: 'Order Status', width: 85 },
            { key: 'paymentMethod', label: 'Payment Method', width: 85 },
            { key: 'paymentStatus', label: 'Payment Status', width: 80 },
            { key: 'itemCount', label: 'Items', width: 50, align: 'right' },
            { key: 'subtotal', label: 'Subtotal (ETB)', width: 75, align: 'right' },
            { key: 'deliveryFee', label: 'Delivery (ETB)', width: 70, align: 'right' },
            { key: 'total', label: 'Total (ETB)', width: 75, align: 'right' }
        ];

        const mappedData = orders.map((o) => ({
            orderNumber: o.orderNumber,
            date: o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A',
            customer: o.customerName || 'N/A',
            phone: o.customerPhone || 'N/A',
            address: `${o.deliveryStreet || ''}, ${o.deliveryCity || ''}`.replace(/^,\s*|,\s*$/g, ''),
            status: o.orderStatus,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            itemCount: o.items?.length || 0,
            subtotal: Number(o.subtotal || 0),
            deliveryFee: Number(o.deliveryFee || 0),
            total: Number(o.totalAmount || 0)
        }));

        const totalRevenue = mappedData.reduce((s, r) => s + r.total, 0);

        if (opts.format === 'csv') {
            const rows = [
                ['Food Hub Admin - Orders Export'],
                ['Generated Date', dateStamp],
                ['Record Count', mappedData.length],
                ['Total Volume (ETB)', totalRevenue.toFixed(2)],
                [],
                columns.map((c) => c.label),
                ...mappedData.map((r) => [
                    r.orderNumber,
                    r.date,
                    r.customer,
                    r.phone,
                    r.address,
                    r.status,
                    r.paymentMethod,
                    r.paymentStatus,
                    r.itemCount,
                    r.subtotal.toFixed(2),
                    r.deliveryFee.toFixed(2),
                    r.total.toFixed(2)
                ]),
                [],
                ['TOTALS', '', '', '', '', '', '', '', '', '', '', totalRevenue.toFixed(2)]
            ];
            return {
                buffer: generateCsv(rows),
                mimeType: 'text/csv; charset=utf-8',
                filename: sanitizeFilename(`orders_export_${dateStamp}`, 'csv')
            };
        }

        if (opts.format === 'excel') {
            const headerRowIdx = 5;
            const sheetRows = [
                ['Food Hub Admin — Orders Transaction Ledger'],
                ['Generated', dateStamp],
                ['Record Count', mappedData.length],
                ['Total Revenue (ETB)', totalRevenue],
                [],
                columns.map((c) => c.label),
                ...mappedData.map((r) => [
                    r.orderNumber,
                    r.date,
                    r.customer,
                    r.phone,
                    r.address,
                    r.status,
                    r.paymentMethod,
                    r.paymentStatus,
                    r.itemCount,
                    r.subtotal,
                    r.deliveryFee,
                    r.total
                ]),
                ['TOTALS', '', '', '', '', '', '', '', '', '', '', totalRevenue]
            ];

            const summaryRowIdx = sheetRows.length - 1;
            const sheets = [
                {
                    name: 'Orders',
                    rows: sheetRows,
                    headerRows: new Set([headerRowIdx]),
                    sectionRows: new Set([0]),
                    summaryRows: new Set([summaryRowIdx]),
                    headerRowIndex: headerRowIdx,
                    autoFilterRange: `A${headerRowIdx + 1}:L${sheetRows.length - 1}`
                }
            ];

            return {
                buffer: generateXlsx(sheets),
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: sanitizeFilename(`orders_export_${dateStamp}`, 'xlsx')
            };
        }

        if (opts.format === 'pdf') {
            const pdfBuffer = generatePdf('Orders Transaction Ledger', columns, mappedData, {
                generatedAt: dateStamp,
                totalCount: mappedData.length,
                dateRange: opts.dateRange,
                summaryRow: {
                    label: 'TOTALS',
                    values: {
                        total: totalRevenue.toFixed(2),
                        itemCount: mappedData.reduce((s, r) => s + r.itemCount, 0),
                        subtotal: mappedData.reduce((s, r) => s + r.subtotal, 0).toFixed(2),
                        deliveryFee: mappedData.reduce((s, r) => s + r.deliveryFee, 0).toFixed(2)
                    }
                }
            });
            return {
                buffer: pdfBuffer,
                mimeType: 'application/pdf',
                filename: sanitizeFilename(`orders_report_${dateStamp}`, 'pdf')
            };
        }

        return {
            buffer: Buffer.from(JSON.stringify({ success: true, count: mappedData.length, data: mappedData }, null, 2)),
            mimeType: 'application/json',
            filename: sanitizeFilename(`orders_export_${dateStamp}`, 'json')
        };
    }

    // ========================================================================
    // FOODS EXPORT
    // ========================================================================
    async exportFoods(opts, dateStamp) {
        const where = {};

        if (opts.ids && opts.ids.length > 0) {
            where.id = { in: opts.ids };
        } else {
            if (opts.category && opts.category !== 'All') where.category = opts.category;
            if (opts.isAvailable !== undefined && opts.isAvailable !== 'All') {
                where.isAvailable = opts.isAvailable === 'true' || opts.isAvailable === true;
            }
            if (opts.search) {
                where.OR = [
                    { name: { contains: opts.search, mode: 'insensitive' } },
                    { description: { contains: opts.search, mode: 'insensitive' } },
                    { category: { contains: opts.search, mode: 'insensitive' } }
                ];
            }
        }

        // Whitelist allowed sort keys to prevent arbitrary database field sorting
        let orderBy = { name: 'asc' };
        const allowedFoodSorts = ['name', 'price', 'rating', 'stockQuantity', 'category', 'createdAt'];
        if (opts.sortBy && allowedFoodSorts.includes(opts.sortBy)) {
            orderBy = { [opts.sortBy]: opts.sortOrder || 'asc' };
        }

        const foods = await prisma.food.findMany({
            where,
            orderBy,
            take: opts.limit
        });

        const columns = [
            { key: 'name', label: 'Item Name', width: 140 },
            { key: 'category', label: 'Category', width: 90 },
            { key: 'price', label: 'Price (ETB)', width: 75, align: 'right' },
            { key: 'isAvailable', label: 'In Stock', width: 70 },
            { key: 'rating', label: 'Rating', width: 60, align: 'right' },
            { key: 'stockQuantity', label: 'Current Stock', width: 80, align: 'right' },
            { key: 'lowStockThreshold', label: 'Min Alert Threshold', width: 90, align: 'right' },
            { key: 'isVegetarian', label: 'Vegetarian', width: 70 },
            { key: 'dailyQuota', label: 'Daily Quota', width: 75, align: 'right' }
        ];

        const mappedData = foods.map((f) => ({
            name: f.name,
            category: f.category,
            price: Number(f.price || 0),
            isAvailable: f.isAvailable ? 'In Stock' : 'Out of Stock',
            rating: Number(f.rating || 0).toFixed(1),
            stockQuantity: Number(f.stockQuantity || 0),
            lowStockThreshold: Number(f.lowStockThreshold || 0),
            isVegetarian: f.isVegetarian ? 'Yes' : 'No',
            dailyQuota: Number(f.dailyQuota || 0)
        }));

        if (opts.format === 'csv') {
            const rows = [
                ['Food Hub Admin - Food Catalog Export'],
                ['Generated Date', dateStamp],
                ['Total Menu Items', mappedData.length],
                [],
                columns.map((c) => c.label),
                ...mappedData.map((f) => [
                    f.name,
                    f.category,
                    f.price.toFixed(2),
                    f.isAvailable,
                    f.rating,
                    f.stockQuantity,
                    f.lowStockThreshold,
                    f.isVegetarian,
                    f.dailyQuota
                ])
            ];
            return {
                buffer: generateCsv(rows),
                mimeType: 'text/csv; charset=utf-8',
                filename: sanitizeFilename(`foods_catalog_${dateStamp}`, 'csv')
            };
        }

        if (opts.format === 'excel') {
            const headerRowIdx = 4;
            const sheetRows = [
                ['Food Hub Admin — Menu Catalog & Inventory'],
                ['Generated', dateStamp],
                ['Total Menu Items', mappedData.length],
                [],
                columns.map((c) => c.label),
                ...mappedData.map((f) => [
                    f.name,
                    f.category,
                    f.price,
                    f.isAvailable,
                    Number(f.rating),
                    f.stockQuantity,
                    f.lowStockThreshold,
                    f.isVegetarian,
                    f.dailyQuota
                ])
            ];

            const sheets = [
                {
                    name: 'Menu Catalog',
                    rows: sheetRows,
                    headerRows: new Set([headerRowIdx]),
                    sectionRows: new Set([0]),
                    headerRowIndex: headerRowIdx,
                    autoFilterRange: `A${headerRowIdx + 1}:I${sheetRows.length}`
                }
            ];

            return {
                buffer: generateXlsx(sheets),
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: sanitizeFilename(`foods_catalog_${dateStamp}`, 'xlsx')
            };
        }

        if (opts.format === 'pdf') {
            const pdfBuffer = generatePdf('Menu Catalog & Stock Inventory', columns, mappedData, {
                generatedAt: dateStamp,
                totalCount: mappedData.length,
                summaryRow: {
                    label: 'TOTAL ITEMS',
                    values: {
                        name: `${mappedData.length} Items`,
                        stockQuantity: mappedData.reduce((s, f) => s + (f.stockQuantity || 0), 0)
                    }
                }
            });
            return {
                buffer: pdfBuffer,
                mimeType: 'application/pdf',
                filename: sanitizeFilename(`foods_report_${dateStamp}`, 'pdf')
            };
        }

        return {
            buffer: Buffer.from(JSON.stringify({ success: true, count: mappedData.length, data: mappedData }, null, 2)),
            mimeType: 'application/json',
            filename: sanitizeFilename(`foods_catalog_${dateStamp}`, 'json')
        };
    }

    // ========================================================================
    // USERS & FLEET EXPORT
    // ========================================================================
    async exportUsers(opts, dateStamp) {
        const where = {};
        if (opts.ids && opts.ids.length > 0) {
            where.id = { in: opts.ids };
        } else {
            if (opts.role && opts.role !== 'all') where.role = opts.role;
            if (opts.search) {
                where.OR = [
                    { name: { contains: opts.search, mode: 'insensitive' } },
                    { email: { contains: opts.search, mode: 'insensitive' } },
                    { phone: { contains: opts.search, mode: 'insensitive' } }
                ];
            }
        }

        // Whitelist allowed sort keys to prevent arbitrary database field sorting
        let orderBy = { createdAt: 'desc' };
        const allowedUserSorts = ['name', 'email', 'role', 'createdAt'];
        if (opts.sortBy && allowedUserSorts.includes(opts.sortBy)) {
            orderBy = { [opts.sortBy]: opts.sortOrder || 'desc' };
        }

        const users = await prisma.user.findMany({
            where,
            orderBy,
            take: opts.limit,
            include: { driverProfile: true }
        });

        const columns = [
            { key: 'name', label: 'Full Name', width: 120 },
            { key: 'email', label: 'Email', width: 140 },
            { key: 'phone', label: 'Phone', width: 90 },
            { key: 'role', label: 'Role', width: 70 },
            { key: 'status', label: 'Account Status', width: 80 },
            { key: 'vehicleType', label: 'Vehicle (Drivers)', width: 90 },
            { key: 'deliveries', label: 'Completed Deliveries', width: 90, align: 'right' },
            { key: 'createdAt', label: 'Member Since', width: 90 }
        ];

        const mappedData = users.map((u) => ({
            name: u.name,
            email: u.email,
            phone: u.phone || 'N/A',
            role: u.role.toUpperCase(),
            status: u.isActive ? 'Active' : 'Inactive',
            vehicleType: u.driverProfile?.vehicleType || 'N/A',
            deliveries: u.driverProfile?.completedDeliveries || 0,
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : 'N/A'
        }));

        if (opts.format === 'csv') {
            const rows = [
                ['Food Hub Admin - Users & Fleet Roster'],
                ['Generated Date', dateStamp],
                ['Record Count', mappedData.length],
                [],
                columns.map((c) => c.label),
                ...mappedData.map((u) => [
                    u.name,
                    u.email,
                    u.phone,
                    u.role,
                    u.status,
                    u.vehicleType,
                    u.deliveries,
                    u.createdAt
                ])
            ];
            return {
                buffer: generateCsv(rows),
                mimeType: 'text/csv; charset=utf-8',
                filename: sanitizeFilename(`users_export_${dateStamp}`, 'csv')
            };
        }

        if (opts.format === 'excel') {
            const headerRowIdx = 4;
            const sheetRows = [
                ['Food Hub Admin — Users & Fleet Roster'],
                ['Generated', dateStamp],
                ['Record Count', mappedData.length],
                [],
                columns.map((c) => c.label),
                ...mappedData.map((u) => [
                    u.name,
                    u.email,
                    u.phone,
                    u.role,
                    u.status,
                    u.vehicleType,
                    u.deliveries,
                    u.createdAt
                ])
            ];

            const sheets = [
                {
                    name: 'Users Roster',
                    rows: sheetRows,
                    headerRows: new Set([headerRowIdx]),
                    sectionRows: new Set([0]),
                    headerRowIndex: headerRowIdx,
                    autoFilterRange: `A${headerRowIdx + 1}:H${sheetRows.length}`
                }
            ];

            return {
                buffer: generateXlsx(sheets),
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: sanitizeFilename(`users_export_${dateStamp}`, 'xlsx')
            };
        }

        if (opts.format === 'pdf') {
            const pdfBuffer = generatePdf('Users & Fleet Roster', columns, mappedData, {
                generatedAt: dateStamp,
                totalCount: mappedData.length,
                summaryRow: {
                    label: 'TOTAL USERS',
                    values: {
                        name: `${mappedData.length} Accounts`,
                        deliveries: mappedData.reduce((s, u) => s + (u.deliveries || 0), 0)
                    }
                }
            });
            return {
                buffer: pdfBuffer,
                mimeType: 'application/pdf',
                filename: sanitizeFilename(`users_report_${dateStamp}`, 'pdf')
            };
        }

        return {
            buffer: Buffer.from(JSON.stringify({ success: true, count: mappedData.length, data: mappedData }, null, 2)),
            mimeType: 'application/json',
            filename: sanitizeFilename(`users_export_${dateStamp}`, 'json')
        };
    }

    // ========================================================================
    // SALES REPORT EXPORT
    // ========================================================================
    async exportSalesReport(opts, dateStamp) {
        const report = await orderService.getSalesReport(opts);
        const kpis = report.kpis || {};
        const salesData = report.salesData || [];
        const topSelling = report.topSellingItems || [];

        if (opts.format === 'csv') {
            const rows = [
                ['Food Hub Admin - Sales & Revenue Analytics Report'],
                ['Generated Date', dateStamp],
                ['Filter Range', opts.dateRange || `${opts.days || 30} days`],
                [],
                ['EXECUTIVE KPI SUMMARY'],
                ['Total Revenue (ETB)', Number(kpis.totalRevenue || 0).toFixed(2)],
                ['Total Orders', Number(kpis.totalOrders || 0)],
                ['Average Order Value (ETB)', Number(kpis.avgOrderValue || 0).toFixed(2)],
                ['Fulfillment Rate (%)', `${Number(kpis.conversionRate || 100).toFixed(1)}%`],
                ['Revenue Growth vs Prior (%)', `${Number(kpis.revenueChange || 0).toFixed(1)}%`],
                [],
                ['DAILY SALES BREAKDOWN'],
                ['Date', 'Orders', 'Revenue (ETB)', 'Avg Order Value (ETB)'],
                ...salesData.map((d) => [
                    d.date,
                    d.orders,
                    Number(d.revenue || 0).toFixed(2),
                    d.orders > 0 ? (d.revenue / d.orders).toFixed(2) : '0.00'
                ]),
                [],
                ['TOP SELLING ITEMS'],
                ['Rank', 'Item Name', 'Units Sold', 'Revenue (ETB)'],
                ...topSelling.map((it, idx) => [
                    idx + 1,
                    it.name,
                    it.count || it.orders || 0,
                    Number(it.revenue || 0).toFixed(2)
                ])
            ];

            return {
                buffer: generateCsv(rows),
                mimeType: 'text/csv; charset=utf-8',
                filename: sanitizeFilename(`sales_report_${dateStamp}`, 'csv')
            };
        }

        if (opts.format === 'excel') {
            const kpiRows = [
                ['Food Hub Admin — Sales Performance Summary'],
                ['Generated', dateStamp],
                [],
                ['Metric', 'Value'],
                ['Total Revenue (ETB)', Number(kpis.totalRevenue || 0)],
                ['Total Orders', Number(kpis.totalOrders || 0)],
                ['Average Order Value (ETB)', Number(kpis.avgOrderValue || 0)],
                ['Fulfillment Rate (%)', Number(kpis.conversionRate || 100)]
            ];

            const salesRows = [
                ['Daily Sales Breakdown'],
                ['Generated', dateStamp],
                [],
                ['Date', 'Orders', 'Revenue (ETB)', 'Avg Order Value (ETB)'],
                ...salesData.map((d) => [
                    d.date,
                    Number(d.orders || 0),
                    Number(d.revenue || 0),
                    d.orders > 0 ? Number((d.revenue / d.orders).toFixed(2)) : 0
                ])
            ];

            const topRows = [
                ['Top Selling Menu Items'],
                ['Generated', dateStamp],
                [],
                ['Rank', 'Item Name', 'Units Sold', 'Revenue (ETB)'],
                ...topSelling.map((it, idx) => [
                    idx + 1,
                    it.name,
                    Number(it.count || it.orders || 0),
                    Number(it.revenue || 0)
                ])
            ];

            const sheets = [
                { name: 'KPI Summary', rows: kpiRows, headerRows: new Set([3]), sectionRows: new Set([0]) },
                {
                    name: 'Daily Sales',
                    rows: salesRows,
                    headerRows: new Set([3]),
                    sectionRows: new Set([0]),
                    headerRowIndex: 3,
                    autoFilterRange: `A4:D${salesRows.length}`
                },
                {
                    name: 'Top Items',
                    rows: topRows,
                    headerRows: new Set([3]),
                    sectionRows: new Set([0]),
                    headerRowIndex: 3,
                    autoFilterRange: `A4:D${topRows.length}`
                }
            ];

            return {
                buffer: generateXlsx(sheets),
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: sanitizeFilename(`sales_report_${dateStamp}`, 'xlsx')
            };
        }

        const columns = [
            { key: 'date', label: 'Date', width: 90 },
            { key: 'orders', label: 'Orders Count', width: 80, align: 'right' },
            { key: 'revenue', label: 'Revenue (ETB)', width: 90, align: 'right' },
            { key: 'aov', label: 'Avg Order Value (ETB)', width: 100, align: 'right' }
        ];

        const mappedData = salesData.map((d) => ({
            date: d.date,
            orders: d.orders,
            revenue: Number(d.revenue || 0),
            aov: d.orders > 0 ? Number((d.revenue / d.orders).toFixed(2)) : 0
        }));

        const pdfBuffer = generatePdf('Sales & Revenue Daily Report', columns, mappedData, {
            generatedAt: dateStamp,
            dateRange: opts.dateRange
        });

        return {
            buffer: pdfBuffer,
            mimeType: 'application/pdf',
            filename: sanitizeFilename(`sales_report_${dateStamp}`, 'pdf')
        };
    }

    // ========================================================================
    // DRIVERS REPORT EXPORT
    // ========================================================================
    async exportDriverReport(opts, dateStamp) {
        const report = await orderService.getDriverAnalyticsReport(opts);
        const fleet = report.fleetSummary || {};
        const drivers = report.driverPerformance || [];

        if (opts.format === 'csv') {
            const rows = [
                ['Food Hub Admin - Courier Fleet Analytics Report'],
                ['Generated Date', dateStamp],
                [],
                ['FLEET SUMMARY'],
                ['Total Registered Drivers', fleet.totalDrivers || drivers.length],
                ['Active Couriers Online', fleet.activeDrivers || 0],
                ['Period Completed Deliveries', fleet.totalDeliveries || 0],
                ['Courier Payouts (ETB)', Number(fleet.totalEarnings || 0).toFixed(2)],
                ['COD Cash in Hand (ETB)', Number(fleet.totalCodCollected || 0).toFixed(2)],
                [],
                ['COURIER ROSTER BREAKDOWN'],
                ['Courier Name', 'Vehicle', 'Status', 'Trips', 'Earnings (ETB)', 'COD Held (ETB)', 'Rating'],
                ...drivers.map((d) => [
                    d.driver,
                    d.vehicleType || 'Courier',
                    d.isAvailable ? 'Online' : 'Offline',
                    d.deliveries || 0,
                    Number(d.earnings || 0).toFixed(2),
                    Number(d.codCollected || 0).toFixed(2),
                    Number(d.rating || 5.0).toFixed(1)
                ])
            ];

            return {
                buffer: generateCsv(rows),
                mimeType: 'text/csv; charset=utf-8',
                filename: sanitizeFilename(`driver_analytics_${dateStamp}`, 'csv')
            };
        }

        const sheetRows = [
            ['Food Hub Admin — Courier Fleet Analytics'],
            ['Generated', dateStamp],
            ['Total Couriers', drivers.length],
            [],
            ['Courier Name', 'Vehicle', 'Status', 'Trips', 'Earnings (ETB)', 'COD Held (ETB)', 'Rating'],
            ...drivers.map((d) => [
                d.driver,
                d.vehicleType || 'Courier',
                d.isAvailable ? 'Online' : 'Offline',
                Number(d.deliveries || 0),
                Number(d.earnings || 0),
                Number(d.codCollected || 0),
                Number(d.rating || 5.0)
            ])
        ];

        if (opts.format === 'excel') {
            const sheets = [
                {
                    name: 'Courier Fleet',
                    rows: sheetRows,
                    headerRows: new Set([4]),
                    sectionRows: new Set([0]),
                    headerRowIndex: 4,
                    autoFilterRange: `A5:G${sheetRows.length}`
                }
            ];

            return {
                buffer: generateXlsx(sheets),
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: sanitizeFilename(`driver_analytics_${dateStamp}`, 'xlsx')
            };
        }

        const columns = [
            { key: 'driver', label: 'Courier Name', width: 130 },
            { key: 'vehicleType', label: 'Vehicle', width: 90 },
            { key: 'status', label: 'Status', width: 75 },
            { key: 'deliveries', label: 'Trips', width: 60, align: 'right' },
            { key: 'earnings', label: 'Earnings (ETB)', width: 85, align: 'right' },
            { key: 'codCollected', label: 'COD (ETB)', width: 80, align: 'right' },
            { key: 'rating', label: 'Rating', width: 60, align: 'right' }
        ];

        const mappedData = drivers.map((d) => ({
            ...d,
            status: d.isAvailable ? 'Online' : 'Offline'
        }));

        const pdfBuffer = generatePdf('Courier Fleet Analytics Report', columns, mappedData, {
            generatedAt: dateStamp
        });

        return {
            buffer: pdfBuffer,
            mimeType: 'application/pdf',
            filename: sanitizeFilename(`driver_analytics_${dateStamp}`, 'pdf')
        };
    }

    // ========================================================================
    // INVENTORY REPORT EXPORT
    // ========================================================================
    async exportInventoryReport(opts, dateStamp) {
        // Delegate to food catalog export with stock tracking focus
        return this.exportFoods(opts, dateStamp);
    }

    // ========================================================================
    // SLA REPORT EXPORT
    // ========================================================================
    async exportSlaReport(opts, dateStamp) {
        const report = await orderService.getDeliverySlaReport(opts);
        const kpis = report.kpis || {};
        const delayed = report.delayedOrders || [];

        if (opts.format === 'csv') {
            const rows = [
                ['Food Hub Admin - Delivery SLA & Fulfillment Report'],
                ['Generated Date', dateStamp],
                [],
                ['SLA PERFORMANCE SUMMARY'],
                ['Target SLA Threshold', `${kpis.targetSlaMinutes || 45} mins`],
                ['On-Time Delivery Rate', `${Number(kpis.onTimeRate || 95).toFixed(1)}%`],
                ['Total Delivered Orders', kpis.totalDelivered || 0],
                ['Average Door-to-Door Time', `${kpis.avgFulfillmentMinutes || 30} mins`],
                ['Delayed Orders Count (>45m)', kpis.delayedOrdersCount || 0],
                [],
                ['DELAYED ORDERS INCIDENT LOG'],
                ['Order #', 'Customer', 'Courier', 'Address', 'Duration (mins)', 'Excess Late (mins)'],
                ...delayed.map((o) => [
                    o.orderNumber,
                    o.customerName,
                    o.driverName,
                    o.address,
                    o.durationMinutes,
                    o.excessMinutes
                ])
            ];

            return {
                buffer: generateCsv(rows),
                mimeType: 'text/csv; charset=utf-8',
                filename: sanitizeFilename(`sla_report_${dateStamp}`, 'csv')
            };
        }

        const sheetRows = [
            ['Food Hub Admin — Delivery SLA Incident Log'],
            ['Generated', dateStamp],
            [],
            ['Order #', 'Customer', 'Courier', 'Address', 'Duration (mins)', 'Excess Late (mins)'],
            ...delayed.map((o) => [
                o.orderNumber,
                o.customerName,
                o.driverName,
                o.address,
                Number(o.durationMinutes || 0),
                Number(o.excessMinutes || 0)
            ])
        ];

        if (opts.format === 'excel') {
            const sheets = [
                {
                    name: 'Delayed Deliveries',
                    rows: sheetRows,
                    headerRows: new Set([3]),
                    sectionRows: new Set([0]),
                    headerRowIndex: 3,
                    autoFilterRange: `A4:F${sheetRows.length}`
                }
            ];

            return {
                buffer: generateXlsx(sheets),
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: sanitizeFilename(`sla_report_${dateStamp}`, 'xlsx')
            };
        }

        const columns = [
            { key: 'orderNumber', label: 'Order #', width: 90 },
            { key: 'customerName', label: 'Customer', width: 120 },
            { key: 'driverName', label: 'Courier', width: 110 },
            { key: 'durationMinutes', label: 'Duration (m)', width: 80, align: 'right' },
            { key: 'excessMinutes', label: 'Excess (m)', width: 80, align: 'right' }
        ];

        const pdfBuffer = generatePdf('Delivery SLA Delayed Incidents', columns, delayed, {
            generatedAt: dateStamp
        });

        return {
            buffer: pdfBuffer,
            mimeType: 'application/pdf',
            filename: sanitizeFilename(`sla_report_${dateStamp}`, 'pdf')
        };
    }

    // ========================================================================
    // FINANCIAL RECONCILIATION EXPORT
    // ========================================================================
    async exportFinancialReport(opts, dateStamp) {
        const report = await orderService.getFinancialReconciliationReport(opts);
        const summary = report.summary || {};
        const payment = report.paymentBreakdown || {};
        const balances = report.driverCashBalances || [];

        if (opts.format === 'csv') {
            const rows = [
                ['Food Hub Admin - Financial Cashflow & COD Settlement Report'],
                ['Generated Date', dateStamp],
                [],
                ['FINANCIAL OVERVIEW'],
                ['Gross Merchandise Value (GMV) (ETB)', Number(summary.gmv || 0).toFixed(2)],
                ['Food Subtotal (ETB)', Number(summary.foodSubtotal || 0).toFixed(2)],
                ['Platform Net Revenue (Take) (ETB)', Number(summary.platformNetRevenue || 0).toFixed(2)],
                ['Courier Payouts (ETB)', Number(summary.courierPayouts || 0).toFixed(2)],
                ['Sales Tax Collected (ETB)', Number(summary.taxesCollected || 0).toFixed(2)],
                ['Online Card Revenue (ETB)', Number(payment.cardRevenue || 0).toFixed(2)],
                ['Cash on Delivery Revenue (ETB)', Number(payment.codRevenue || 0).toFixed(2)],
                [],
                ['DRIVER COD SETTLEMENT RECONCILIATION'],
                ['Courier', 'Phone', 'COD Orders', 'Cash Collected (ETB)', 'Fees Earned (ETB)', 'Net Deposit Owed (ETB)'],
                ...balances.map((d) => [
                    d.driverName,
                    d.phone || 'N/A',
                    d.ordersCount,
                    Number(d.codCollected || 0).toFixed(2),
                    Number(d.deliveryFeesEarned || 0).toFixed(2),
                    Number(d.netDepositOwed || 0).toFixed(2)
                ])
            ];

            return {
                buffer: generateCsv(rows),
                mimeType: 'text/csv; charset=utf-8',
                filename: sanitizeFilename(`financial_settlement_${dateStamp}`, 'csv')
            };
        }

        const codRows = [
            ['Food Hub Admin — Driver COD Settlement Reconciliation'],
            ['Generated', dateStamp],
            [],
            ['Courier', 'Phone', 'COD Orders', 'Cash Collected (ETB)', 'Fees Earned (ETB)', 'Net Deposit Owed (ETB)'],
            ...balances.map((d) => [
                d.driverName,
                d.phone || 'N/A',
                Number(d.ordersCount || 0),
                Number(d.codCollected || 0),
                Number(d.deliveryFeesEarned || 0),
                Number(d.netDepositOwed || 0)
            ])
        ];

        if (opts.format === 'excel') {
            const sheets = [
                {
                    name: 'COD Reconciliation',
                    rows: codRows,
                    headerRows: new Set([3]),
                    sectionRows: new Set([0]),
                    headerRowIndex: 3,
                    autoFilterRange: `A4:F${codRows.length}`
                }
            ];

            return {
                buffer: generateXlsx(sheets),
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: sanitizeFilename(`financial_settlement_${dateStamp}`, 'xlsx')
            };
        }

        const columns = [
            { key: 'driverName', label: 'Courier Name', width: 120 },
            { key: 'ordersCount', label: 'COD Trips', width: 70, align: 'right' },
            { key: 'codCollected', label: 'Cash Collected (ETB)', width: 100, align: 'right' },
            { key: 'deliveryFeesEarned', label: 'Fees Earned (ETB)', width: 90, align: 'right' },
            { key: 'netDepositOwed', label: 'Net Deposit Owed (ETB)', width: 110, align: 'right' }
        ];

        const pdfBuffer = generatePdf('Driver COD Settlement Reconciliation', columns, balances, {
            generatedAt: dateStamp
        });

        return {
            buffer: pdfBuffer,
            mimeType: 'application/pdf',
            filename: sanitizeFilename(`financial_settlement_${dateStamp}`, 'pdf')
        };
    }
}

module.exports = new ExportService();
