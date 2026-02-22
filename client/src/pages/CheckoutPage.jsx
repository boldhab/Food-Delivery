import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';
import { FiClock } from 'react-icons/fi';
import PaymentForm from '../components/checkout/PaymentForm';
import orderService from '../services/order.service';
import cartService from '../services/cart.service';
import './CheckoutPage.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [deliveryDetails, setDeliveryDetails] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        instructions: ''
    });

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const response = await cartService.getCart();
                setCart(response.data);
            } catch (_error) {
                toast.error('Failed to load cart');
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, [navigate]);

    const handleDeliverySubmit = async (e) => {
        e.preventDefault();

        try {
            const orderData = {
                paymentMethod: 'card',
                deliveryAddress: {
                    street: deliveryDetails.street,
                    city: deliveryDetails.city,
                    state: deliveryDetails.state,
                    zipCode: deliveryDetails.zipCode,
                    instructions: deliveryDetails.instructions
                },
                specialInstructions: deliveryDetails.instructions
            };

            const response = await orderService.createOrder(orderData);
            setOrder(response.data);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create order');
        }
    };

    const handlePaymentSuccess = () => {
        toast.success('Payment successful. Order confirmed.');
        navigate('/payment-success');
    };

    const handlePaymentError = (error) => {
        toast.error(error.message || 'Payment failed');
    };

    if (loading) return <div className="loading">Loading checkout...</div>;
    if (!cart || cart.items.length === 0) return <div className="loading">Your cart is empty.</div>;

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            <div className="checkout-content">
                <div className="checkout-form">
                    {step === 1 ? (
                        <form onSubmit={handleDeliverySubmit} className="delivery-form">
                            <h2>Delivery Details</h2>
                            <input
                                placeholder="Street"
                                value={deliveryDetails.street}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, street: e.target.value })}
                                required
                            />
                            <input
                                placeholder="City"
                                value={deliveryDetails.city}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                                required
                            />
                            <input
                                placeholder="State"
                                value={deliveryDetails.state}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })}
                                required
                            />
                            <input
                                placeholder="ZIP Code"
                                value={deliveryDetails.zipCode}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, zipCode: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Phone"
                                value={deliveryDetails.phone}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Delivery instructions (optional)"
                                value={deliveryDetails.instructions}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, instructions: e.target.value })}
                            />
                            <button type="submit">Continue to Payment</button>
                        </form>
                    ) : null}

                    {step === 2 && order ? (
                        <Elements stripe={stripePromise}>
                            <PaymentForm
                                orderId={order._id}
                                amount={order.totalAmount}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </Elements>
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
                    <div className="summary-total">
                        <strong>Total: ${(cart.subtotal + (cart.subtotal > 50 ? 0 : 5) + cart.subtotal * 0.08).toFixed(2)}</strong>
                    </div>
                    <div className="delivery-estimate">
                        <FiClock /> Estimated delivery: 30-45 min
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
