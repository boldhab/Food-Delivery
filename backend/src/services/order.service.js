const prisma = require('../config/prisma');
const {
    calculateOrderTotals,
    getStatusDescription
} = require('../utils/order.utils');
const { emitOrderUpdate, emitNewMessage, emitNewOrder } = require('../config/socket');

const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
};

const notifyAdmins = async ({ title, message, link, metadata = {} }) => {
    const admins = await prisma.user.findMany({
        where: { role: 'admin', isActive: true },
        select: { id: true }
    });
    if (!admins.length) return;

    await prisma.notification.createMany({
        data: admins.map((adminUser) => ({
            recipientId: adminUser.id,
            type: 'info',
            title,
            message,
            link,
            metadata
        }))
    });
};

const normalizeOrder = (order) => {
    if (!order) return null;
    return {
        ...order,
        _id: order.id,
        items: Array.isArray(order.items)
            ? order.items.map((item) => ({
                  ...item,
                  _id: item.id,
                  foodId: item.food ? { ...item.food, _id: item.food.id } : item.foodId
              }))
            : [],
        statusHistory: Array.isArray(order.statusHistory)
            ? order.statusHistory.map((h) => ({
                  ...h,
                  _id: h.id,
                  description: getStatusDescription(h.status)
              }))
            : [],
        userDetails: {
            name: order.customerName,
            email: order.customerEmail,
            phone: order.customerPhone
        },
        deliveryAddress: {
            street: order.deliveryStreet,
            city: order.deliveryCity,
            state: order.deliveryState,
            zipCode: order.deliveryZipCode,
            instructions: order.deliveryInstructions
        }
    };
};

const canAccessOrderConversation = (order, user) => {
    if (!order || !user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'user') return order.userId === user.id;
    if (user.role === 'driver') {
        return order.driverId === user.id;
    }
    return false;
};

const createOrder = async ({ userId, paymentMethod, deliveryAddress = {}, specialInstructions, promoCode, tip = 0 }) => {
    if (!paymentMethod) {
        const error = new Error('Payment method is required');
        error.statusCode = 400;
        throw error;
    }

    if (!deliveryAddress.street || !deliveryAddress.city) {
        const error = new Error('Complete delivery address is required');
        error.statusCode = 400;
        throw error;
    }

    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: { food: true }
            }
        }
    });

    if (!cart || cart.items.length === 0) {
        const error = new Error('Cart is empty');
        error.statusCode = 400;
        throw error;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
        const food = item.food;
        if (!food || !food.isAvailable) {
            const error = new Error(`${item.name} is no longer available`);
            error.statusCode = 400;
            throw error;
        }

        const totalPrice = food.price * item.quantity;
        orderItemsData.push({
            foodId: food.id,
            name: food.name,
            quantity: item.quantity,
            price: food.price,
            totalPrice,
            snapshot: {
                name: food.name,
                price: food.price,
                image: food.image,
                isVegetarian: food.isVegetarian
            }
        });
        subtotal += totalPrice;
    }

    let discount = 0;
    let appliedPromo = null;
    if (promoCode) {
        const promo = await prisma.promotion.findUnique({
            where: { code: String(promoCode).trim().toUpperCase() }
        });
        const now = new Date();
        if (promo && promo.isActive) {
            const isStarted = !promo.startDate || promo.startDate <= now;
            const isNotExpired = !promo.endDate || promo.endDate >= now;
            const notExceeded = !promo.maxUses || promo.usedCount < promo.maxUses;
            const meetsMin = !promo.minOrderAmount || subtotal >= promo.minOrderAmount;
            if (isStarted && isNotExpired && notExceeded && meetsMin) {
                discount = promo.type === 'percent' ? (subtotal * promo.value) / 100 : Math.min(subtotal, promo.value);
                discount = parseFloat(discount.toFixed(2));
                appliedPromo = promo;
            }
        }
    }

    const { tax, deliveryFee } = calculateOrderTotals(subtotal);
    const numericTip = Number(tip) > 0 ? parseFloat(Number(tip).toFixed(2)) : 0;
    const finalTotal = parseFloat(Math.max(0, subtotal - discount + tax + deliveryFee + numericTip).toFixed(2));
    const orderNumber = generateOrderNumber();

    // Use transaction for atomic order creation and cart clearing
    const order = await prisma.$transaction(async (tx) => {
        if (appliedPromo) {
            await tx.promotion.update({
                where: { id: appliedPromo.id },
                data: { usedCount: { increment: 1 } }
            });
        }

        const newOrder = await tx.order.create({
            data: {
                orderNumber,
                userId,
                customerName: user.name,
                customerEmail: user.email,
                customerPhone: user.phone,
                deliveryStreet: deliveryAddress.street,
                deliveryCity: deliveryAddress.city,
                deliveryState: deliveryAddress.state || '',
                deliveryZipCode: deliveryAddress.zipCode || '',
                deliveryInstructions: deliveryAddress.instructions || specialInstructions || '',
                subtotal,
                tax,
                deliveryFee,
                totalAmount: finalTotal,
                paymentMethod,
                paymentStatus: 'pending',
                orderStatus: 'pending',
                specialInstructions,
                driverWorkflow: {
                    tip: numericTip,
                    deliveryFee,
                    estimatedPayout: parseFloat((deliveryFee + numericTip).toFixed(2))
                },
                items: {
                    create: orderItemsData
                },
                statusHistory: {
                    create: {
                        status: 'pending',
                        note: 'Order placed successfully',
                        updatedById: userId
                    }
                }
            },
            include: {
                items: { include: { food: true } },
                statusHistory: true
            }
        });

        // Deduct inventory stock for items tracking inventory
        for (const item of cart.items) {
            if (item.food && item.food.trackStock) {
                const currentStock = Number(item.food.stockQuantity ?? 50);
                const orderQty = Number(item.quantity || 1);
                const newStock = Math.max(0, currentStock - orderQty);
                await tx.food.update({
                    where: { id: item.food.id },
                    data: {
                        stockQuantity: newStock,
                        isAvailable: newStock > 0
                    }
                });
            }
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({
            where: { id: cart.id },
            data: { subtotal: 0, totalItems: 0 }
        });

        return newOrder;
    });

    try {
        await notifyAdmins({
            title: `New Order #${order.orderNumber}`,
            message: `${user.name} placed a new order for $${finalTotal.toFixed(2)}`,
            link: `/admin/orders/${order.id}`,
            metadata: { orderId: order.id, totalAmount: finalTotal }
        });
    } catch (notifErr) {
        console.error('Failed to notify admins of new order:', notifErr);
    }

    const normalizedOrder = normalizeOrder(order);
    try {
        emitNewOrder(normalizedOrder);
    } catch (_err) {
        // Safe fallback if sockets not yet initialized
    }

    return normalizedOrder;
};

