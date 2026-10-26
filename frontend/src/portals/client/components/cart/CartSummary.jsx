import React from 'react';
import { Link } from 'react-router-dom';

const CartSummary = ({ subtotal = 0, totalItems = 0, showCheckoutLink = false }) => {
    const numSubtotal = Number(subtotal || 0);
    const count = Number(totalItems || 0);
    const tax = numSubtotal * 0.15;
    const delivery = numSubtotal > 600 || numSubtotal === 0 ? 0 : 80;
    const total = numSubtotal + tax + delivery;

    return (
        <aside className="cart-summary">
            <h3>Summary</h3>
            <div>
                <span>Items ({count})</span>
                <span>{numSubtotal.toFixed(2)} ETB</span>
            </div>
            <div>
                <span>Tax (15%)</span>
                <span>{tax.toFixed(2)} ETB</span>
            </div>
            <div>
                <span>Delivery</span>
                <span>{delivery ? `${delivery.toFixed(2)} ETB` : 'Free'}</span>
            </div>
            <div className="total-row">
                <strong>Total</strong>
                <strong>{total.toFixed(2)} ETB</strong>
            </div>
            {showCheckoutLink && (
                <Link to="/checkout" className="primary-link">
                    Proceed to checkout
                </Link>
            )}
        </aside>
    );
};

export default CartSummary;
