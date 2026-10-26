import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiArrowLeft, FiPlus, FiTrash2, FiStar, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useFavorites from '../hooks/useFavorites';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import resolveImageUrl from '../utils/image';

const FavoritesPage = () => {
    const { favorites, removeFavorite } = useFavorites();
    const { addItem, openCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = async (food, e) => {
        e?.stopPropagation();
        if (!isAuthenticated) {
            toast('Please sign in to add favorites to your cart', { icon: '🍽️' });
            navigate('/login', { state: { from: '/favorites' } });
            return;
        }
        try {
            await addItem(food.id || food._id, 1);
            toast.success(`Added ${food.name} to cart!`, { icon: '🛒' });
            openCart();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add item');
        }
    };

    const handleAddAllToCart = async () => {
        if (!favorites.length) return;
        if (!isAuthenticated) {
            toast('Please sign in to order your favorites', { icon: '🍽️' });
            navigate('/login', { state: { from: '/favorites' } });
            return;
        }
        const toastId = toast.loading('Adding all favorites to cart...');
        try {
            let count = 0;
            for (const item of favorites) {
                await addItem(item.id || item._id, 1);
                count++;
            }
            toast.dismiss(toastId);
            toast.success(`Added ${count} dishes to cart!`, { icon: '🎉' });
            openCart();
        } catch (err) {
            toast.dismiss(toastId);
            toast.error('Failed to add all favorites');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="w-full space-y-6">
                
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                                <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
                                    <FiHeart className="w-6 h-6 fill-rose-500" />
                                </span>
                                My Favorites
                            </h1>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                {favorites.length} saved
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Your saved dishes and comfort foods for rapid 1-click reordering.
                        </p>
                    </div>

                    {favorites.length > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAddAllToCart}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md shadow-green-500/20 transition-all flex items-center gap-2"
                            >
                                <FiShoppingBag className="w-4 h-4" />
                                Add All to Cart
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {favorites.length === 0 ? (
                    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl mb-4">
                            <FiHeart className="w-10 h-10 stroke-rose-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            No Favorite Dishes Saved Yet
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                            Whenever you discover something you crave, tap the heart icon on any dish card to keep it saved here.
                        </p>
                        <Link
                            to="/menu"
                            className="px-6 py-3 rounded-xl font-bold text-sm bg-green-500 hover:bg-green-600 text-white transition-colors shadow-md shadow-green-500/20 inline-flex items-center gap-2"
                        >
                            Explore Our Menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {favorites.map((food) => {
                                const foodId = food.id || food._id;
                                return (
                                    <motion.div
                                        key={foodId}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => navigate(`/food/${foodId}`)}
                                        className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg hover:border-green-500/30 transition-all duration-300 cursor-pointer flex flex-col"
                                    >
                                        {/* Image Section */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img
                                                src={resolveImageUrl(food.image)}
                                                alt={food.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Category Tag */}
                                            {food.category && (
                                                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-2xs font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white shadow-sm">
                                                    {food.category}
                                                </span>
                                            )}
                                            {/* Remove Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFavorite(foodId);
                                                }}
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-rose-500 hover:text-white hover:bg-rose-500 flex items-center justify-center shadow-md transition-all"
                                                title="Remove from favorites"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Details */}
                                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h3 className="font-semibold text-foreground text-base truncate">
                                                        {food.name}
                                                    </h3>
                                                    {food.rating > 0 && (
                                                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                                                            <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                            <span className="tabular-nums">{food.rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                                    {food.description || 'Delicious freshly prepared dish.'}
                                                </p>
                                            </div>

                                            {/* Price & Add to Cart */}
                                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                                <div>
                                                    <span className="text-2xs text-muted-foreground uppercase font-semibold">Price</span>
                                                    <div className="text-lg font-bold tabular-nums text-foreground">
                                                        ${Number(food.price || 0).toFixed(2)}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleAddToCart(food, e)}
                                                    className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-green-500/20 transition-all"
                                                >
                                                    <FiPlus className="w-4 h-4" />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

            </div>
        </div>
    );
};

export default FavoritesPage;
