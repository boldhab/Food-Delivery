import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import foodService from '../services/food.service';
import FoodList from '../components/food/FoodList';
import Loader from '../components/ui/Loader';
import SearchBar from '../components/home/SearchBar';

const HomePage = () => {
    const [featuredFoods, setFeaturedFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchFeaturedFoods = async () => {
            try {
                const response = await foodService.getFeaturedFoods();
                setFeaturedFoods(response.data || []);
            } catch (error) {
                console.error('Failed to fetch featured foods:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedFoods();
    }, []);

    // Main categories for food delivery
    const categories = [
        { id: 'pizza', name: 'Pizza', icon: '🍕', bgColor: 'bg-red-50 dark:bg-red-950/30' },
        { id: 'burger', name: 'Burger', icon: '🍔', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { id: 'sushi', name: 'Sushi', icon: '🍱', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { id: 'pasta', name: 'Pasta', icon: '🍝', bgColor: 'bg-green-50 dark:bg-green-950/30' },
        { id: 'salad', name: 'Salad', icon: '🥗', bgColor: 'bg-green-50 dark:bg-green-950/30' },
        { id: 'dessert', name: 'Dessert', icon: '🍰', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero Section - Clean and Focused */}
            <section className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
                {/* Simple decorative elements - very subtle */}
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Main Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                                Free delivery on orders over $25
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                                Your favorite food,
                                <span className="block text-green-500 dark:text-green-400">
                                    delivered fast
                                </span>
                            </h1>
                            
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg">
                                Choose from 500+ restaurants and track your order in real-time. Hot, fresh, and on time.
                            </p>

                            {/* Search Bar - Prominent */}
                            <div className="mb-6">
                                <SearchBar 
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search for food or restaurants..."
                                />
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/menu"
                                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl
                                             transition-colors duration-200 shadow-lg shadow-green-500/25
                                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    Order now
                                </Link>
                                <Link
                                    to="/restaurants"
                                    className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 
                                             font-medium rounded-xl border border-slate-200 dark:border-slate-700
                                             hover:border-green-300 dark:hover:border-green-700
                                             transition-colors duration-200
                                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    View restaurants
                                </Link>
                            </div>

                            {/* Stats - Simple trust builders */}
                            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        4.8 average rating
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🚀</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        30 min delivery
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Simple App Preview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative">
                                {/* Simple food collage */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                                            <div className="text-4xl mb-2">🍕</div>
                                            <div className="font-semibold">Margherita Pizza</div>
                                            <div className="text-sm text-slate-500">30-40 min</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                                            <div className="text-4xl mb-2">🍔</div>
                                            <div className="font-semibold">Classic Burger</div>
                                            <div className="text-sm text-slate-500">20-30 min</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mt-8">
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                                            <div className="text-4xl mb-2">🍣</div>
                                            <div className="font-semibold">Sushi Roll</div>
                                            <div className="text-sm text-slate-500">25-35 min</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                                            <div className="text-4xl mb-2">🥗</div>
                                            <div className="font-semibold">Caesar Salad</div>
                                            <div className="text-sm text-slate-500">15-25 min</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative gradient */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl -z-10" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            

            
           

            {/* How It Works - Simple Steps */}
            <section className="py-12 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10">
                        How it works
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { 
                                step: '1', 
                                icon: '🔍', 
                                title: 'Choose', 
                                description: 'Browse restaurants and select your favorite dishes' 
                            },
                            { 
                                step: '2', 
                                icon: '💳', 
                                title: 'Pay', 
                                description: 'Secure and fast checkout with multiple payment options' 
                            },
                            { 
                                step: '3', 
                                icon: '🚚', 
                                title: 'Track', 
                                description: 'Follow your order in real-time until it arrives' 
                            },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 
                                                  rounded-full flex items-center justify-center mx-auto mb-4
                                                  text-2xl">
                                        {item.icon}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 
                                                  rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Download Banner - Optional */}
            <section className="py-12 bg-green-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Get the app for faster ordering
                    </h2>
                    <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                        Download our app for exclusive deals and faster checkout
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-6 py-3 bg-white text-slate-900 font-medium rounded-xl
                                         hover:bg-slate-100 transition-colors">
                            App Store
                        </button>
                        <button className="px-6 py-3 bg-white text-slate-900 font-medium rounded-xl
                                         hover:bg-slate-100 transition-colors">
                            Google Play
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;