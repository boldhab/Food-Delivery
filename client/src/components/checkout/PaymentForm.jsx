import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi';
import paymentService from '../../services/payment.service';
import './PaymentForm.css';

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#32325d',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
};

const PaymentForm = ({ orderId, amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');

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
        <div className="payment-form-container">
            <div className="payment-header">
                <h3>Payment Details</h3>
                <div className="payment-methods">
                    <button
                        type="button"
                        className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <FiCreditCard /> Card
                    </button>
                    <button
                        type="button"
                        className={`method-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('cod')}
                    >
                        Cash on Delivery
                    </button>
                </div>
            </div>

            {paymentMethod === 'card' ? (
                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="form-group">
                        <label>Card Information</label>
                        <div className="card-element-wrapper">
                            <CardElement options={CARD_ELEMENT_OPTIONS} />
                        </div>
                    </div>

                    <div className="payment-summary">
                        <div className="summary-row">
                            <span>Amount to pay:</span>
                            <span className="amount">${amount?.toFixed(2)}</span>
                        </div>
                        <div className="secure-badge">
                            <FiLock /> Secure payment powered by Stripe
                        </div>
                    </div>

                    {error ? (
                        <div className="error-message">
                            <FiAlertCircle /> {error}
                        </div>
                    ) : null}

                    <button type="submit" disabled={!stripe || loading} className="pay-btn">
                        {loading ? 'Processing...' : `Pay $${amount?.toFixed(2)}`}
                    </button>
                </form>
            ) : (
                <div className="cod-section">
                    <p>You will pay when you receive your order.</p>
                    <button type="button" onClick={() => onSuccess?.('cod')} className="place-order-btn">
                        Place Order (Cash on Delivery)
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentForm;
