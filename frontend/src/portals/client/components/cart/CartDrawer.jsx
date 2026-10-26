import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiX, 
    FiShoppingBag, 
    FiPlus, 
    FiMinus, 
    FiTrash2, 
    FiArrowRight, 
    FiTruck, 
    FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import resolveImageUrl from '../../utils/image';

const FREE_DELIVERY_THRESHOLD = 600;

const CartDrawer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        cart, 
        isCartOpen, 
        closeCart, 
        updateItem, 
        removeItem, 
        clearCart,
        busyItems = {}
    } = useCart();
    const { isAuthenticated } = useAuth();

    const handleUpdateQuantity = async (itemId, quantity) => {
        try {
            await updateItem(itemId, quantity);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update cart', {
                duration: 2000,
                position: 'bottom-center'
            });
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItem(itemId);
            toast.success('Item removed', {
                duration: 1500,
                position: 'bottom-center'
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to remove item', {
                position: 'bottom-center'
            });
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
            toast.success('Cart cleared', {
                duration: 1500,
                position: 'bottom-center'
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to clear cart', {
                position: 'bottom-center'
            });
        }
    };

    const subtotal = Number(cart?.subtotal || 0);
    const totalItems = Number(cart?.totalItems || 0);
    const items = cart?.items || [];

    // Calculate free delivery progress
    const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    const freeDeliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isCartOpen) {
                closeCart();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCartOpen, closeCart]);

    const handleCheckout = () => {
        closeCart();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }
        navigate('/checkout');
    };

    const handleViewCart = (e) => {
        e?.preventDefault();
        closeCart();
        if (location.pathname === '/cart') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        navigate('/cart');
    };

    const handleBrowseMenu = () => {
        closeCart();
        navigate('/menu');
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={closeCart}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                    />

                    {/* Drawer Panel */}
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="w-screen max-w-md bg-[var(--card)] text-[var(--foreground)] elevation-3 flex flex-col border-l border-[var(--border)]"
                        >
                            {/* Drawer Header */}
                            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                                        <FiShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-[var(--foreground)] text-lg leading-tight">
                                            Your Order
                                        </h2>
                                        <span className="text-xs text-[var(--muted-foreground)]">
                                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {items.length > 0 && (
                                        <button
                                            onClick={handleClearCart}
                                            className="text-xs text-[var(--muted-foreground)] hover:text-rose-500 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                    <button
                                        onClick={closeCart}
                                        className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-xl hover:bg-[var(--background)] transition-colors cursor-pointer"
                                        aria-label="Close cart"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Free Delivery Goal Bar */}
                            {items.length > 0 && (
                                <div className="px-5 py-3 bg-[var(--background)] border-b border-[var(--border)]">
                                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                                        {remainingForFreeDelivery === 0 ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                                                <FiCheckCircle className="w-3.5 h-3.5" /> You've unlocked FREE delivery!
                                            </span>
                                        ) : (
                                            <span className="text-[var(--muted-foreground)] flex items-center gap-1">
                                                <FiTruck className="w-3.5 h-3.5 text-[var(--primary)]" />
                                                Add <span className="font-bold text-[var(--foreground)] tabular-nums">{remainingForFreeDelivery.toFixed(2)} ETB</span> more for FREE delivery
                                            </span>
                                        )}
                                        <span className="font-bold text-[var(--foreground)] tabular-nums">
                                            {subtotal.toFixed(0)} / {FREE_DELIVERY_THRESHOLD} ETB
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${freeDeliveryProgress}%` }}
                                            transition={{ duration: 0.4 }}
                                            className="h-full bg-[var(--primary)] rounded-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Cart Items Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                                        <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-3xl mb-4">
                                            🛒
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                                            Your cart is empty
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                                            Looks like you haven't added any delicious food yet. Explore our freshly prepared menu!
                                        </p>
                                        <button
                                            onClick={handleBrowseMenu}
                                            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-green-500/20 transition-all"
                                        >
                                            Browse Menu
                                        </button>
                                    </div>
                                ) : (
                                    items.map((item) => {
                                        const itemId = item.id || item._id;
                                        const isBusy = Boolean(busyItems[itemId]);
                                        const itemPrice = Number(item.price || 0);

                                        return (
                                            <div
                                                key={itemId}
                                                className={`flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 transition-opacity ${
                                                    isBusy ? 'opacity-60 pointer-events-none' : ''
                                                }`}
                                            >
                                                {/* Food Thumbnail */}
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                                    <img
                                                        src={resolveImageUrl(item.snapshot?.image || item.food?.image || item.image)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Info & Quantity controls */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                                            {item.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => handleRemoveItem(itemId)}
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                            title="Remove item"
                                                        >
                                                            <FiTrash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="font-extrabold text-green-500 text-sm tabular-nums tracking-tight">
                                                            {(itemPrice * item.quantity).toFixed(2)} ETB
                                                        </span>

                                                        {/* Quantity Stepper */}
                                                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-1 py-0.5">
                                                            <button
                                                                onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                                                                className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <FiMinus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                                                                className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <FiPlus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Drawer Footer with Actions */}
                            {items.length > 0 && (
                                <div className="p-5 border-t border-[var(--border)] bg-[var(--card)] space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[var(--muted-foreground)] font-medium">Subtotal</span>
                                        <span className="text-lg font-extrabold text-[var(--foreground)] tabular-nums tracking-tight">
                                            {subtotal.toFixed(2)} ETB
                                        </span>
                                    </div>
                                    <p className="text-2xs text-[var(--muted-foreground)]/80 text-right">
                                        Taxes and delivery fee calculated at checkout
                                    </p>

                                    <div className="space-y-2 pt-1">
                                        <button
                                            onClick={handleCheckout}
                                            className="w-full py-3.5 px-4 bg-[var(--primary)] hover:opacity-90 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-[var(--primary)]/25 flex items-center justify-between transition-all cursor-pointer"
                                        >
                                            <span>Proceed to Checkout</span>
                                            <div className="flex items-center gap-1.5 tabular-nums">
                                                <span>{subtotal.toFixed(2)} ETB</span>
                                                <FiArrowRight className="w-4 h-4" />
                                            </div>
                                        </button>

                                        <Link
                                            to="/cart"
                                            onClick={handleViewCart}
                                            className="w-full py-2.5 px-4 rounded-xl border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)] font-semibold text-xs transition-colors cursor-pointer text-center block"
                                        >
                                            View Full Cart Page
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </motion.aside>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
