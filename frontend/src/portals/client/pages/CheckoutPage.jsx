import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';
import { 
    FiArrowLeft, 
    FiMapPin, 
    FiHome, 
    FiCreditCard, 
    FiDollarSign, 
    FiCheckCircle, 
    FiTag, 
    FiHeart, 
    FiShoppingBag,
    FiFileText,
    FiX,
    FiLock
} from 'react-icons/fi';
import PaymentForm from '../components/checkout/PaymentForm';
import cartService from '../services/cart.service';
import orderService from '../services/order.service';
import promotionService from '../services/promotion.service';
import authService from '../services/auth.service';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import Loader from '../components/ui/Loader';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.trim();
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

const TIP_OPTIONS = [0, 30, 50, 100];

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { loadCart } = useCart();

    const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('details'); // 'details' | 'payment'
    const [order, setOrder] = useState(null);

    // Form inputs prefilled with user profile address if available
    const [form, setForm] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        instructions: '',
        paymentMethod: 'cash_on_delivery',
        saveAddress: false
    });

    // Auto-prefill address from authenticated user profile
    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                street: prev.street || user?.address?.street || user?.street || '',
                city: prev.city || user?.address?.city || user?.city || '',
                state: prev.state || user?.address?.state || user?.state || '',
                zipCode: prev.zipCode || user?.address?.zipCode || user?.zipCode || '',
            }));
        }
    }, [user]);

    // Driver Tip state
    const [selectedTip, setSelectedTip] = useState(30);
    const [customTip, setCustomTip] = useState('');
    const [isCustomTip, setIsCustomTip] = useState(false);

    // Promo Code state
    const [promoInput, setPromoInput] = useState('');
    const [validatingPromo, setValidatingPromo] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState(null);

    // Load user's cart
    useEffect(() => {
        cartService
            .getCart()
            .then((response) => {
                const cartData = response?.data || response;
                setCart(cartData);
                if (!cartData?.items || cartData.items.length === 0) {
                    toast.error('Your cart is empty. Please add items before checking out.');
                    navigate('/cart');
                }
            })
            .catch(() => {
                toast.error('Failed to load cart');
                navigate('/cart');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    // Compute driver tip amount
    const tipAmount = useMemo(() => {
        if (isCustomTip) {
            const parsed = parseFloat(customTip);
            return isNaN(parsed) || parsed < 0 ? 0 : parsed;
        }
        return selectedTip;
    }, [selectedTip, customTip, isCustomTip]);

    // Compute totals (subtotal, promo discount, delivery fee, tax, tip, final total)
    const totals = useMemo(() => {
        const subtotal = Number(cart.subtotal || 0);
        const discount = appliedPromo ? Number(appliedPromo.discount || 0) : 0;
        const discountedSubtotal = Math.max(0, subtotal - discount);
        const tax = parseFloat((discountedSubtotal * 0.15).toFixed(2));
        const delivery = subtotal > 600 || subtotal === 0 ? 0 : 80;
        const total = parseFloat((discountedSubtotal + tax + delivery + tipAmount).toFixed(2));

        return {
            subtotal,
            discount,
            tax,
            delivery,
            tip: tipAmount,
            total
        };
    }, [cart.subtotal, appliedPromo, tipAmount]);

    // Handle Promo Code validation
    const handleApplyPromo = async (e) => {
        e.preventDefault();
        const code = promoInput.trim().toUpperCase();
        if (!code) {
            toast.error('Please enter a promo code');
            return;
        }

        setValidatingPromo(true);
        try {
            const res = await promotionService.validatePromotion(code, cart.subtotal);
            const promoData = res?.data || res;
            setAppliedPromo(promoData);
            toast.success(`Promo code applied: Saved ${Number(promoData.discount).toFixed(2)} ETB!`, {
                icon: '🎉',
                duration: 3500
            });
            setPromoInput('');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Invalid promo code');
        } finally {
            setValidatingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        toast('Promo code removed', { icon: 'ℹ️' });
    };

    // Handle placing order
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (form.paymentMethod === 'card' && !stripePromise) {
            toast.error('Stripe is not configured. Please choose Cash on Delivery or configure your Stripe key.');
            return;
        }

        setSubmitting(true);
        try {
            // Optionally update user profile address for future use
            if (form.saveAddress && user) {
                try {
                    await authService.updateProfile({
                        address: {
                            street: form.street.trim(),
                            city: form.city.trim(),
                            state: form.state.trim(),
                            zipCode: form.zipCode.trim()
                        }
                    });
                    refreshUser?.();
                } catch (profErr) {
                    console.warn('Failed to save address to profile:', profErr);
                }
            }

            const response = await orderService.createOrder({
                paymentMethod: form.paymentMethod,
                deliveryAddress: {
                    street: form.street.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    zipCode: form.zipCode.trim(),
                    instructions: form.instructions.trim()
                },
                specialInstructions: form.instructions.trim(),
                promoCode: appliedPromo?.code || undefined,
                tip: tipAmount
            });

            const createdOrder = response?.data || response;
            await loadCart();

            if (form.paymentMethod === 'cash_on_delivery') {
                toast.success('Order placed successfully! We are preparing your food.', {
                    icon: '🚀',
                    duration: 4000
                });
                navigate(`/orders/track/${createdOrder.id || createdOrder._id}`);
                return;
            }

            setOrder(createdOrder);
            setStep('payment');
        } catch (error) {
            const validationMessage = error?.response?.data?.errors?.[0]?.message;
            const message = validationMessage || error?.response?.data?.message || 'Failed to place order';
            toast.error(message);
            if (error?.response?.status === 400 && message.toLowerCase().includes('cart is empty')) {
                await loadCart();
                navigate('/cart');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="w-full">
                {/* Back to Cart & Step Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        <span>Back to Cart</span>
                    </Link>

                    {/* Progress Pills */}
                    <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className={`px-3 py-1 rounded-full ${
                            step === 'details' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                        }`}>
                            1. Details & Address
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className={`px-3 py-1 rounded-full ${
                            step === 'payment' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                            2. Payment
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Left Column: Forms */}
                    <div className="lg:col-span-7 space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 'details' ? (
                                <motion.form
                                    key="details-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handlePlaceOrder}
                                    className="space-y-6"
                                >
                                    {/* Delivery Address Card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-500 flex items-center justify-center">
                                                    <FiMapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                        Delivery Address
                                                    </h2>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Where should we deliver your order?
                                                    </p>
                                                </div>
                                            </div>

                                            {user?.address?.street && (
                                                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-medium">
                                                    <FiCheckCircle className="w-3.5 h-3.5" /> Auto-filled
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                                    Street Address
                                                </label>
                                                <div className="relative">
                                                    <FiHome className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Bole Medhanealem, House 402"
                                                        value={form.street}
                                                        onChange={(e) => setForm({ ...form, street: e.target.value })}
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-green-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                                        City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Addis Ababa"
                                                        value={form.city}
                                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                                        required
                                                        className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-green-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                                        State / Region
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Addis Ababa"
                                                        value={form.state}
                                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                                        required
                                                        className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-green-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                                        Postal / ZIP
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="1000"
                                                        value={form.zipCode}
                                                        onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                                                        required
                                                        className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-green-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                                    Delivery Instructions (Optional)
                                                </label>
                                                <div className="relative">
                                                    <FiFileText className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Drop at front door, ring doorbell, gate code #1234..."
                                                        value={form.instructions}
                                                        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-green-500"
                                                    />
                                                </div>
                                            </div>

                                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={form.saveAddress}
                                                    onChange={(e) => setForm({ ...form, saveAddress: e.target.checked })}
                                                    className="w-4 h-4 rounded text-green-500 focus:ring-green-400"
                                                />
                                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                                    Save this address to my profile for future orders
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Driver Tip Card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <FiHeart className="w-5 h-5 text-red-500" />
                                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                                    Driver Tip
                                                </h3>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                100% goes directly to your driver
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-5 gap-2">
                                            {TIP_OPTIONS.map((tip) => (
                                                <button
                                                    type="button"
                                                    key={tip}
                                                    onClick={() => {
                                                        setSelectedTip(tip);
                                                        setIsCustomTip(false);
                                                    }}
                                                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                                        !isCustomTip && selectedTip === tip
                                                            ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                                                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-green-400'
                                                    }`}
                                                >
                                                    {tip === 0 ? 'None' : `${tip} ETB`}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setIsCustomTip(true)}
                                                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                                    isCustomTip
                                                        ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                                                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-green-400'
                                                }`}
                                            >
                                                Custom
                                            </button>
                                        </div>

                                        {isCustomTip && (
                                            <div className="mt-3 relative">
                                                <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-xs">ETB</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="5"
                                                    placeholder="Enter custom tip amount in ETB"
                                                    value={customTip}
                                                    onChange={(e) => setCustomTip(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Method Selector Card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">
                                            Payment Method
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Cash On Delivery */}
                                            <div
                                                onClick={() => setForm({ ...form, paymentMethod: 'cash_on_delivery' })}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    form.paymentMethod === 'cash_on_delivery'
                                                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                                                        <FiDollarSign className="w-5 h-5" />
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                        form.paymentMethod === 'cash_on_delivery'
                                                            ? 'border-green-500 bg-green-500 text-white'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                        {form.paymentMethod === 'cash_on_delivery' && <FiCheckCircle className="w-3.5 h-3.5" />}
                                                    </div>
                                                </div>
                                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                                    Cash on Delivery
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Pay cash or card when your meal arrives
                                                </p>
                                            </div>

                                            {/* Card Payment (Stripe) */}
                                            <div
                                                onClick={() => setForm({ ...form, paymentMethod: 'card' })}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    form.paymentMethod === 'card'
                                                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
                                                        <FiCreditCard className="w-5 h-5" />
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                        form.paymentMethod === 'card'
                                                            ? 'border-green-500 bg-green-500 text-white'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                        {form.paymentMethod === 'card' && <FiCheckCircle className="w-3.5 h-3.5" />}
                                                    </div>
                                                </div>
                                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                                    Credit or Debit Card
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Instant secure checkout via Stripe
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-green-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-base"
                                    >
                                        <FiLock className="w-5 h-5" />
                                        <span>
                                            {submitting
                                                ? 'Processing...'
                                                : form.paymentMethod === 'card'
                                                ? `Continue to Payment • ${totals.total.toFixed(2)} ETB`
                                                : `Place Order • ${totals.total.toFixed(2)} ETB`}
                                        </span>
                                    </button>
                                </motion.form>
                            ) : (
                                /* Step 2: Stripe Payment Form */
                                <motion.div
                                    key="payment-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setStep('details')}
                                        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-green-500 transition-colors"
                                    >
                                        <FiArrowLeft className="w-4 h-4" />
                                        <span>Change delivery details</span>
                                    </button>

                                    {order && stripePromise ? (
                                        <Elements stripe={stripePromise}>
                                            <PaymentForm
                                                orderId={order.id || order._id}
                                                amount={totals.total}
                                                onSuccess={() => {
                                                    loadCart();
                                                    toast.success('Payment authorized and order confirmed!', {
                                                        icon: '🎉',
                                                        duration: 4000
                                                    });
                                                    navigate(`/orders/track/${order.id || order._id}`);
                                                }}
                                                onError={(err) => toast.error(err.message || 'Payment failed')}
                                            />
                                        </Elements>
                                    ) : (
                                        <div className="p-6 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 text-center">
                                            <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                                                Stripe public key is not configured in client environment.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setForm({ ...form, paymentMethod: 'cash_on_delivery' });
                                                    setStep('details');
                                                }}
                                                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold"
                                            >
                                                Switch to Cash on Delivery
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Order Summary Card */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <FiShoppingBag className="w-5 h-5 text-green-500" />
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                        Order Summary
                                    </h3>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                                    {cart.totalItems || cart.items.length} items
                                </span>
                            </div>

                            {/* Cart Items List */}
                            <div className="max-h-60 overflow-y-auto space-y-3 mb-6 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                                {cart.items.map((item, idx) => (
                                    <div key={item.id || idx} className="pt-3 first:pt-0 flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center justify-center text-slate-700 dark:text-slate-300">
                                                {item.quantity}×
                                            </span>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Input */}
                            <div className="mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Promo Code
                                </label>
                                {appliedPromo ? (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2">
                                            <FiTag className="w-4 h-4 text-green-500" />
                                            <div>
                                                <span className="font-bold text-xs text-green-700 dark:text-green-300">
                                                    {appliedPromo.code}
                                                </span>
                                                <p className="text-[11px] text-green-600 dark:text-green-400">
                                                    Saved ${Number(appliedPromo.discount).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemovePromo}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Remove promo code"
                                        >
                                            <FiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. WELCOME20"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-medium focus:outline-none focus:border-green-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={validatingPromo || !promoInput.trim()}
                                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
                                        >
                                            {validatingPromo ? 'Checking...' : 'Apply'}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-2.5 text-sm pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {totals.subtotal.toFixed(2)} ETB
                                    </span>
                                </div>

                                {appliedPromo && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                                        <span>Promo Discount</span>
                                        <span>- {totals.discount.toFixed(2)} ETB</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Estimated Tax (15%)</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {totals.tax.toFixed(2)} ETB
                                    </span>
                                </div>

                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Delivery Fee</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {totals.delivery === 0 ? (
                                            <span className="text-green-500 font-bold uppercase text-xs">Free</span>
                                        ) : (
                                            `${totals.delivery.toFixed(2)} ETB`
                                        )}
                                    </span>
                                </div>

                                {totals.tip > 0 && (
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Driver Tip</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {totals.tip.toFixed(2)} ETB
                                        </span>
                                    </div>
                                )}

                                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-base font-bold text-slate-900 dark:text-white">
                                        Total
                                    </span>
                                    <span className="text-2xl font-black text-green-500">
                                        {totals.total.toFixed(2)} ETB
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
