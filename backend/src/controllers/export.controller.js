/**
 * Enterprise Report Export Controller
 * Exposes /api/admin/export/:type endpoint.
 * Protected by admin authorization.
 */

const exportService = require('../services/export.service');

const exportData = async (req, res, next) => {
    try {
        const { type } = req.params;
        const result = await exportService.exportRecords(type, req.query);

        // Set safe headers to prevent HTTP Response Header Injection and enforce download
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${result.filename}"; filename*=UTF-8''${encodeURIComponent(result.filename)}`
        );
        res.setHeader('Content-Length', result.buffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.end(result.buffer);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

module.exports = {
    exportData
};
