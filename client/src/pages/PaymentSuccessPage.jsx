import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiHome, FiPackage } from 'react-icons/fi';
import paymentService from '../services/payment.service';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');
        if (!paymentIntentId) {
            setLoading(false);
            return;
        }

        const confirmPayment = async () => {
            try {
                const response = await paymentService.confirmPayment(paymentIntentId);
                setOrder(response.data?.orderId);
            } catch (_error) {
                // Keep fallback view
            } finally {
                setLoading(false);
            }
        };

        confirmPayment();
    }, [searchParams]);

    return (
        <div className="payment-success-page">
            <div className="success-card">
                <div className="success-icon">
                    <FiCheckCircle />
                </div>

                <h1>Payment Successful</h1>
                <p>Your payment has been processed successfully.</p>

                {loading ? <p>Confirming your payment...</p> : null}
                {!loading && order ? <p className="order-number">Order #{order}</p> : null}

                <div className="action-buttons">
                    <button onClick={() => navigate('/orders')} className="view-orders-btn">
                        <FiPackage /> View Orders
                    </button>
                    <button onClick={() => navigate('/')} className="home-btn">
                        <FiHome /> Back Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
