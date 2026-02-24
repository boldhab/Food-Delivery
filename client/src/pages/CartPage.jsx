import React from 'react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useCart from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Loader from '../components/ui/Loader';

const CartPage = () => {
    const { cart, loading, updateItem, removeItem, clearCart } = useCart();
    const [busy, setBusy] = useState(false);

    const handleUpdate = async (itemId, quantity) => {
        setBusy(true);
        try {
            await updateItem(itemId, quantity);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update cart');
        } finally {
            setBusy(false);
        }
    };

    const handleRemove = async (itemId) => {
        setBusy(true);
        try {
            await removeItem(itemId);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to remove item');
        } finally {
            setBusy(false);
        }
    };

    const handleClear = async () => {
        setBusy(true);
        try {
            await clearCart();
            toast.success('Cart cleared');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to clear cart');
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Your Cart</h1>
                {cart.items?.length ? (
                    <button type="button" className="link-button danger" onClick={handleClear} disabled={busy}>
                        Clear all
                    </button>
                ) : null}
            </div>

            {!cart.items?.length ? (
                <p className="empty-state">Your cart is empty.</p>
            ) : (
                <div className="cart-layout">
                    <div className="cart-list">
                        {cart.items.map((item) => (
                            <CartItem key={item._id} item={item} onUpdate={handleUpdate} onRemove={handleRemove} busy={busy} />
                        ))}
                    </div>
                    <CartSummary subtotal={cart.subtotal} totalItems={cart.totalItems} />
                </div>
            )}
        </div>
    );
};

export default CartPage;
