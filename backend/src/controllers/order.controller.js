const orderService = require('../services/order.service');
const { uploadBuffer } = require('../services/cloudinary.service');

// ==================== USER ORDER CONTROLLERS ====================

const createOrder = async (req, res, next) => {
    try {
        const { paymentMethod, deliveryAddress, specialInstructions, promoCode, tip } = req.body || {};
        const order = await orderService.createOrder({
            userId: req.user._id,
            paymentMethod,
            deliveryAddress,
            specialInstructions,
            promoCode,
            tip
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const result = await orderService.getMyOrders({
            userId: req.user._id,
            page,
            limit,
            status
        });

        res.json({
            success: true,
            count: result.orders.length,
            total: result.totalOrders,
            page: result.page,
            totalPages: Math.ceil(result.totalOrders / result.limit),
            data: result.orders
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById({
            id,
            userId: req.user._id,
            isAdmin: req.user.role === 'admin',
            isDriver: req.user.role === 'driver'
        });

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body || {};
        const result = await orderService.cancelOrder({
            id,
            userId: req.user._id,
            reason
        });

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// ==================== ADMIN ORDER CONTROLLERS ====================

const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status: rawStatus, note } = req.body || {};
        const result = await orderService.updateOrderStatus({
            id,
            rawStatus,
            note,
            adminUserId: req.user?._id
        });

        if (result.unchanged) {
            return res.json({
                success: true,
                message: 'Order status unchanged',
                data: result.data
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: result.data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        const result = await orderService.getAllOrders(req.query);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getAvailableDrivers = async (req, res, next) => {
    try {
        const drivers = await orderService.getAvailableDrivers();
        res.json({
            success: true,
            count: drivers.length,
            data: drivers
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const assignDriverToOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { driverId, note } = req.body || {};
        const order = await orderService.assignDriverToOrder({
            id,
            driverId,
            note,
            adminUserId: req.user?._id
        });

        res.json({
            success: true,
            message: 'Driver assigned successfully',
            data: order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const sendOrderEmailNotification = async (req, res, next) => {
    try {
        await orderService.sendOrderEmailNotification({
            id: req.params.id,
            adminUserId: req.user?._id
        });
        res.json({ success: true, message: 'Email notification sent' });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const sendOrderSMSNotification = async (req, res, next) => {
    try {
        await orderService.sendOrderSMSNotification({
            id: req.params.id,
            adminUserId: req.user?._id
        });
        res.json({ success: true, message: 'SMS notification sent' });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const sendOrderMessageNotification = async (req, res, next) => {
    try {
        const { message } = req.body || {};
        await orderService.sendOrderMessageNotification({
            id: req.params.id,
            message,
            adminUserId: req.user?._id
        });
        res.json({ success: true, message: 'Message sent' });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getOrderMessages = async (req, res, next) => {
    try {
        const communications = await orderService.getOrderMessages({
            id: req.params.id,
            user: req.user
        });
        res.json({
            success: true,
            count: communications.length,
            data: communications
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const sendOrderConversationMessage = async (req, res, next) => {
    try {
        const text = String(req.body?.message || '').trim();
        const communication = await orderService.sendOrderConversationMessage({
            id: req.params.id,
            user: req.user,
            text
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: communication
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// ==================== DRIVER WORKFLOW CONTROLLERS ====================

const getAvailableDriverOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getAvailableDriverOrders();
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getDriverOrders = async (req, res, next) => {
    try {
        const { status } = req.query;
        const orders = await orderService.getDriverOrders({
            driverId: req.user._id,
            status
        });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const acceptDeliveryRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};
        const order = await orderService.acceptDeliveryRequest({
            id,
            driverUser: req.user,
            note
        });

        res.json({
            success: true,
            message: 'Delivery request accepted',
            data: order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const declineDeliveryRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};
        const result = await orderService.declineDeliveryRequest({
            id,
            driverUser: req.user,
            note
        });

        res.json({
            success: true,
            message: 'Delivery request declined',
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const checkInAtRestaurant = async (req, res, next) => {
    try {
        const order = await orderService.checkInAtRestaurant({
            id: req.params.id,
            driverUser: req.user
        });

        res.json({
            success: true,
            message: 'Checked in at restaurant',
            data: order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const markOrderPickedUp = async (req, res, next) => {
    try {
        const { verifyItems, verifyPackaging, verifyTamperSeal, note } = req.body || {};
        const order = await orderService.markOrderPickedUp({
            id: req.params.id,
            driverUser: req.user,
            verifyItems,
            verifyPackaging,
            verifyTamperSeal,
            note
        });

        res.json({
            success: true,
            message: 'Order marked as picked up',
            data: order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const startDeliveryTransit = async (req, res, next) => {
    try {
        const { instructionsFollowed, note } = req.body || {};
        const order = await orderService.startDeliveryTransit({
            id: req.params.id,
            driverUser: req.user,
            instructionsFollowed,
            note
        });

        res.json({
            success: true,
            message: 'Delivery transit started',
            data: order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const completeDelivery = async (req, res, next) => {
    try {
        const {
            handoffType,
            codCollected,
            codAmount,
            note,
            proofOfDeliveryUrl,
            proofOfDeliveryNotes
        } = req.body || {};

        const order = await orderService.completeDelivery({
            id: req.params.id,
            driverUser: req.user,
            handoffType,
            codCollected,
            codAmount,
            note,
            proofOfDeliveryUrl,
            proofOfDeliveryNotes
        });

        res.json({
            success: true,
            message: 'Delivery completed successfully',
            data: order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const uploadProofOfDelivery = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided for proof of delivery'
            });
        }

        const uploaded = await uploadBuffer(req.file, { folder: 'proof-of-delivery' });
        const imageUrl = uploaded?.secure_url || uploaded?.url;

        res.json({
            success: true,
            message: 'Proof of delivery image uploaded successfully',
            data: {
                imageUrl,
                publicId: uploaded?.public_id || null
            }
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getDriverProfile = async (req, res, next) => {
    try {
        const profile = await orderService.getDriverProfile({
            driverUser: req.user
        });

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const updateDriverStatus = async (req, res, next) => {
    try {
        const { isAvailable } = req.body || {};
        const profile = await orderService.updateDriverStatus({
            driverUser: req.user,
            isAvailable
        });

        res.json({
            success: true,
            message: `Driver status set to ${profile.isAvailable ? 'online' : 'offline'}`,
            data: profile
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const submitPostDeliveryReport = async (req, res, next) => {
    try {
        const { customerRating, issueType, issueDescription } = req.body || {};
        const result = await orderService.submitPostDeliveryReport({
            id: req.params.id,
            driverUser: req.user,
            customerRating,
            issueType,
            issueDescription
        });

        res.json({
            success: true,
            message: 'Post-delivery report submitted',
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const submitDriverCompliance = async (req, res, next) => {
    try {
        const {
            vehicleConditionOk,
            trafficLawsFollowed,
            hygieneStandardsMet,
            uniformWorn
        } = req.body || {};

        const result = await orderService.submitDriverCompliance({
            id: req.params.id,
            driverUser: req.user,
            vehicleConditionOk,
            trafficLawsFollowed,
            hygieneStandardsMet,
            uniformWorn
        });

        res.json({
            success: true,
            message: 'Compliance checklist submitted',
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// ==================== DASHBOARD & REPORTING ====================

const getDashboardStats = async (req, res, next) => {
    try {
        const data = await orderService.getDashboardStats(req.query);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getSalesReport = async (req, res, next) => {
    try {
        const { period, days, startDate, endDate, category, status, paymentMethod, minAmount, maxAmount } = req.query;
        const result = await orderService.getSalesReport({
            period,
            days,
            startDate,
            endDate,
            category,
            status,
            paymentMethod,
            minAmount,
            maxAmount
        });
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getDriverAnalyticsReport = async (req, res, next) => {
    try {
        const { days, startDate, endDate } = req.query;
        const result = await orderService.getDriverAnalyticsReport({
            days,
            startDate,
            endDate
        });
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getDeliverySlaReport = async (req, res, next) => {
    try {
        const { days, startDate, endDate } = req.query;
        const result = await orderService.getDeliverySlaReport({
            days,
            startDate,
            endDate
        });
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getFinancialReconciliationReport = async (req, res, next) => {
    try {
        const { days, startDate, endDate } = req.query;
        const result = await orderService.getFinancialReconciliationReport({
            days,
            startDate,
            endDate
        });
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
    // User
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getOrderMessages,
    sendOrderConversationMessage,
    // Driver
    getAvailableDriverOrders,
    getDriverOrders,
    getDriverProfile,
    updateDriverStatus,
    uploadProofOfDelivery,
    acceptDeliveryRequest,
    declineDeliveryRequest,
    checkInAtRestaurant,
    markOrderPickedUp,
    startDeliveryTransit,
    completeDelivery,
    submitPostDeliveryReport,
    submitDriverCompliance,
    // Admin Driver Assignment
    getAvailableDrivers,
    assignDriverToOrder,
    sendOrderEmailNotification,
    sendOrderSMSNotification,
    sendOrderMessageNotification,
    // Admin
    getAllOrders,
    updateOrderStatus,
    getDashboardStats,
    getSalesReport,
    getDriverAnalyticsReport,
    getDeliverySlaReport,
    getFinancialReconciliationReport
};