const getMyOrders = async ({ userId, page = 1, limit = 10, status }) => {
    const where = { userId };
    if (status) where.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, totalOrders] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
            include: {
                items: true
            }
        }),
        prisma.order.count({ where })
    ]);

    return {
        orders: orders.map(normalizeOrder),
        totalOrders,
        page: Number(page),
        limit: Number(limit)
    };
};

const orderDetailInclude = {
    items: { include: { food: true } },
    user: { select: { id: true, name: true, email: true, phone: true } },
    driver: { select: { id: true, name: true, email: true, phone: true } },
    statusHistory: { orderBy: { timestamp: 'asc' } },
    communications: { orderBy: { createdAt: 'asc' } }
};

const emitHydratedOrderUpdate = async (orderId) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: orderDetailInclude
        });
        if (order) {
            emitOrderUpdate(orderId, normalizeOrder(order));
        }
    } catch (_err) {
        // Safe fallback in test or detached contexts
    }
};

const getOrderById = async ({ id, userId, isAdmin, isDriver }) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: orderDetailInclude
    });

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    const isAssignedDriver = order.driverId === userId;
    if (order.userId !== userId && !isAdmin && !(isDriver && isAssignedDriver)) {
        const error = new Error('Not authorized to view this order');
        error.statusCode = 403;
        throw error;
    }

    return normalizeOrder(order);
};

const cancelOrder = async ({ id, userId, reason }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    if (order.userId !== userId) {
        const error = new Error('Not authorized to cancel this order');
        error.statusCode = 403;
        throw error;
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
        const error = new Error(`Order cannot be cancelled at ${order.orderStatus} stage`);
        error.statusCode = 400;
        throw error;
    }

    const updated = await prisma.order.update({
        where: { id },
        data: {
            orderStatus: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: reason || 'Cancelled by user',
            cancelledById: userId,
            statusHistory: {
                create: {
                    status: 'cancelled',
                    note: reason || 'Order cancelled by user',
                    updatedById: userId
                }
            }
        }
    });

    await emitHydratedOrderUpdate(id);

    return {
        orderNumber: updated.orderNumber,
        orderStatus: updated.orderStatus,
        cancelledAt: updated.cancelledAt
    };
};

const updateOrderStatus = async ({ id, rawStatus, note, adminUserId }) => {
    const status = (rawStatus || '').toLowerCase().trim();
    const allowed = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'rejected'];

    if (!allowed.includes(status)) {
        const error = new Error(`Invalid status: ${rawStatus}`);
        error.statusCode = 400;
        throw error;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    if (order.orderStatus === status) {
        return {
            unchanged: true,
            data: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus
            }
        };
    }

    const updateData = {
        orderStatus: status,
        statusHistory: {
            create: {
                status,
                note: note || `Status updated to ${status}`,
                updatedById: adminUserId
            }
        }
    };

    if (status === 'delivered') {
        updateData.actualDeliveryTime = new Date();
        updateData.paymentStatus = 'paid';
    }

    if (status === 'cancelled' || status === 'rejected') {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = note || `Order ${status} by admin`;
        updateData.cancelledById = adminUserId;
    }

    const updated = await prisma.order.update({
        where: { id },
        data: updateData
    });

    await emitHydratedOrderUpdate(id);

    return {
        unchanged: false,
        data: {
            orderId: updated.id,
            orderNumber: updated.orderNumber,
            orderStatus: updated.orderStatus,
            paymentStatus: updated.paymentStatus
        }
    };
};

const getAllOrders = async ({ page = 1, limit = 10, status, paymentStatus, driver, startDate, endDate, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const where = {};
    if (status) where.orderStatus = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (driver) where.driverId = driver;

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }

    if (search) {
        where.OR = [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const orderBy = {};
    orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [orders, totalOrders, aggregateStats] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy,
            skip,
            take: Number(limit),
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                driver: { select: { id: true, name: true, email: true, phone: true } },
                items: true
            }
        }),
        prisma.order.count({ where }),
        prisma.order.aggregate({
            where,
            _sum: { totalAmount: true },
            _avg: { totalAmount: true },
            _min: { totalAmount: true },
            _max: { totalAmount: true },
            _count: true
        })
    ]);

    return {
        orders: orders.map(normalizeOrder),
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalOrders,
            pages: Math.ceil(totalOrders / Number(limit))
        },
        summary: {
            totalRevenue: aggregateStats._sum.totalAmount || 0,
            averageOrderValue: aggregateStats._avg.totalAmount || 0,
            minOrderValue: aggregateStats._min.totalAmount || 0,
            maxOrderValue: aggregateStats._max.totalAmount || 0,
            orderCount: aggregateStats._count || 0
        }
    };
};

const getAvailableDrivers = async () => {
    const drivers = await prisma.user.findMany({
        where: { role: 'driver', isActive: true },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            driverProfile: true
        },
        orderBy: { createdAt: 'desc' }
    });
    return drivers.map((d) => ({ ...d, _id: d.id }));
};

const assignDriverToOrder = async ({ id, driverId, note, adminUserId }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    const driverUser = await prisma.user.findFirst({
        where: { id: driverId, role: 'driver', isActive: true },
        include: { driverProfile: true }
    });
    if (!driverUser) {
        const error = new Error('Active driver not found');
        error.statusCode = 404;
        throw error;
    }

    const updated = await prisma.order.update({
        where: { id },
        data: {
            driverId: driverUser.id,
            driverWorkflow: {
                assignmentStatus: 'accepted',
                assignmentNote: note || 'Driver assigned by admin',
                acceptedAt: new Date()
            },
            statusHistory: {
                create: {
                    status: order.orderStatus,
                    note: note || `Driver assigned: ${driverUser.name}`,
                    updatedById: adminUserId
                }
            }
        },
        include: {
            driver: { select: { id: true, name: true, email: true, phone: true } },
            items: true
        }
    });

    await emitHydratedOrderUpdate(id);

    return normalizeOrder(updated);
};

const sendOrderEmailNotification = async ({ id, adminUserId }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    await prisma.notification.create({
        data: {
            recipientId: adminUserId,
            type: 'info',
            title: 'Email notification sent',
            message: `Email sent for order #${order.orderNumber}`,
            link: `/admin/orders/${order.id}`,
            metadata: { orderId: order.id, channel: 'email' }
        }
    });
};

const sendOrderSMSNotification = async ({ id, adminUserId }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    await prisma.notification.create({
        data: {
            recipientId: adminUserId,
            type: 'info',
            title: 'SMS notification sent',
            message: `SMS sent for order #${order.orderNumber}`,
            link: `/admin/orders/${order.id}`,
            metadata: { orderId: order.id, channel: 'sms' }
        }
    });
};

