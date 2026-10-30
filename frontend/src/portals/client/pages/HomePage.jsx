import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FiClock, 
    FiStar, 
    FiTruck, 
    FiShield, 
    FiHeart, 
    FiArrowRight, 
    FiCheckCircle, 
    FiGift, 
    FiSmartphone,
    FiSmile,
    FiAward
} from 'react-icons/fi';
import SearchBar from '../components/home/SearchBar';
import FoodCard from '../components/food/FoodCard';
import promotionService from '../services/promotion.service';
import foodService from '../services/food.service';

const CATEGORIES = [
    { name: 'Wat & Stews', icon: '🍲', color: 'from-amber-500/10 to-orange-500/10 text-orange-500 border-orange-500/20' },
    { name: 'Tibs & Grills', icon: '🥩', color: 'from-amber-500/10 to-yellow-500/10 text-amber-500 border-amber-500/20' },
    { name: 'Kitfo & Specialties', icon: '🥩', color: 'from-rose-500/10 to-red-500/10 text-rose-500 border-rose-500/20' },
    { name: 'Vegetarian & Fasting', icon: '🥗', color: 'from-emerald-500/10 to-green-500/10 text-emerald-500 border-emerald-500/20' },
    { name: 'Traditional Breakfast', icon: '🍳', color: 'from-yellow-500/10 to-amber-500/10 text-yellow-600 border-yellow-500/20' },
    { name: 'Beverages & Coffee', icon: '☕', color: 'from-blue-500/10 to-cyan-500/10 text-blue-500 border-blue-500/20' },
    { name: 'Desserts & Sweets', icon: '🍯', color: 'from-pink-500/10 to-rose-500/10 text-pink-500 border-pink-500/20' },
];

const VALUE_PROPOSITIONS = [
    {
        icon: FiTruck,
        title: '30-Minute Fast Delivery',
        description: 'Our smart dispatch algorithm routes orders to the nearest couriers for blazing fast delivery.',
        badge: 'Lightning Fast'
    },
    {
        icon: FiAward,
        title: 'Chef-Grade Quality',
        description: 'Cooked fresh on order by top culinary chefs with strict food hygiene and safety standards.',
        badge: '100% Fresh'
    },
    {
        icon: FiShield,
        title: 'Tamper-Sealed Packaging',
        description: 'Every order comes sealed with security tapes to ensure hot and untouched delivery.',
        badge: 'Safe & Clean'
    },
    {
        icon: FiSmartphone,
        title: 'Live GPS Fleet Tracking',
        description: 'Watch your driver move on the interactive map from restaurant pickup straight to your doorstep.',
        badge: 'Real-time'
    }
];

const HOW_IT_WORKS = [
    {
        step: '01',
        title: 'Browse & Customize',
        desc: 'Explore curated menus from local top kitchens and customize options to your cravings.'
    },
    {
        step: '02',
        title: 'Cooked & Sealed Hot',
        desc: 'Chefs prepare your meal fresh with premium ingredients, packaged with safety seals.'
    },
    {
        step: '03',
        title: 'Swift Contactless Delivery',
        desc: 'Track the courier in real-time and receive hot, delicious food right at your door.'
    }
];

