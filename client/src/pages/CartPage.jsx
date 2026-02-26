import React from 'react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useCart from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Loader from '../components/ui/Loader';

const CartPage = () => {
    const { cart, loading, updateItem, removeItem, clearCart } = useCart();
    const [busyItems, setBusyItems] = useState({}); // Track per-item loading state
    const [isClearing, setIsClearing] = useState(false);

    // Per-item loading states for better UX
    const handleUpdate = async (itemId, quantity) => {
        setBusyItems(prev => ({ ...prev, [itemId]: true }));
        try {
            await updateItem(itemId, quantity);
            // Fast success feedback - no toast needed for expected actions
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update cart', {
                duration: 2000, // Shorter duration for error feedback
                position: 'bottom-center',
            });
        } finally {
            setBusyItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleRemove = async (itemId) => {
        setBusyItems(prev => ({ ...prev, [itemId]: true }));
        try {
            await removeItem(itemId);
            // Optional: subtle success feedback
            toast.success('Item removed', { 
                icon: '🗑️',
                duration: 1500,
                position: 'bottom-center',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to remove item');
            setBusyItems(prev => ({ ...prev, [itemId]: false }));
        }
        // No finally for busy false on success - item unmounts
    };

    const handleClear = async () => {
        setIsClearing(true);
        try {
            await clearCart();
            toast.success('Cart cleared', {
                icon: '✨',
                duration: 2000,
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to clear cart');
            setIsClearing(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <motion.div 
            className="cart-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} // Fast, clean page transition
        >
            {/* Header with solid, high-contrast background */}
            <div className="cart-header bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 sticky top-0 z-10 backdrop-blur-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        Your Cart 
                        {cart.items?.length > 0 && (
                            <span className="ml-3 text-lg font-medium text-orange-500 dark:text-amber-400">
                                ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
                            </span>
                        )}
                    </h1>
                    
                    {cart.items?.length > 0 && (
                        <button 
                            type="button" 
                            onClick={handleClear}
                            disabled={isClearing}
                            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 
                                     hover:text-red-700 dark:hover:text-red-300 
                                     bg-transparent border border-red-200 dark:border-red-800
                                     rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                                     transition-all duration-150 ease-in-out
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            {isClearing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Clearing...
                                </span>
                            ) : 'Clear all'}
                        </button>
                    )}
                </div>
            </div>

            {/* Main content - solid, readable background */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!cart.items?.length ? (
                    <motion.div 
                        className="empty-state text-center py-16"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        {/* Empty state with personality */}
                        <div className="mb-6 text-6xl">🛒</div>
                        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Your cart is empty
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            Looks like you haven't added anything to your cart yet. 
                            Ready to order something delicious?
                        </p>
                        <button 
                            onClick={() => window.location.href = '/restaurants'}
                            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 
                                     text-white font-medium rounded-xl
                                     transition-all duration-200 ease-in-out
                                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                                     shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35"
                        >
                            Browse Restaurants
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items - List view */}
                        <div className="lg:col-span-2 space-y-4">
                            <AnimatePresence mode="popLayout">
                                {cart.items.map((item) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ 
                                            opacity: 0, 
                                            x: -100,
                                            transition: { duration: 0.2 } // Fast exit for remove
                                        }}
                                        transition={{
                                            layout: { type: "spring", stiffness: 300, damping: 30 }
                                        }}
                                    >
                                        <CartItem 
                                            item={item} 
                                            onUpdate={handleUpdate} 
                                            onRemove={handleRemove} 
                                            busy={busyItems[item._id]} 
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Continue shopping link - solid, reliable */}
                            <div className="pt-4">
                                <button 
                                    onClick={() => window.location.href = '/restaurants'}
                                    className="group inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 
                                             hover:text-orange-500 dark:hover:text-orange-400
                                             transition-colors duration-150"
                                >
                                    <svg className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-150" 
                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Continue Shopping
                                </button>
                            </div>
                        </div>

                        {/* Cart Summary - Solid card, no blur */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 sticky top-24">
                                <CartSummary 
                                    subtotal={cart.subtotal}
                                    totalItems={cart.totalItems}
                                    deliveryFee={cart.deliveryFee}
                                    tax={cart.tax}
                                />
                                
                                {/* Checkout button - Warm, appetite-triggering orange */}
                                <div className="p-6 pt-0">
                                    <button 
                                        className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 
                                                 text-white font-semibold rounded-xl
                                                 transition-all duration-200 ease-in-out
                                                 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                                                 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 text-lg"
                                        disabled={busyItems.length > 0 || isClearing}
                                    >
                                        Proceed to Checkout
                                    </button>
                                    
                                    {/* Trust badges - Solid, no effects */}
                                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Secure Checkout
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Guaranteed Fresh
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CartPage;