const sendOrderMessageNotification = async ({ id, message, adminUserId }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    await prisma.notification.createMany({
        data: [
            {
                recipientId: adminUserId,
                type: 'success',
                title: 'Message sent to customer',
                message: message || `Message sent for order #${order.orderNumber}`,
                link: `/admin/orders/${order.id}`
            },
            {
                recipientId: order.userId,
                type: 'info',
                title: 'New message about your order',
                message: message || `You have a new update for order #${order.orderNumber}`,
                link: `/orders`
            }
        ]
    });
};

const getOrderMessages = async ({ id, user }) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            communications: {
                include: { sender: { select: { id: true, name: true, role: true } } },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    if (!canAccessOrderConversation(order, user)) {
        const error = new Error('Not authorized to view conversation');
        error.statusCode = 403;
        throw error;
    }

    return order.communications.map((c) => ({
        _id: c.id,
        id: c.id,
        sender: c.sender ? { ...c.sender, _id: c.sender.id } : c.senderId,
        senderRole: c.senderRole,
        message: c.message,
        createdAt: c.createdAt
    }));
};

const sendOrderConversationMessage = async ({ id, user, text }) => {
    if (!text) {
        const error = new Error('message is required');
        error.statusCode = 400;
        throw error;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    if (!canAccessOrderConversation(order, user)) {
        const error = new Error('Not authorized to send message for this order');
        error.statusCode = 403;
        throw error;
    }

    const senderRole = user.role === 'driver' ? 'driver' : user.role === 'admin' ? 'admin' : 'user';

    const comm = await prisma.orderCommunication.create({
        data: {
            orderId: id,
            senderId: user.id,
            senderRole,
            message: text
        },
        include: {
            sender: { select: { id: true, name: true, role: true } }
        }
    });

    const messageData = {
        _id: comm.id,
        id: comm.id,
        sender: { ...comm.sender, _id: comm.sender.id },
        senderRole: comm.senderRole,
        message: comm.message,
        createdAt: comm.createdAt
    };

    try {
        emitNewMessage(id, messageData);
    } catch (_err) {
        // Safe fallback
    }

    return messageData;
};

const getAvailableDriverOrders = async () => {
    const orders = await prisma.order.findMany({
        where: {
            orderStatus: { in: ['confirmed', 'preparing'] },
            driverId: null
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
    return orders.map(normalizeOrder);
};

const getDriverOrders = async ({ driverId, status }) => {
    const where = { driverId };
    if (status) where.orderStatus = status;

    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            items: true
        }
    });
    return orders.map(normalizeOrder);
};

const acceptDeliveryRequest = async ({ id, driverUser, note }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    if (order.driverId && order.driverId !== driverUser.id) {
        const error = new Error('Order already assigned to another driver');
        error.statusCode = 400;
        throw error;
    }

    const existingWf = (order.driverWorkflow && typeof order.driverWorkflow === 'object') ? order.driverWorkflow : {};
    const updated = await prisma.order.update({
        where: { id },
        data: {
            driverId: driverUser.id,
            driverWorkflow: {
                ...existingWf,
                assignmentStatus: 'accepted',
                assignmentNote: note || 'Delivery accepted by driver',
                acceptedAt: new Date()
            },
            statusHistory: {
                create: {
                    status: order.orderStatus,
                    note: note || 'Driver accepted the delivery request',
                    updatedById: driverUser.id
                }
            }
        },
        include: { items: true }
    });

    try {
        await prisma.driverProfile.updateMany({
            where: { userId: driverUser.id },
            data: { activeOrderId: id }
        });
    } catch (_err) {
        // quiet fallback
    }

    await emitHydratedOrderUpdate(id);

    return normalizeOrder(updated);
};

const declineDeliveryRequest = async ({ id, driverUser, note }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    await prisma.order.update({
        where: { id },
        data: {
            driverWorkflow: {
                assignmentStatus: 'declined',
                assignmentNote: note || 'Delivery declined by driver',
                declinedAt: new Date()
            },
            statusHistory: {
                create: {
                    status: order.orderStatus,
                    note: note || 'Driver declined the delivery request',
                    updatedById: driverUser.id
                }
            }
        }
    });

    await emitHydratedOrderUpdate(id);

    return { orderId: id, assignmentStatus: 'declined' };
};

const checkInAtRestaurant = async ({ id, driverUser }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.driverId !== driverUser.id) {
        const error = new Error('Not authorized for this delivery');
        error.statusCode = 403;
        throw error;
    }

    const updated = await prisma.order.update({
        where: { id },
        data: {
            statusHistory: {
                create: {
                    status: order.orderStatus,
                    note: 'Driver checked in at restaurant',
                    updatedById: driverUser.id
                }
            }
        },
        include: { items: true }
    });

    await emitHydratedOrderUpdate(id);

    return normalizeOrder(updated);
};

const markOrderPickedUp = async ({ id, driverUser, verifyItems, verifyPackaging, verifyTamperSeal, note }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.driverId !== driverUser.id) {
        const error = new Error('Not authorized for this delivery');
        error.statusCode = 403;
        throw error;
    }

    const updated = await prisma.order.update({
        where: { id },
        data: {
            orderStatus: 'out_for_delivery',
            driverWorkflow: {
                pickedUpAt: new Date(),
                pickupVerified: {
                    items: Boolean(verifyItems),
                    packaging: Boolean(verifyPackaging),
                    tamperSeal: Boolean(verifyTamperSeal)
                }
            },
            statusHistory: {
                create: {
                    status: 'out_for_delivery',
                    note: note || 'Order picked up and sealed for transit',
                    updatedById: driverUser.id
                }
            }
        },
        include: { items: true }
    });

    await emitHydratedOrderUpdate(id);

    return normalizeOrder(updated);
};

const startDeliveryTransit = async ({ id, driverUser, instructionsFollowed, note }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.driverId !== driverUser.id) {
        const error = new Error('Not authorized for this delivery');
        error.statusCode = 403;
        throw error;
    }

    const updated = await prisma.order.update({
        where: { id },
        data: {
            statusHistory: {
                create: {
                    status: 'out_for_delivery',
                    note: note || 'Driver is in transit for last-mile delivery',
                    updatedById: driverUser.id
                }
            }
        },
        include: { items: true }
    });

    await emitHydratedOrderUpdate(id);

    return normalizeOrder(updated);
};

