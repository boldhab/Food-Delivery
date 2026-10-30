import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiLock, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import paymentService from '../../services/payment.service';

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#1e293b',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '16px',
            '::placeholder': {
                color: '#94a3b8'
            }
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444'
        }
    }
};

const PaymentForm = ({ orderId, amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const paymentIntentResponse = await paymentService.createPaymentIntent(orderId);
            const { clientSecret } = paymentIntentResponse.data;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)
                }
            });

            if (result.error) {
                setError(result.error.message);
                onError?.(result.error);
            } else if (result.paymentIntent?.status === 'succeeded') {
                await paymentService.confirmPayment(result.paymentIntent.id);
                onSuccess?.(result.paymentIntent);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Payment failed');
            onError?.(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                    <FiCreditCard className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Card Payment
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enter your credit or debit card details below
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Card Details
                    </label>
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus-within:border-[var(--primary)] transition-colors">
                        <CardElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-600 dark:text-slate-400">Total charge:</span>
                        <span className="text-lg font-extrabold text-[var(--primary)]">
                            ${Number(amount || 0).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <FiLock className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span>256-bit encrypted secure checkout via Stripe</span>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <FiAlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="w-full py-4 px-6 bg-[var(--primary)] hover:opacity-90 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-lg shadow-[var(--primary)]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    <FiLock className="w-4 h-4" />
                    <span>{loading ? 'Processing Payment...' : `Authorize & Pay ${Number(amount || 0).toFixed(2)} ETB`}</span>
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;
