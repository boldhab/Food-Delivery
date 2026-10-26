import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import useCart from '../../hooks/useCart';

const MobileCartBar = () => {
    const location = useLocation();
    const { cart, openCart } = useCart();

    const totalItems = Number(cart?.totalItems || 0);
    const subtotal = Number(cart?.subtotal || 0);

    // Hide on cart and checkout pages to avoid redundancy
    const hideOnRoutes = ['/cart', '/checkout', '/payment-success'];
    const shouldHide = hideOnRoutes.includes(location.pathname) || totalItems === 0;

    return (
        <AnimatePresence>
            {!shouldHide && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="md:hidden fixed bottom-4 inset-x-4 z-40"
                >
                    <button
                        onClick={openCart}
                        className="w-full py-3.5 px-5 bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-xl shadow-green-500/30 flex items-center justify-between transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black">
                                {totalItems}
                            </div>
                            <span className="text-sm font-semibold">View Order</span>
                        </div>

                        <div className="flex items-center gap-2 font-extrabold text-sm">
                            <span>{subtotal.toFixed(2)} ETB</span>
                            <FiArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileCartBar;
