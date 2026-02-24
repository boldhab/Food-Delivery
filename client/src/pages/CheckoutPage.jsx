import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';
import PaymentForm from '../components/checkout/PaymentForm';
import cartService from '../services/cart.service';
import orderService from '../services/order.service';
import './CheckoutPage.css';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.trim();
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('details');
    const [order, setOrder] = useState(null);
    const [form, setForm] = useState({
        paymentMethod: 'cash_on_delivery',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        instructions: '',
    });

    useEffect(() => {
        cartService
            .getCart()
            .then((response) => {
                setCart(response.data);
                if (!response.data.items.length) {
                    navigate('/cart');
                }
            })
            .catch(() => {
                toast.error('Failed to load cart');
                navigate('/cart');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const totals = useMemo(() => {
        const tax = cart.subtotal * 0.08;
        const delivery = cart.subtotal > 50 ? 0 : 5;
        return {
            tax,
            delivery,
            total: cart.subtotal + tax + delivery,
        };
    }, [cart.subtotal]);

    const createOrder = async (event) => {
        event.preventDefault();
        if (form.paymentMethod === 'card' && !stripePromise) {
            toast.error('Stripe is not configured. Set VITE_STRIPE_PUBLIC_KEY in client/.env');
            return;
        }
        setSubmitting(true);
        try {
            const response = await orderService.createOrder({
                paymentMethod: form.paymentMethod,
                deliveryAddress: {
                    street: form.street.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    zipCode: form.zipCode.trim(),
                    instructions: form.instructions,
                },
                specialInstructions: form.instructions.trim(),
            });

            if (form.paymentMethod === 'cash_on_delivery') {
                toast.success('Order placed');
                navigate('/orders');
                return;
            }

            setOrder(response.data);
            setStep('payment');
        } catch (error) {
            const validationMessage = error?.response?.data?.errors?.[0]?.message;
            const message = validationMessage || error?.response?.data?.message || 'Failed to create order';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading checkout...</div>;

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            <div className="checkout-content">
                <div className="checkout-form">
                    {step === 'details' ? (
                        <form onSubmit={createOrder} className="delivery-form">
                            <h2>Delivery Details</h2>
                            <input
                                placeholder="Street"
                                value={form.street}
                                onChange={(event) => setForm({ ...form, street: event.target.value })}
                                required
                            />
                            <input
                                placeholder="City"
                                value={form.city}
                                onChange={(event) => setForm({ ...form, city: event.target.value })}
                                required
                            />
                            <input
                                placeholder="State"
                                value={form.state}
                                onChange={(event) => setForm({ ...form, state: event.target.value })}
                                required
                            />
                            <input
                                placeholder="ZIP Code"
                                value={form.zipCode}
                                onChange={(event) => setForm({ ...form, zipCode: event.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Delivery instructions"
                                value={form.instructions}
                                onChange={(event) => setForm({ ...form, instructions: event.target.value })}
                            />
                            <select
                                value={form.paymentMethod}
                                onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
                            >
                                <option value="cash_on_delivery">Cash on Delivery</option>
                                <option value="card">Card</option>
                            </select>
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Processing...' : form.paymentMethod === 'card' ? 'Continue to payment' : 'Place order'}
                            </button>
                        </form>
                    ) : null}

                    {step === 'payment' && order && stripePromise ? (
                        <Elements stripe={stripePromise}>
                            <PaymentForm
                                orderId={order._id}
                                amount={order.totalAmount}
                                onSuccess={() => {
                                    toast.success('Payment successful');
                                    navigate('/payment-success');
                                }}
                                onError={(error) => toast.error(error.message || 'Payment failed')}
                            />
                        </Elements>
                    ) : null}

                    {step === 'payment' && order && !stripePromise ? (
                        <div className="payment-missing-key">
                            Stripe is not configured. Add `VITE_STRIPE_PUBLIC_KEY` in `client/.env`.
                        </div>
                    ) : null}
                </div>

                <div className="order-summary">
                    <h3>Order Summary</h3>
                    {cart.items.map((item) => (
                        <div key={item._id} className="summary-item">
                            <span>
                                {item.name} x{item.quantity}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="summary-item">
                        <span>Tax</span>
                        <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                        <span>Delivery</span>
                        <span>{totals.delivery ? `$${totals.delivery.toFixed(2)}` : 'Free'}</span>
                    </div>
                    <div className="summary-total">
                        <strong>Total: ${totals.total.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