const completeDelivery = async ({
    id,
    driverUser,
    handoffType = 'in_person',
    codCollected = false,
    codAmount = 0,
    note,
    proofOfDeliveryUrl,
    proofOfDeliveryNotes
}) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.driverId !== driverUser.id) {
        const error = new Error('Not authorized for this delivery');
        error.statusCode = 403;
        throw error;
    }

    const existingWorkflow = (order.driverWorkflow && typeof order.driverWorkflow === 'object') ? order.driverWorkflow : {};
    const tipAmount = Number(existingWorkflow.tip || 0);
    const feeAmount = Number(order.deliveryFee || 0);
    const totalTripEarnings = parseFloat((feeAmount + tipAmount).toFixed(2));

    const proofOfDelivery = proofOfDeliveryUrl ? {
        imageUrl: proofOfDeliveryUrl,
        notes: proofOfDeliveryNotes || '',
        capturedAt: new Date()
    } : existingWorkflow.proofOfDelivery || null;

    const updatedWorkflow = {
        ...existingWorkflow,
        handoffType,
        codCollected: Boolean(codCollected),
        codAmount: Number(codAmount || 0),
        earnings: {
            deliveryFee: feeAmount,
            tip: tipAmount,
            totalEarnings: totalTripEarnings
        },
        proofOfDelivery
    };

    const updated = await prisma.order.update({
        where: { id },
        data: {
            orderStatus: 'delivered',
            actualDeliveryTime: new Date(),
            paymentStatus: order.paymentMethod === 'cash_on_delivery' && codCollected ? 'paid' : order.paymentStatus,
            driverWorkflow: updatedWorkflow,
            statusHistory: {
                create: {
                    status: 'delivered',
                    note: note || (proofOfDelivery ? 'Order delivered with photo proof of delivery' : 'Order delivered to customer'),
                    updatedById: driverUser.id
                }
            }
        },
        include: { items: true }
    });

    try {
        await prisma.driverProfile.updateMany({
            where: { userId: driverUser.id },
            data: {
                completedDeliveries: { increment: 1 },
                activeOrderId: null
            }
        });
    } catch (_err) {
        // quiet fallback
    }

    await emitHydratedOrderUpdate(id);

    return normalizeOrder(updated);
};

const submitPostDeliveryReport = async ({ id, driverUser, customerRating, issueType, issueDescription }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.driverId !== driverUser.id) {
        const error = new Error('Not authorized for this delivery');
        error.statusCode = 403;
        throw error;
    }

    const updated = await prisma.order.update({
        where: { id },
        data: {
            driverWorkflow: {
                customerRating: Number(customerRating || 5),
                issueReport: issueType ? { type: issueType, description: issueDescription || '', reportedAt: new Date() } : undefined
            }
        }
    });

    await emitHydratedOrderUpdate(id);

    return updated.driverWorkflow;
};

const submitDriverCompliance = async ({ id, driverUser, vehicleConditionOk, trafficLawsFollowed, hygieneStandardsMet, uniformWorn }) => {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.driverId !== driverUser.id) {
        const error = new Error('Not authorized for this delivery');
        error.statusCode = 403;
        throw error;
    }

    const compliance = {
        vehicleConditionOk: Boolean(vehicleConditionOk),
        trafficLawsFollowed: Boolean(trafficLawsFollowed),
        hygieneStandardsMet: Boolean(hygieneStandardsMet),
        uniformWorn: Boolean(uniformWorn),
        checkedAt: new Date()
    };

    await prisma.order.update({
        where: { id },
        data: {
            driverWorkflow: { compliance }
        }
    });

    return compliance;
};

