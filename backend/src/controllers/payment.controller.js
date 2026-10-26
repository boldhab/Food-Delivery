const Stripe = require('stripe');
const prisma = require('../config/prisma');

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const createPaymentIntent = async (req, res, next) => {
    try {
        const { orderId } = req.body || {};
        const userId = req.user?.id || req.user?._id;
        const stripe = getStripe();

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'orderId is required'
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId,
                paymentStatus: 'pending'
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or already paid'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalAmount * 100),
            currency: 'usd',
            metadata: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                userId: userId
            }
        });

        await prisma.order.update({
            where: { id: order.id },
            data: { paymentId: paymentIntent.id }
        });

        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: order.totalAmount
            }
        });
    } catch (error) {
        next(error);
    }
};

const confirmPayment = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body || {};
        const stripe = getStripe();
        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'paymentIntentId is required'
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            const order = await prisma.order.findFirst({
                where: { paymentId: paymentIntentId }
            });

            if (order) {
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        paymentStatus: 'paid',
                        orderStatus: order.orderStatus === 'pending' ? 'confirmed' : order.orderStatus
                    }
                });

                const cart = await prisma.cart.findUnique({
                    where: { userId: order.userId }
                });

                if (cart) {
                    await prisma.cartItem.deleteMany({
                        where: { cartId: cart.id }
                    });
                    await prisma.cart.update({
                        where: { id: cart.id },
                        data: { subtotal: 0, totalItems: 0 }
                    });
                }
            }

            return res.json({
                success: true,
                message: 'Payment confirmed successfully',
                data: { orderId: order?.id, _id: order?.id }
            });
        }

        return res.json({
            success: false,
            message: 'Payment not successful',
            data: { status: paymentIntent.status }
        });
    } catch (error) {
        next(error);
    }
};

const handleSuccessfulPayment = async (paymentIntent) => {
    try {
        const order = await prisma.order.findFirst({
            where: { paymentId: paymentIntent.id }
        });
        if (!order) return;

        await prisma.$transaction([
            prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'paid',
                    orderStatus: 'confirmed'
                }
            }),
            prisma.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    status: 'confirmed',
                    note: 'Payment received, order confirmed',
                    updatedBy: order.userId
                }
            })
        ]);

        const cart = await prisma.cart.findUnique({
            where: { userId: order.userId }
        });
        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
            await prisma.cart.update({
                where: { id: cart.id },
                data: { subtotal: 0, totalItems: 0 }
            });
        }
    } catch (error) {
        console.error('Error handling successful payment:', error.message);
    }
};

const handleFailedPayment = async (paymentIntent) => {
    try {
        const order = await prisma.order.findFirst({
            where: { paymentId: paymentIntent.id }
        });
        if (!order) return;

        await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: 'failed' }
        });
    } catch (error) {
        console.error('Error handling failed payment:', error.message);
    }
};

const handleWebhook = async (req, res) => {
    let stripe;
    try {
        stripe = getStripe();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            await handleSuccessfulPayment(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handleFailedPayment(event.data.object);
            break;
        default:
            break;
    }

    return res.json({ received: true });
};

const getOrCreateStripeCustomer = async (userId, email) => {
    const stripe = getStripe();
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new Error('User not found');
    }

    if (user.stripeCustomerId) {
        try {
            return await stripe.customers.retrieve(user.stripeCustomerId);
        } catch (_error) {
            // Re-create customer if missing remotely
        }
    }

    const customer = await stripe.customers.create({
        email,
        metadata: { userId: userId.toString() }
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
    });
    return customer;
};

const getPaymentMethods = async (req, res, next) => {
    try {
        const stripe = getStripe();
        const userId = req.user?.id || req.user?._id;
        const customer = await getOrCreateStripeCustomer(userId, req.user.email);
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customer.id,
            type: 'card'
        });

        res.json({
            success: true,
            data: paymentMethods.data.map((method) => ({
                id: method.id,
                brand: method.card.brand,
                last4: method.card.last4,
                expMonth: method.card.exp_month,
                expYear: method.card.exp_year,
                isDefault: method.metadata?.isDefault === 'true'
            }))
        });
    } catch (error) {
        next(error);
    }
};

const addPaymentMethod = async (req, res, next) => {
    try {
        const stripe = getStripe();
        const { paymentMethodId } = req.body || {};
        if (!paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: 'paymentMethodId is required'
            });
        }

        const userId = req.user?.id || req.user?._id;
        const customer = await getOrCreateStripeCustomer(userId, req.user.email);
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });

        res.json({
            success: true,
            message: 'Payment method added successfully'
        });
    } catch (error) {
        next(error);
    }
};

const removePaymentMethod = async (req, res, next) => {
    try {
        const stripe = getStripe();
        const { id } = req.params;
        await stripe.paymentMethods.detach(id);
        res.json({
            success: true,
            message: 'Payment method removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPaymentIntent,
    confirmPayment,
    handleWebhook,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod
};
