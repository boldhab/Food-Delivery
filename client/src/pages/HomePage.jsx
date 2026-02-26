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
        { id: 'burger', name: 'Burger', icon: '🍔', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
        { id: 'sushi', name: 'Sushi', icon: '🍱', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { id: 'pasta', name: 'Pasta', icon: '🍝', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
        { id: 'salad', name: 'Salad', icon: '🥗', bgColor: 'bg-green-50 dark:bg-green-950/30' },
        { id: 'dessert', name: 'Dessert', icon: '🍰', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero Section - Clean and Focused */}
            <section className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
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
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                                Free delivery on orders over $25
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                                Your favorite food,
                                <span className="block text-orange-500 dark:text-orange-400">
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
                                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl
                                             transition-colors duration-200 shadow-lg shadow-orange-500/25
                                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                >
                                    Order now
                                </Link>
                                <Link
                                    to="/restaurants"
                                    className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 
                                             font-medium rounded-xl border border-slate-200 dark:border-slate-700
                                             hover:border-orange-300 dark:hover:border-orange-700
                                             transition-colors duration-200
                                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
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
                                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-3xl -z-10" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Categories Section - Clean Grid */}
            <section className="py-12 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Browse by category
                        </h2>
                        <Link 
                            to="/categories" 
                            className="text-orange-500 hover:text-orange-600 font-medium text-sm
                                     flex items-center gap-1 transition-colors"
                        >
                            View all
                            <span className="text-lg">→</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/category/${category.id}`}
                                className="group"
                            >
                                <div className={`
                                    ${category.bgColor} 
                                    rounded-xl p-4 text-center
                                    transition-all duration-200
                                    hover:scale-105 hover:shadow-md
                                    border border-transparent hover:border-orange-200 dark:hover:border-orange-800
                                `}>
                                    <div className="text-2xl md:text-3xl mb-1">
                                        {category.icon}
                                    </div>
                                    <div className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {category.name}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Items Section */}
            <section className="py-12 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Popular right now
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                Most ordered items from our top restaurants
                            </p>
                        </div>
                        <Link 
                            to="/menu" 
                            className="hidden sm:flex items-center gap-2 text-orange-500 hover:text-orange-600 
                                     font-medium transition-colors"
                        >
                            View full menu
                            <span>→</span>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <FoodList foods={featuredFoods} />
                            
                            {/* Mobile view all link */}
                            <div className="sm:hidden text-center mt-6">
                                <Link 
                                    to="/menu" 
                                    className="inline-flex items-center gap-2 text-orange-500 font-medium"
                                >
                                    View full menu
                                    <span>→</span>
                                </Link>
                            </div>
                        </>
                    )}
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
                                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 
                                                  rounded-full flex items-center justify-center mx-auto mb-4
                                                  text-2xl">
                                        {item.icon}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 
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
            <section className="py-12 bg-orange-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Get the app for faster ordering
                    </h2>
                    <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
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