const getDashboardStats = async ({ startDate, endDate, days } = {}) => {
    const now = new Date();
    let dateRangeEnd = endDate ? new Date(endDate) : new Date();
    let dateRangeStart;

    if (startDate && endDate) {
        dateRangeStart = new Date(startDate);
        dateRangeEnd = new Date(endDate);
    } else {
        const numDays = Math.max(1, Number(days) || 7);
        dateRangeStart = new Date();
        dateRangeStart.setDate(dateRangeStart.getDate() - numDays);
    }

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const periodDurationMs = Math.max(86400000, dateRangeEnd.getTime() - dateRangeStart.getTime());
    const prevStartDate = new Date(dateRangeStart.getTime() - periodDurationMs);
    const prevEndDate = dateRangeStart;

    const [
        overall,
        today,
        thisMonth,
        prevPeriod,
        periodOrders,
        statusGroups,
        activeUsersCount,
        activeDriversCount,
        recentOrdersRaw,
        recentUsers
    ] = await Promise.all([
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            _avg: { totalAmount: true },
            _count: true
        }),
        prisma.order.aggregate({
            where: { createdAt: { gte: startOfDay } },
            _sum: { totalAmount: true },
            _count: true
        }),
        prisma.order.aggregate({
            where: { createdAt: { gte: startOfMonth } },
            _sum: { totalAmount: true },
            _count: true
        }),
        prisma.order.aggregate({
            where: { createdAt: { gte: prevStartDate, lt: prevEndDate } },
            _sum: { totalAmount: true },
            _count: true
        }),
        prisma.order.findMany({
            where: { createdAt: { gte: dateRangeStart, lte: dateRangeEnd } },
            include: {
                items: {
                    include: { food: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        }),
        prisma.order.groupBy({
            by: ['orderStatus'],
            _count: true,
            _sum: { totalAmount: true }
        }),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: 'driver', isActive: true } }),
        prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                orderStatus: true,
                customerName: true,
                createdAt: true,
                items: {
                    select: {
                        name: true,
                        quantity: true
                    }
                }
            }
        }),
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                role: true,
                createdAt: true
            }
        })
    ]);

    const periodRevenue = periodOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const periodOrdersCount = periodOrders.length;
    const periodAov = periodOrdersCount > 0 ? periodRevenue / periodOrdersCount : 0;

    const previousPeriodRevenue = prevPeriod._sum.totalAmount || 0;
    const previousPeriodOrders = prevPeriod._count || 0;

    // Daily breakdown for RevenueChart
    const salesMap = {};
    const hourMap = {};
    for (let h = 0; h < 24; h += 2) {
        const hourLabel = `${String(h).padStart(2, '0')}:00`;
        hourMap[h] = { hour: h, label: hourLabel, count: 0 };
    }
    const categoryMap = {};
    const topFoodsMap = {};
    let totalDeliveryMinutes = 0;
    let deliveredOrdersCount = 0;

    for (const order of periodOrders) {
        const dateKey = order.createdAt.toISOString().slice(0, 10);
        if (!salesMap[dateKey]) {
            salesMap[dateKey] = { _id: dateKey, date: dateKey, revenue: 0, orders: 0, customers: 0 };
        }
        salesMap[dateKey].revenue += Number(order.totalAmount || 0);
        salesMap[dateKey].orders += 1;
        salesMap[dateKey].customers += 1;

        const hour = new Date(order.createdAt).getHours();
        const bucketHour = Math.floor(hour / 2) * 2;
        if (hourMap[bucketHour]) {
            hourMap[bucketHour].count += 1;
        }

        if (order.orderStatus === 'delivered') {
            const deliveredAt = order.actualDeliveryTime || order.updatedAt;
            if (deliveredAt) {
                const diffMins = Math.max(5, Math.round((new Date(deliveredAt).getTime() - new Date(order.createdAt).getTime()) / 60000));
                totalDeliveryMinutes += diffMins;
                deliveredOrdersCount += 1;
            }
        }

        if (Array.isArray(order.items)) {
            for (const item of order.items) {
                const cat = item.food?.category || 'Specialty';
                if (!categoryMap[cat]) {
                    categoryMap[cat] = { name: cat, count: 0, revenue: 0 };
                }
                const qty = Number(item.quantity || 1);
                const rev = Number(item.totalPrice ?? ((item.price || 0) * qty));
                categoryMap[cat].count += qty;
                categoryMap[cat].revenue += rev;

                const foodName = item.name || item.food?.name || 'Dish';
                const foodId = item.foodId || item.id || foodName;
                if (!topFoodsMap[foodName]) {
                    topFoodsMap[foodName] = {
                        _id: foodId,
                        name: foodName,
                        category: cat,
                        image: item.food?.image || null,
                        orders: 0,
                        revenue: 0
                    };
                }
                topFoodsMap[foodName].orders += qty;
                topFoodsMap[foodName].revenue += rev;
            }
        }
    }

    const totalCategoryItems = Object.values(categoryMap).reduce((sum, c) => sum + c.count, 0);
    const popularCategories = Object.values(categoryMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((cat) => ({
            name: cat.name,
            count: cat.count,
            percentage: totalCategoryItems > 0 ? Number(((cat.count / totalCategoryItems) * 100).toFixed(1)) : 0
        }));

    const totalPeakHourOrders = Object.values(hourMap).reduce((sum, h) => sum + h.count, 0);
    const peakHours = Object.values(hourMap).map((h) => ({
        hour: h.hour,
        count: h.count,
        percentage: totalPeakHourOrders > 0 ? Number(((h.count / totalPeakHourOrders) * 100).toFixed(1)) : 0
    }));

    const topSellingFoods = Object.values(topFoodsMap)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

    const averageDeliveryTime = deliveredOrdersCount > 0
        ? Math.round(totalDeliveryMinutes / deliveredOrdersCount)
        : 24;

    const activityFeed = [];
    recentOrdersRaw.forEach((o) => {
        activityFeed.push({
            type: 'order',
            message: `Order #${o.orderNumber} placed ($${Number(o.totalAmount || 0).toFixed(2)}) by ${o.customerName}`,
            timestamp: o.createdAt
        });
    });
    recentUsers.forEach((u) => {
        activityFeed.push({
            type: 'user',
            message: `New ${u.role === 'driver' ? 'courier' : 'customer'} ${u.name} joined`,
            timestamp: u.createdAt
        });
    });
    activityFeed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const revenueByDay = Object.values(salesMap).sort((a, b) => a._id.localeCompare(b._id));

    return {
        totalRevenue: periodRevenue > 0 || periodOrdersCount > 0 ? periodRevenue : (overall._sum.totalAmount || 0),
        totalOrders: periodOrdersCount > 0 ? periodOrdersCount : (overall._count || 0),
        averageOrderValue: periodAov > 0 ? periodAov : (overall._avg.totalAmount || 0),
        previousPeriodRevenue,
        previousPeriodOrders,
        activeUsers: activeUsersCount,
        activeDrivers: activeDriversCount,
        averageDeliveryTime,
        revenueByDay,
        popularCategories,
        peakHours,
        topSellingFoods,
        recentActivity: activityFeed.slice(0, 6),
        overview: {
            totalRevenue: overall._sum.totalAmount || 0,
            totalOrders: overall._count || 0,
            averageOrderValue: overall._avg.totalAmount || 0
        },
        today: {
            revenue: today._sum.totalAmount || 0,
            orders: today._count || 0
        },
        thisMonth: {
            revenue: thisMonth._sum.totalAmount || 0,
            orders: thisMonth._count || 0
        },
        ordersByStatus: statusGroups.map((g) => ({
            _id: g.orderStatus,
            status: g.orderStatus,
            count: g._count,
            revenue: g._sum.totalAmount || 0
        })),
        recentOrders: recentOrdersRaw.map((o) => ({
            ...o,
            _id: o.id,
            userDetails: { name: o.customerName }
        }))
    };
};

