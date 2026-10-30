import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    FiArrowLeft, 
    FiShoppingCart, 
    FiStar, 
    FiClock, 
    FiPlus, 
    FiMinus, 
    FiCheck,
    FiTag,
    FiMessageSquare,
    FiHeart
} from 'react-icons/fi';
import foodService from '../services/food.service';
import reviewService from '../services/review.service';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import useFavorites from '../hooks/useFavorites';
import resolveImageUrl from '../utils/image';
import Loader from '../components/ui/Loader';

const FoodDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addItem, openCart } = useCart();

    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');

    const fetchFoodDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await foodService.getFoodById(id);
            const foodData = response?.data || response;
            setFood(foodData);
            if (foodData?.reviews && Array.isArray(foodData.reviews)) {
                setReviews(foodData.reviews);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Food item not found');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await reviewService.getFoodReviews(id);
            const reviewList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setReviews(reviewList);
        } catch (err) {
            console.error('Failed to load reviews:', err);
        }
    }, [id]);

    useEffect(() => {
        fetchFoodDetails();
        fetchReviews();
    }, [fetchFoodDetails, fetchReviews]);

    const handleToggleFavorite = () => {
        if (!isAuthenticated) {
            toast('Please sign in to save your favorite dishes!', {
                icon: '❤️',
                duration: 3000,
                position: 'bottom-center',
            });
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        toggleFavorite(food);
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast('Please sign in to add items to your cart', { icon: '🛒' });
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        setAddingToCart(true);
        try {
            await addItem(food.id || food._id, quantity);
            toast.success(`Added ${quantity} × ${food.name} to cart!`, {
                icon: '🛒',
                duration: 3000
            });
            openCart();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add item to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast('Please sign in to leave a review', { icon: '⭐' });
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        if (!newComment.trim()) {
            toast.error('Please write a short review comment');
            return;
        }

        setSubmittingReview(true);
        try {
            await reviewService.addReview({
                foodId: food.id || food._id,
                rating: newRating,
                comment: newComment.trim()
            });
            toast.success('Thank you for your review!');
            setNewComment('');
            setNewRating(5);
            fetchReviews();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !food) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Food Item Not Found
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {error || "The dish you're looking for doesn't seem to exist or has been removed."}
                    </p>
                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl font-medium transition-opacity"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        Back to Menu
                    </Link>
                </div>
            </div>
        );
    }

    const price = Number(food.price || 0);
    const rating = Number(food.rating || 4.5);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="w-full">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[var(--primary)] mb-6 transition-colors"
                >
                    <FiArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Main Product Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10">
                        {/* Image Showcase */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800"
                        >
                            <img
                                src={resolveImageUrl(food.image)}
                                alt={food.name}
                                className="w-full h-full object-cover"
                            />
                            {food.category && (
                                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1 shadow-sm">
                                    <FiTag className="w-3 h-3 text-[var(--primary)]" />
                                    {food.category}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-all active:scale-95 z-10 ${
                                    isFavorite(food.id || food._id)
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-rose-500 hover:scale-110'
                                }`}
                                title={isFavorite(food.id || food._id) ? "Remove from Favorites" : "Save to Favorites"}
                            >
                                <FiHeart className={`w-5 h-5 ${isFavorite(food.id || food._id) ? 'fill-white' : ''}`} />
                            </button>
                        </motion.div>

                        {/* Details & Actions */}
                        <div className="flex flex-col justify-between space-y-6">
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                                        {food.name}
                                    </h1>
                                    <span className="text-3xl font-extrabold text-[var(--primary)]">
                                        {price.toFixed(2)} ETB
                                    </span>
                                </div>

                                {/* Rating & Meta */}
                                <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                                    <div className="flex items-center gap-1 text-amber-500 font-semibold bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full">
                                        <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span>{rating.toFixed(1)}</span>
                                        <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <FiClock className="w-4 h-4" />
                                        <span>20-30 min prep</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-medium">
                                        <FiCheck className="w-3.5 h-3.5" /> Freshly prepared
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base mb-6">
                                    {food.description || "Prepared with the finest fresh ingredients and authentic seasonings. Savory, satisfying, and cooked to perfection for a delightful culinary experience."}
                                </p>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Quantity
                                    </span>
                                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                            aria-label="Decrease quantity"
                                        >
                                            <FiMinus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-bold text-slate-900 dark:text-white">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => q + 1)}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                            aria-label="Increase quantity"
                                        >
                                            <FiPlus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="flex-1 py-4 px-6 bg-[var(--primary)] hover:opacity-90 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-lg shadow-[var(--primary)]/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                    >
                                        <FiShoppingCart className="w-5 h-5" />
                                        <span>
                                            {addingToCart ? 'Adding...' : `Add to Cart • ${(price * quantity).toFixed(2)} ETB`}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Reviews Section */}
                <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Customer Reviews
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Real feedback from our verified customers
                            </p>
                        </div>
                    </div>

                    {/* Add Review Form */}
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                                Leave a Review
                            </h4>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-slate-500">Rating:</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setNewRating(star)}
                                        className="p-1 focus:outline-none"
                                    >
                                        <FiStar
                                            className={`w-5 h-5 ${
                                                star <= newRating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-300 dark:text-slate-600'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="What did you think of this dish? Taste, portion, flavor..."
                                rows={3}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[var(--primary)] mb-3"
                            />
                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
                            >
                                {submittingReview ? 'Submitting...' : 'Post Review'}
                            </button>
                        </form>
                    ) : (
                        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-sm text-slate-500">
                            Please{' '}
                            <Link to="/login" className="text-[var(--primary)] underline font-medium">
                                log in
                            </Link>{' '}
                            to leave a review for this dish.
                        </div>
                    )}

                    {/* Review List */}
                    {reviews.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <FiMessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p>No reviews yet. Be the first to review this dish!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((rev, index) => (
                                <div
                                    key={rev.id || rev._id || index}
                                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                            {rev.user?.name || rev.userName || 'Verified Customer'}
                                        </span>
                                        <div className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                                            <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <span>{rev.rating || 5}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {rev.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodDetailPage;
