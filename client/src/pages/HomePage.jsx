import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/home/SearchBar';
import promotionService from '../services/promotion.service';

const HomePage = () => {
    const [promotions, setPromotions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const data = await promotionService.getActivePromotions();
                setPromotions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch homepage data:', error);
            }
        };

        fetchPromotions();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <section className="relative bg-linear-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 mask-[radial-gradient(ellipse_at_center,white,transparent)]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                                Free delivery on orders over $25
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                                Your favorite food,
                                <span className="block text-green-500 dark:text-green-400">delivered fast</span>
                            </h1>

                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg">
                                Choose from 500+ restaurants and track your order in real-time. Hot, fresh, and on time.
                            </p>

                            <div className="mb-6">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search for food or restaurants..."
                                />
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/menu"
                                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg shadow-green-500/25"
                                >
                                    Order now
                                </Link>
                                <Link
                                    to="/menu"
                                    className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-colors duration-200"
                                >
                                    View menu
                                </Link>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                                        <div className="font-semibold">Margherita Pizza</div>
                                        <div className="text-sm text-slate-500">30-40 min</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                                        <div className="font-semibold">Classic Burger</div>
                                        <div className="text-sm text-slate-500">20-30 min</div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                                        <div className="font-semibold">Sushi Roll</div>
                                        <div className="text-sm text-slate-500">25-35 min</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                                        <div className="font-semibold">Caesar Salad</div>
                                        <div className="text-sm text-slate-500">15-25 min</div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -inset-4 bg-linear-to-r from-green-500/20 to-emerald-500/20 blur-3xl -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {promotions.length > 0 && (
                <section className="py-10 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Today's Promotions</h2>
                            <Link to="/menu" className="text-sm text-green-600 hover:text-green-700 font-medium">
                                View all dishes
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {promotions.slice(0, 6).map((promo) => {
                                const ctaHref = promo.ctaLink || '/menu';
                                const isExternalCta = /^https?:\/\//i.test(ctaHref);
                                const discountLabel =
                                    promo.type === 'fixed'
                                        ? `$${Number(promo.value || 0).toFixed(2)} off`
                                        : `${Number(promo.value || 0)}% off`;
                                return (
                                    <article
                                        key={promo._id}
                                        className="rounded-2xl border border-green-200/70 dark:border-green-900/40 bg-white dark:bg-slate-800 overflow-hidden"
                                    >
                                        {promo.bannerImage ? (
                                            <img
                                                src={promo.bannerImage}
                                                alt={promo.title || promo.code}
                                                className="h-36 w-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="h-36 bg-linear-to-r from-green-500 to-emerald-500" />
                                        )}
                                        <div className="p-4">
                                            <p className="text-xs font-semibold tracking-wide text-green-600 mb-2">{promo.code}</p>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{promo.title}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                                {promo.description || `${discountLabel} on eligible orders.`}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {discountLabel}
                                                </span>
                                                {isExternalCta ? (
                                                    <a
                                                        href={ctaHref}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600"
                                                    >
                                                        {promo.ctaLabel || 'Shop now'}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        to={ctaHref}
                                                        className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600"
                                                    >
                                                        {promo.ctaLabel || 'Shop now'}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;