const getSalesReport = async ({
    period = 'daily',
    days = 7,
    startDate,
    endDate,
    category,
    status,
    paymentMethod,
    minAmount,
    maxAmount
} = {}) => {
    let dateRangeStart;
    let dateRangeEnd = endDate ? new Date(endDate) : new Date();
    const numDays = Math.max(1, Number(days) || 7);

    if (startDate && endDate) {
        dateRangeStart = new Date(startDate);
        dateRangeEnd = new Date(endDate);
    } else {
        dateRangeStart = new Date();
        dateRangeStart.setDate(dateRangeStart.getDate() - numDays);
    }

    const where = {
        createdAt: { gte: dateRangeStart, lte: dateRangeEnd }
    };

    if (status && status !== 'all') {
        where.orderStatus = status;
    } else {
        where.orderStatus = { not: 'cancelled' };
    }

    if (paymentMethod && paymentMethod !== 'all') {
        where.paymentMethod = paymentMethod;
    }

    if (minAmount && !Number.isNaN(Number(minAmount))) {
        where.totalAmount = { ...(where.totalAmount || {}), gte: Number(minAmount) };
    }
    if (maxAmount && !Number.isNaN(Number(maxAmount))) {
        where.totalAmount = { ...(where.totalAmount || {}), lte: Number(maxAmount) };
    }

    const orders = await prisma.order.findMany({
        where,
        include: {
            items: {
                include: { food: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    // Calculate previous period for dynamic comparison metrics
    const periodDurationMs = Math.max(86400000, dateRangeEnd.getTime() - dateRangeStart.getTime());
    const prevStartDate = new Date(dateRangeStart.getTime() - periodDurationMs);
    const prevEndDate = dateRangeStart;

    const prevOrders = await prisma.order.findMany({
        where: {
            ...where,
            createdAt: { gte: prevStartDate, lt: prevEndDate }
        },
        select: {
            totalAmount: true,
            orderStatus: true
        }
    });

    const currentRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const currentOrders = orders.length;
    const currentAov = currentOrders > 0 ? currentRevenue / currentOrders : 0;
    const currentDelivered = orders.filter((o) => o.orderStatus === 'delivered').length;
    const currentFulfillmentRate = currentOrders > 0 ? (currentDelivered / currentOrders) * 100 : 0;

    const prevRevenue = prevOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const prevOrdersCount = prevOrders.length;
    const prevAov = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;
    const prevDelivered = prevOrders.filter((o) => o.orderStatus === 'delivered').length;
    const prevFulfillmentRate = prevOrdersCount > 0 ? (prevDelivered / prevOrdersCount) * 100 : 0;

    const calcChange = (curr, prev) => {
        if (!prev || prev === 0) return curr > 0 ? 100 : 0;
        return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const kpis = {
        totalRevenue: Number(currentRevenue.toFixed(2)),
        totalOrders: currentOrders,
        avgOrderValue: Number(currentAov.toFixed(2)),
        conversionRate: Number(currentFulfillmentRate.toFixed(1)),
        revenueChange: calcChange(currentRevenue, prevRevenue),
        ordersChange: calcChange(currentOrders, prevOrdersCount),
        avgOrderValueChange: calcChange(currentAov, prevAov),
        conversionRateChange: Number((currentFulfillmentRate - prevFulfillmentRate).toFixed(1)),
        deliveredCount: currentDelivered,
        prevRevenue: Number(prevRevenue.toFixed(2)),
        prevOrders: prevOrdersCount
    };

    const salesMap = {};
    const hourMap = {};
    for (let h = 0; h < 24; h += 2) {
        const hourStr = `${String(h).padStart(2, '0')}:00`;
        hourMap[hourStr] = { hour: hourStr, orders: 0 };
    }
    const topFoodsMap = {};
    const categoryMap = {};
    const paymentMap = {};

    for (const order of orders) {
        const dateKey = order.createdAt.toISOString().slice(0, 10);
        if (!salesMap[dateKey]) {
            salesMap[dateKey] = { _id: dateKey, date: dateKey, orders: 0, revenue: 0 };
        }
        salesMap[dateKey].orders += 1;
        salesMap[dateKey].revenue += Number(order.totalAmount || 0);

        const orderHour = new Date(order.createdAt).getHours();
        const bucketHour = Math.floor(orderHour / 2) * 2;
        const bucketStr = `${String(bucketHour).padStart(2, '0')}:00`;
        if (!hourMap[bucketStr]) {
            hourMap[bucketStr] = { hour: bucketStr, orders: 0 };
        }
        hourMap[bucketStr].orders += 1;

        const pm = order.paymentMethod || 'cash_on_delivery';
        const pmLabel = pm === 'credit_card' || pm === 'card' ? 'Credit Card'
            : pm === 'debit_card' ? 'Debit Card'
            : pm === 'paypal' ? 'PayPal'
            : pm === 'cash' || pm === 'cash_on_delivery' ? 'Cash on Delivery'
            : pm;
        if (!paymentMap[pmLabel]) {
            paymentMap[pmLabel] = { name: pmLabel, count: 0, value: 0 };
        }
        paymentMap[pmLabel].count += 1;
        paymentMap[pmLabel].value += Number(order.totalAmount || 0);

        if (Array.isArray(order.items)) {
            for (const item of order.items) {
                const itemCat = item.food?.category || 'General';
                if (category && category !== 'all' && itemCat.toLowerCase() !== category.toLowerCase()) {
                    continue;
                }

                const foodName = item.name || item.food?.name || 'Unknown Item';
                if (!topFoodsMap[foodName]) {
                    topFoodsMap[foodName] = { name: foodName, count: 0, orders: 0, revenue: 0 };
                }
                const qty = Number(item.quantity || 1);
                const rev = Number(item.totalPrice ?? ((item.price || 0) * qty));
                topFoodsMap[foodName].count += qty;
                topFoodsMap[foodName].orders += qty;
                topFoodsMap[foodName].revenue += rev;

                if (!categoryMap[itemCat]) {
                    categoryMap[itemCat] = { name: itemCat, count: 0, value: 0 };
                }
                categoryMap[itemCat].count += qty;
                categoryMap[itemCat].value += rev;
            }
        }
    }

    const topSellingItems = Object.values(topFoodsMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const categoryDistribution = Object.values(categoryMap);
    const paymentMethodDistribution = Object.values(paymentMap);
    const hourlyOrders = Object.values(hourMap);

    return {
        period,
        kpis,
        salesData: Object.values(salesMap),
        topSellingItems,
        categoryDistribution,
        categorySales: categoryDistribution,
        hourlyOrders,
        paymentMethodDistribution,
        paymentMethods: paymentMethodDistribution
    };
};

const getDriverAnalyticsReport = async ({ days = 30, startDate, endDate } = {}) => {
    const numDays = Math.max(1, Number(days) || 30);
    let start;
    let end = endDate ? new Date(endDate) : new Date();

    if (startDate && endDate) {
        start = new Date(startDate);
    } else {
        start = new Date();
        start.setDate(start.getDate() - numDays);
    }

    const drivers = await prisma.user.findMany({
        where: { role: 'driver' },
        include: { driverProfile: true },
        orderBy: { name: 'asc' }
    });

    const ordersInPeriod = await prisma.order.findMany({
        where: {
            driverId: { not: null },
            createdAt: { gte: start, lte: end }
        },
        select: {
            id: true,
            orderNumber: true,
            driverId: true,
            orderStatus: true,
            deliveryFee: true,
            totalAmount: true,
            paymentMethod: true,
            paymentStatus: true,
            createdAt: true,
            actualDeliveryTime: true,
            driverWorkflow: true
        }
    });

    const driverOrdersMap = {};
    for (const ord of ordersInPeriod) {
        if (!driverOrdersMap[ord.driverId]) {
            driverOrdersMap[ord.driverId] = [];
        }
        driverOrdersMap[ord.driverId].push(ord);
    }

    let totalFleetDeliveries = 0;
    let totalFleetEarnings = 0;
    let totalCodCollected = 0;

    const driverStats = drivers.map((driver) => {
        const orders = driverOrdersMap[driver.id] || [];
        const completedOrders = orders.filter((o) => o.orderStatus === 'delivered');
        const inTransitOrders = orders.filter((o) => ['picked_up', 'in_transit'].includes(o.orderStatus));

        const earnings = completedOrders.reduce((sum, o) => sum + Number(o.deliveryFee || 0), 0);
        const codCollected = completedOrders
            .filter((o) => o.paymentMethod === 'cash_on_delivery' || o.paymentMethod === 'cash')
            .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

        totalFleetDeliveries += completedOrders.length;
        totalFleetEarnings += earnings;
        totalCodCollected += codCollected;

        return {
            driverId: driver.id,
            driver: driver.name,
            email: driver.email,
            phone: driver.phone,
            vehicleType: driver.driverProfile?.vehicleType || 'Courier',
            plateNumber: driver.driverProfile?.plateNumber || '',
            isAvailable: driver.driverProfile?.isAvailable ?? true,
            deliveries: completedOrders.length,
            lifetimeDeliveries: driver.driverProfile?.completedDeliveries || completedOrders.length,
            activeOrders: inTransitOrders.length,
            rating: Number(driver.driverProfile?.rating || 5.0),
            earnings: Number(earnings.toFixed(2)),
            codCollected: Number(codCollected.toFixed(2))
        };
    });

    driverStats.sort((a, b) => b.deliveries - a.deliveries);

    const avgRating = drivers.length > 0
        ? Number((drivers.reduce((sum, d) => sum + Number(d.driverProfile?.rating || 5), 0) / drivers.length).toFixed(1))
        : 5.0;

    return {
        fleetSummary: {
            totalDrivers: drivers.length,
            activeDrivers: drivers.filter((d) => d.driverProfile?.isAvailable).length,
            totalDeliveries: totalFleetDeliveries,
            totalEarnings: Number(totalFleetEarnings.toFixed(2)),
            totalCodCollected: Number(totalCodCollected.toFixed(2)),
            avgRating
        },
        driverPerformance: driverStats
    };
};

const getDeliverySlaReport = async ({ days = 30, startDate, endDate } = {}) => {
    const numDays = Math.max(1, Number(days) || 30);
    let start;
    let end = endDate ? new Date(endDate) : new Date();

    if (startDate && endDate) {
        start = new Date(startDate);
    } else {
        start = new Date();
        start.setDate(start.getDate() - numDays);
    }

    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: start, lte: end }
        },
        include: {
            driver: true,
            statusHistory: true
        },
        orderBy: { createdAt: 'desc' }
    });

    const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered');
    const totalDelivered = deliveredOrders.length;

    let totalFulfillmentMinutes = 0;
    let totalPrepMinutes = 0;
    let totalTransitMinutes = 0;
    let onTimeCount = 0;
    const delayedOrdersList = [];

    const hourlyMap = {};
    for (let h = 0; h < 24; h += 2) {
        const hStr = `${String(h).padStart(2, '0')}:00`;
        hourlyMap[hStr] = { hour: hStr, totalMinutes: 0, count: 0, avgMinutes: 0 };
    }

    for (const order of deliveredOrders) {
        let durationMinutes = 35;
        const createdMs = new Date(order.createdAt).getTime();

        if (order.actualDeliveryTime) {
            const diffMs = new Date(order.actualDeliveryTime).getTime() - createdMs;
            if (diffMs > 0 && diffMs < 86400000) {
                durationMinutes = Math.round(diffMs / 60000);
            }
        } else if (order.driverWorkflow && order.driverWorkflow.deliveredAt) {
            const diffMs = new Date(order.driverWorkflow.deliveredAt).getTime() - createdMs;
            if (diffMs > 0 && diffMs < 86400000) {
                durationMinutes = Math.round(diffMs / 60000);
            }
        }

        let prepMinutes = 18;
        if (order.driverWorkflow && order.driverWorkflow.pickedUpAt) {
            const prepDiff = new Date(order.driverWorkflow.pickedUpAt).getTime() - createdMs;
            if (prepDiff > 0 && prepDiff < 86400000) {
                prepMinutes = Math.round(prepDiff / 60000);
            }
        }
        let transitMinutes = Math.max(10, durationMinutes - prepMinutes);

        totalFulfillmentMinutes += durationMinutes;
        totalPrepMinutes += prepMinutes;
        totalTransitMinutes += transitMinutes;

        const isLate = durationMinutes > 45;
        if (!isLate) {
            onTimeCount += 1;
        } else {
            delayedOrdersList.push({
                id: order.id,
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                address: `${order.deliveryStreet}, ${order.deliveryCity}`,
                durationMinutes,
                excessMinutes: durationMinutes - 45,
                driverName: order.driver?.name || 'Unassigned',
                createdAt: order.createdAt
            });
        }

        const ordHour = new Date(order.createdAt).getHours();
        const bucketHour = Math.floor(ordHour / 2) * 2;
        const bucketStr = `${String(bucketHour).padStart(2, '0')}:00`;
        if (hourlyMap[bucketStr]) {
            hourlyMap[bucketStr].totalMinutes += durationMinutes;
            hourlyMap[bucketStr].count += 1;
        }
    }

    const avgFulfillmentMinutes = totalDelivered > 0 ? Math.round(totalFulfillmentMinutes / totalDelivered) : 32;
    const avgPrepMinutes = totalDelivered > 0 ? Math.round(totalPrepMinutes / totalDelivered) : 18;
    const avgTransitMinutes = totalDelivered > 0 ? Math.round(totalTransitMinutes / totalDelivered) : 14;
    const onTimeRate = totalDelivered > 0 ? Number(((onTimeCount / totalDelivered) * 100).toFixed(1)) : 100;

    const hourlyDelays = Object.values(hourlyMap).map((h) => ({
        hour: h.hour,
        avgMinutes: h.count > 0 ? Math.round(h.totalMinutes / h.count) : 0,
        orders: h.count
    }));

    delayedOrdersList.sort((a, b) => b.excessMinutes - a.excessMinutes);

    return {
        period: { days: numDays, startDate: start, endDate: end },
        kpis: {
            totalDelivered,
            onTimeRate,
            avgFulfillmentMinutes,
            avgPrepMinutes,
            avgTransitMinutes,
            delayedOrdersCount: delayedOrdersList.length,
            targetSlaMinutes: 45
        },
        cycleStages: [
            { stage: 'Order Processing', minutes: 3, percent: 10 },
            { stage: 'Kitchen Prep', minutes: avgPrepMinutes, percent: Math.round((avgPrepMinutes / (avgFulfillmentMinutes || 1)) * 100) },
            { stage: 'Courier Transit', minutes: avgTransitMinutes, percent: Math.round((avgTransitMinutes / (avgFulfillmentMinutes || 1)) * 100) }
        ],
        hourlyDelays,
        delayedOrders: delayedOrdersList.slice(0, 10)
    };
};

const getFinancialReconciliationReport = async ({ days = 30, startDate, endDate } = {}) => {
    const numDays = Math.max(1, Number(days) || 30);
    let start;
    let end = endDate ? new Date(endDate) : new Date();

    if (startDate && endDate) {
        start = new Date(startDate);
    } else {
        start = new Date();
        start.setDate(start.getDate() - numDays);
    }

    const allOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: start, lte: end }
        },
        include: {
            driver: true
        },
        orderBy: { createdAt: 'asc' }
    });

    const activeOrders = allOrders.filter((o) => o.orderStatus !== 'cancelled');
    const cancelledOrders = allOrders.filter((o) => o.orderStatus === 'cancelled');

    let gmv = 0;
    let foodSubtotal = 0;
    let taxesCollected = 0;
    let deliveryFeesCollected = 0;
    let cardRevenue = 0;
    let codRevenue = 0;

    const dailyMap = {};
    const driverCashMap = {};

    for (const order of activeOrders) {
        const amt = Number(order.totalAmount || 0);
        const sub = Number(order.subtotal || 0);
        const tx = Number(order.tax || 0);
        const df = Number(order.deliveryFee || 0);

        gmv += amt;
        foodSubtotal += sub;
        taxesCollected += tx;
        deliveryFeesCollected += df;

        const pm = String(order.paymentMethod || '').toLowerCase();
        const isCod = pm === 'cash_on_delivery' || pm === 'cash';

        if (isCod) {
            codRevenue += amt;
            if (order.driverId && order.driver) {
                if (!driverCashMap[order.driverId]) {
                    driverCashMap[order.driverId] = {
                        driverId: order.driverId,
                        driverName: order.driver.name,
                        phone: order.driver.phone,
                        codCollected: 0,
                        deliveryFeesEarned: 0,
                        ordersCount: 0
                    };
                }
                driverCashMap[order.driverId].codCollected += amt;
                driverCashMap[order.driverId].deliveryFeesEarned += df;
                driverCashMap[order.driverId].ordersCount += 1;
            }
        } else {
            cardRevenue += amt;
        }

        const dateKey = order.createdAt.toISOString().slice(0, 10);
        if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = {
                date: dateKey,
                gmv: 0,
                foodSubtotal: 0,
                deliveryFee: 0,
                platformNet: 0
            };
        }
        dailyMap[dateKey].gmv += amt;
        dailyMap[dateKey].foodSubtotal += sub;
        dailyMap[dateKey].deliveryFee += df;
        dailyMap[dateKey].platformNet += (sub * 0.15) + (df * 0.20);
    }

    const cancelledLoss = cancelledOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const platformCommission = foodSubtotal * 0.15;
    const platformNet = platformCommission + (deliveryFeesCollected * 0.20);

    const driverCashBalances = Object.values(driverCashMap).map((d) => ({
        ...d,
        codCollected: Number(d.codCollected.toFixed(2)),
        deliveryFeesEarned: Number(d.deliveryFeesEarned.toFixed(2)),
        netDepositOwed: Number((d.codCollected - d.deliveryFeesEarned).toFixed(2))
    }));

    return {
        period: { days: numDays, startDate: start, endDate: end },
        summary: {
            gmv: Number(gmv.toFixed(2)),
            foodSubtotal: Number(foodSubtotal.toFixed(2)),
            taxesCollected: Number(taxesCollected.toFixed(2)),
            deliveryFeesCollected: Number(deliveryFeesCollected.toFixed(2)),
            platformNetRevenue: Number(platformNet.toFixed(2)),
            courierPayouts: Number(deliveryFeesCollected.toFixed(2)),
            cancelledLoss: Number(cancelledLoss.toFixed(2)),
            totalOrders: activeOrders.length,
            cancelledOrdersCount: cancelledOrders.length
        },
        paymentBreakdown: {
            cardRevenue: Number(cardRevenue.toFixed(2)),
            codRevenue: Number(codRevenue.toFixed(2)),
            cardPercent: gmv > 0 ? Math.round((cardRevenue / gmv) * 100) : 0,
            codPercent: gmv > 0 ? Math.round((codRevenue / gmv) * 100) : 0
        },
        dailyCashflow: Object.values(dailyMap),
        driverCashBalances
    };
};

