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
                <div className="mb-4 flex justify-center">
                    <img src="/LOGO.png" alt="Food Hub" className="h-12 w-auto object-contain" />
                </div>
                <div className="success-icon">
                    <FiCheckCircle />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-3">
                    Payment Successful
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                    Your payment has been processed successfully.
                </p>

                {loading ? <p className="text-sm text-muted-foreground mt-2">Confirming your payment...</p> : null}
                {!loading && order ? (
                    <p className="order-number font-mono text-sm font-semibold tabular-nums text-foreground mt-2">
                        Order #{order}
                    </p>
                ) : null}

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
