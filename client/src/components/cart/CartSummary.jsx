import React from 'react';
import { Link } from 'react-router-dom';

const CartSummary = ({ subtotal = 0, totalItems = 0 }) => {
    const tax = subtotal * 0.08;
    const delivery = subtotal > 50 ? 0 : 5;
    const total = subtotal + tax + delivery;

    return (
        <aside className="cart-summary">
            <h3>Summary</h3>
            <div>
                <span>Items ({totalItems})</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
            <div>
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
            </div>
            <div>
                <span>Delivery</span>
                <span>{delivery ? `$${delivery.toFixed(2)}` : 'Free'}</span>
            </div>
            <div className="total-row">
                <strong>Total</strong>
                <strong>${total.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className="primary-link">
                Proceed to checkout
            </Link>
        </aside>
    );
};

export default CartSummary;