const HomePage = () => {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState([]);
    const [popularFoods, setPopularFoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingFoods, setLoadingFoods] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [promoData, foodsData] = await Promise.all([
                    promotionService.getActivePromotions().catch(() => []),
                    foodService.getFoods({ limit: 8 }).catch(() => [])
                ]);

                setPromotions(Array.isArray(promoData) ? promoData : []);

                const parsedFoods = Array.isArray(foodsData) 
                    ? foodsData 
                    : (Array.isArray(foodsData?.data) ? foodsData.data : (Array.isArray(foodsData?.items) ? foodsData.items : []));
                
                setPopularFoods(parsedFoods);
            } catch (error) {
                console.error('Failed to load homepage data:', error);
            } finally {
                setLoadingFoods(false);
            }
        };

        fetchHomeData();
    }, []);

    const handleSearchSubmit = (query) => {
        if (query?.trim()) {
            navigate(`/menu?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-[var(--primary)] selection:text-white">
            
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-linear-to-b from-rose-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-8 pb-16 lg:py-20 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/20 mask-[radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

                <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column: Headlines & Search */}
                        <div className="lg:col-span-7 space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold border border-[var(--primary)]/20"
                            >
                                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                                <span>Zero Delivery Fee on orders above 750 ETB • Use code: FREESHIP</span>
                            </motion.div>

                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]"
                            >
                                Premium Food,
                                <span className="block bg-linear-to-r from-[var(--primary)] to-orange-500 bg-clip-text text-transparent">
                                    Delivered Hot & Fast
                                </span>
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed"
                            >
                                Savor authentic Ethiopian dishes and gourmet delicacies prepared by master chefs, tracked in real-time from kitchen flame to your doorstep.
                            </motion.p>

                            {/* Search bar */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="pt-2 max-w-xl"
                            >
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onSearch={handleSearchSubmit}
                                    variant="hero"
                                    placeholder="Search Doro Wat, Shekla Tibs, Special Kitfo, Shiro..."
                                />
                            </motion.div>

                            {/* Quick CTA and Trust Badges */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="pt-3 flex flex-wrap items-center gap-4"
                            >
                                <Link
                                    to="/menu"
                                    className="px-7 py-3.5 bg-[var(--primary)] hover:opacity-90 text-white font-extrabold rounded-2xl transition-all duration-200 shadow-xl shadow-[var(--primary)]/25 flex items-center gap-2 group cursor-pointer"
                                >
                                    <span>Explore Full Menu</span>
                                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <div className="flex items-center gap-3 pl-2 text-xs text-slate-500 dark:text-slate-400">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-amber-400 flex items-center justify-center font-bold text-xs text-slate-900">JD</div>
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-rose-400 flex items-center justify-center font-bold text-xs text-white">SA</div>
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-blue-400 flex items-center justify-center font-bold text-xs text-white">MK</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-amber-400 font-bold">
                                            <FiStar className="fill-current w-3.5 h-3.5" />
                                            <FiStar className="fill-current w-3.5 h-3.5" />
                                            <FiStar className="fill-current w-3.5 h-3.5" />
                                            <FiStar className="fill-current w-3.5 h-3.5" />
                                            <FiStar className="fill-current w-3.5 h-3.5" />
                                            <span className="text-slate-800 dark:text-slate-200 ml-1">4.9/5</span>
                                        </div>
                                        <p>Over 12,000+ satisfied foodies</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Visual Interactive Showcase Dishes */}
                        <div className="lg:col-span-5 relative hidden lg:block">
                            <div className="relative space-y-4">
                                
                                {/* Floating Dish Card 1 */}
                                <motion.div 
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all"
                                >
                                    <img 
                                        src="/images/foods/doro_wat.jpg" 
                                        alt="Special Doro Wat"
                                        className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-md"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
                                            Chef's Special
                                        </span>
                                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 truncate">
                                            Special Doro Wat
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="flex items-center text-amber-400 font-bold">
                                                <FiStar className="fill-current w-3 h-3 mr-1" /> 4.95
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center">
                                                <FiClock className="w-3 h-3 mr-1" /> 25 min
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="font-black text-slate-900 dark:text-white">420 ETB</span>
                                            <Link to="/menu" className="text-xs font-bold text-[var(--primary)] hover:underline">
                                                Order Now →
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Dish Card 2 */}
                                <motion.div 
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all ml-8"
                                 >
                                    <img 
                                        src="/images/foods/shekla_tibs.jpg" 
                                        alt="Shekla Tibs"
                                        className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-md"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                            🔥 Trending Now
                                        </span>
                                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 truncate">
                                            Shekla Tibs (Sizzling)
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="flex items-center text-amber-400 font-bold">
                                                <FiStar className="fill-current w-3 h-3 mr-1" /> 4.96
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center">
                                                <FiClock className="w-3 h-3 mr-1" /> 18 min
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="font-black text-slate-900 dark:text-white">450 ETB</span>
                                            <Link to="/menu" className="text-xs font-bold text-[var(--primary)] hover:underline">
                                                Order Now →
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Live Tracking Simulation Badge */}
                                <div className="p-3 bg-[var(--primary)] text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs font-bold">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                                        <span>Courier is 4 mins away with your meal!</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-lg bg-black/20 text-[10px] uppercase">
                                        Live GPS
                                    </span>
                                </div>
                            </div>

                            {/* Background ambient glow */}
                            <div className="absolute -inset-4 bg-linear-to-r from-[var(--primary)]/20 to-orange-500/20 blur-3xl -z-10 rounded-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIES SECTION */}
            <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block">
                                Quick Craving
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                Browse By Category
                            </h2>
                        </div>
                        <Link 
                            to="/menu" 
                            className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                        >
                            <span>View All Menu</span>
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => navigate(`/menu?category=${encodeURIComponent(cat.name)}`)}
                                className="group p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 hover:bg-[var(--primary)]/5 dark:hover:bg-[var(--primary)]/10 border border-slate-200/70 dark:border-slate-700/60 hover:border-[var(--primary)]/40 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                            >
                                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-[var(--primary)] tracking-tight">
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* POPULAR DISHES GRID */}
            <section className="py-16 bg-slate-50 dark:bg-slate-950">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block">
                                Highest Rated
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                Popular Dishes Near You
                            </h2>
                        </div>
                        <Link 
                            to="/menu" 
                            className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                        >
                            <span>See All Dishes</span>
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loadingFoods ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                                    <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {popularFoods.slice(0, 8).map((food) => (
                                <FoodCard key={food._id || food.id} food={food} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* PROMOTIONS SECTION (If Available) */}
            {promotions.length > 0 && (
                <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800/60">
                    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                                    Special Savings
                                </span>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                    Today's Hot Promotions
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {promotions.slice(0, 3).map((promo) => (
                                <div 
                                    key={promo._id || promo.id} 
                                    className="rounded-3xl border border-[var(--primary)]/20 bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-slate-800/80 dark:to-slate-800/40 p-6 shadow-sm relative overflow-hidden"
                                >
                                    <div className="inline-block px-3 py-1 rounded-full bg-[var(--primary)] text-white font-black text-xs uppercase tracking-wider mb-3">
                                        {promo.code}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        {promo.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                                        {promo.description || 'Valid on all eligible food items.'}
                                    </p>
                                    <Link
                                        to="/menu"
                                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--primary)] hover:underline"
                                    >
                                        <span>{promo.ctaLabel || 'Claim Offer & Order'}</span>
                                        <FiArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* WHY CHOOSE US / VALUE PROPOSITIONS */}
            <section className="py-16 bg-slate-50 dark:bg-slate-950">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                            The FoodDelivery Standard
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                            Why Thousands Choose Our Delivery
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            We unite culinary excellence with modern route-optimized delivery logistics.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUE_PROPOSITIONS.map((prop, idx) => {
                            const Icon = prop.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full inline-block">
                                        {prop.badge}
                                    </span>
                                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                        {prop.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {prop.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                            Simple Process
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                            Order In 3 Simple Steps
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {HOW_IT_WORKS.map((step) => (
                            <div key={step.step} className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                                <span className="font-mono text-3xl font-black text-[var(--primary)]/40 block mb-2">
                                    {step.step}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* APP PROMO & CTA BANNER */}
            <section className="py-16 bg-gradient-to-r from-[var(--primary)] to-orange-600 text-white relative overflow-hidden">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                                Fresh Meals on Demand
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                                Hungry? Order Your Favorite Meal Right Now.
                            </h2>
                            <p className="text-rose-100 text-sm max-w-lg leading-relaxed">
                                Choose from our extensive menu of authentic Ethiopian dishes, stews, sizzling tibs, and fresh vegetarian platters. Experience live real-time delivery tracking directly on your phone.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-4">
                                <Link
                                    to="/menu"
                                    className="px-6 py-3.5 bg-white text-rose-950 font-black rounded-2xl hover:bg-rose-50 transition-colors shadow-xl cursor-pointer"
                                >
                                    Browse Full Menu Now
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-3.5 bg-black/25 hover:bg-black/35 text-white font-bold rounded-2xl border border-white/20 transition-colors cursor-pointer"
                                >
                                    Create Free Account
                                </Link>
                            </div>
                        </div>

                        <div className="hidden lg:flex justify-end">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center max-w-sm space-y-3">
                                <FiSmile className="w-12 h-12 mx-auto text-rose-200" />
                                <h3 className="font-extrabold text-xl">100% Satisfaction Guarantee</h3>
                                <p className="text-xs text-rose-100">
                                    If your meal isn't hot and delicious, or arrives late, our support team will instantly refund or credit your account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