const getDriverProfile = async ({ driverUser }) => {
    const userWithProfile = await prisma.user.findUnique({
        where: { id: driverUser.id },
        include: { driverProfile: true }
    });

    const completedOrders = await prisma.order.findMany({
        where: {
            driverId: driverUser.id,
            orderStatus: 'delivered'
        },
        select: {
            deliveryFee: true,
            driverWorkflow: true,
            createdAt: true,
            updatedAt: true
        }
    });

    const totalEarnings = completedOrders.reduce((acc, curr) => {
        const wf = (curr.driverWorkflow && typeof curr.driverWorkflow === 'object') ? curr.driverWorkflow : {};
        const tip = Number(wf.tip || wf.earnings?.tip || 0);
        const fee = Number(curr.deliveryFee || wf.earnings?.deliveryFee || 0);
        return acc + fee + tip;
    }, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = completedOrders.filter(o => {
        const wf = (o.driverWorkflow && typeof o.driverWorkflow === 'object') ? o.driverWorkflow : {};
        const date = wf.proofOfDelivery?.capturedAt || o.updatedAt || o.createdAt;
        return date && new Date(date) >= startOfToday;
    });

    const todayEarnings = todayOrders.reduce((acc, curr) => {
        const wf = (curr.driverWorkflow && typeof curr.driverWorkflow === 'object') ? curr.driverWorkflow : {};
        const tip = Number(wf.tip || wf.earnings?.tip || 0);
        const fee = Number(curr.deliveryFee || wf.earnings?.deliveryFee || 0);
        return acc + fee + tip;
    }, 0);

    const activeOrders = await prisma.order.count({
        where: {
            driverId: driverUser.id,
            orderStatus: { in: ['confirmed', 'preparing', 'out_for_delivery'] }
        }
    });

    const profile = userWithProfile?.driverProfile || {};
    const totalDeliveries = profile.completedDeliveries || completedOrders.length;

    return {
        driverId: driverUser.id,
        name: userWithProfile?.name,
        email: userWithProfile?.email,
        phone: userWithProfile?.phone,
        isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true,
        rating: profile.rating || 5.0,
        completedDeliveries: totalDeliveries,
        vehicleType: profile.vehicleType || 'Standard Vehicle',
        plateNumber: profile.plateNumber || '',
        licenseNumber: profile.licenseNumber || '',
        activeOrderId: profile.activeOrderId || null,
        activeDeliveriesCount: activeOrders,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        todayEarnings: todayOrders.length > 0 ? parseFloat(todayEarnings.toFixed(2)) : parseFloat(totalEarnings.toFixed(2)),
        todayTrips: todayOrders.length > 0 ? todayOrders.length : totalDeliveries
    };
};

const updateDriverStatus = async ({ driverUser, isAvailable }) => {
    const availableBool = Boolean(isAvailable);
    const updated = await prisma.driverProfile.upsert({
        where: { userId: driverUser.id },
        update: { isAvailable: availableBool },
        create: {
            userId: driverUser.id,
            isAvailable: availableBool,
            vehicleType: 'Standard Vehicle',
            rating: 5.0
        }
    });

    return {
        isAvailable: updated.isAvailable,
        rating: updated.rating,
        completedDeliveries: updated.completedDeliveries
    };
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    getAllOrders,
    getAvailableDrivers,
    assignDriverToOrder,
    sendOrderEmailNotification,
    sendOrderSMSNotification,
    sendOrderMessageNotification,
    getOrderMessages,
    sendOrderConversationMessage,
    getAvailableDriverOrders,
    getDriverOrders,
    acceptDeliveryRequest,
    declineDeliveryRequest,
    checkInAtRestaurant,
    markOrderPickedUp,
    startDeliveryTransit,
    completeDelivery,
    submitPostDeliveryReport,
    submitDriverCompliance,
    getDashboardStats,
    getSalesReport,
    getDriverAnalyticsReport,
    getDeliverySlaReport,
    getFinancialReconciliationReport,
    getDriverProfile,
    updateDriverStatus
};
