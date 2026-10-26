import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import MobileCartBar from '../cart/MobileCartBar';

const Layout = ({ 
    children, 
    showNavbar = true, 
    showFooter = true,
    fullWidth = true,
    className = ''
}) => {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
    const isHomePage = location.pathname === '/';
    const shouldShowNavbar = showNavbar && !isAuthPage;
    const shouldShowFooter = showFooter && !isAuthPage;
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [location.pathname]);

    // Page transition variants
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        in: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        out: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 1, 1]
            }
        }
    };

    // Loading screen component
    const LoadingScreen = () => (
        <motion.div 
            className="fixed inset-0 bg-[var(--background)] text-[var(--foreground)] z-50 
                     flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-center">
                <motion.div
                    animate={{ 
                        scale: [1, 1.08, 1],
                        y: [0, -6, 0]
                    }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="mb-4 flex items-center justify-center"
                >
                    <img 
                        src="/LOGO.png" 
                        alt="Food Hub" 
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md"
                    />
                </motion.div>
                <motion.h1 
                    className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-amber-500 
                             bg-clip-text text-transparent"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Food Hub
                </motion.h1>
            </div>
        </motion.div>
    );

    return (
        <>
            {/* Initial loading screen */}
            <AnimatePresence>
                {isLoading && <LoadingScreen />}
            </AnimatePresence>

            {/* Main layout */}
            <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
                {/* Navbar */}
                {shouldShowNavbar && <Navbar />}

                {/* Global Slide-out Mini-Cart Drawer */}
                {!isAuthPage && <CartDrawer />}

                {/* Sticky Mobile Floating Cart Bar */}
                {!isAuthPage && <MobileCartBar />}

                {/* Main content with page transitions */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="in"
                        exit="out"
                        className={`
                            flex-grow w-full
                            ${!fullWidth ? 'max-w-7xl mx-auto' : ''}
                            ${shouldShowNavbar ? (isHomePage ? 'pt-0' : 'pt-4 md:pt-6') : ''}
                            ${isAuthPage || isHomePage ? 'p-0' : 'px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12'}
                            ${className}
                        `}
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>

                {/* Footer */}
                {shouldShowFooter && <Footer />}

                {/* Back to top button (appears after scrolling) */}
                {!isAuthPage && <BackToTopButton />}
            </div>
        </>
    );
};

// Back to top button component
const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-40
                             w-12 h-12 bg-green-500 hover:bg-green-600
                             text-white rounded-full shadow-lg
                             flex items-center justify-center
                             transition-colors duration-200
                             focus:outline-none focus:ring-2 
                             focus:ring-green-500 focus:ring-offset-2"
                    aria-label="Back to top"
                >
                    <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 10l7-7m0 0l7 7m-7-7v18" 
                        />
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

// Optional: Toast container wrapper
export const LayoutWithToasts = ({ children, ...props }) => {
    return (
        <>
            <Layout {...props}>
                {children}
            </Layout>
            {/* Toast container is already handled by react-hot-toast in your app */}
        </>
    );
};

export default Layout;
