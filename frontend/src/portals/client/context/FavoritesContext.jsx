import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthContext } from './AuthContext';

const FavoritesContext = createContext();

const getStorageKey = (userId) => (userId ? `foodiehub_favorites_${userId}` : null);

export const FavoritesProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuthContext();
    const userId = user?.id || user?._id || user?.email;

    const [favorites, setFavorites] = useState(() => {
        if (!isAuthenticated || !userId) {
            return [];
        }
        try {
            const key = getStorageKey(userId);
            const saved = key ? localStorage.getItem(key) : null;
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to parse favorites from storage', e);
            return [];
        }
    });

    // Sync favorites when user auth state changes
    useEffect(() => {
        if (!isAuthenticated || !userId) {
            setFavorites([]);
            return;
        }

        try {
            const key = getStorageKey(userId);
            const saved = localStorage.getItem(key);
            if (saved) {
                setFavorites(JSON.parse(saved));
            } else {
                // If legacy generic key exists, migrate once to user key
                const legacy = localStorage.getItem('foodiehub_favorites');
                if (legacy) {
                    try {
                        const parsed = JSON.parse(legacy);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            localStorage.setItem(key, legacy);
                            setFavorites(parsed);
                        }
                    } catch (_) {
                        // ignore parsing error if legacy item is invalid JSON
                    }
                    localStorage.removeItem('foodiehub_favorites');
                } else {
                    setFavorites([]);
                }
            }
        } catch (e) {
            console.error('Failed to load user favorites', e);
            setFavorites([]);
        }
    }, [isAuthenticated, userId]);

    // Save favorites whenever they change for the authenticated user
    useEffect(() => {
        if (!isAuthenticated || !userId) return;
        try {
            const key = getStorageKey(userId);
            if (key) {
                localStorage.setItem(key, JSON.stringify(favorites));
            }
        } catch (e) {
            console.error('Failed to save favorites to storage', e);
        }
    }, [favorites, isAuthenticated, userId]);

    const isFavorite = useCallback((foodId) => {
        if (!isAuthenticated || !foodId) return false;
        const targetId = foodId.id || foodId._id || foodId;
        return favorites.some(
            (item) => (item.id || item._id) === targetId
        );
    }, [isAuthenticated, favorites]);

    const toggleFavorite = useCallback((food) => {
        if (!isAuthenticated) {
            toast('Please sign in to save your favorite dishes!', {
                icon: '❤️',
                duration: 3000,
                position: 'bottom-center'
            });
            window.location.href = '/login';
            return;
        }
        if (!food) return;
        const targetId = food.id || food._id;
        const exists = favorites.some((item) => (item.id || item._id) === targetId);

        if (exists) {
            setFavorites((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
            toast(`Removed ${food.name} from Favorites`, { icon: '💔' });
        } else {
            const cleanFood = {
                id: targetId,
                _id: targetId,
                name: food.name,
                price: food.price,
                image: food.image,
                category: food.category,
                rating: food.rating,
                isVegetarian: Boolean(food.isVegetarian),
                description: food.description,
                preparationTime: food.preparationTime
            };
            setFavorites((prev) => [cleanFood, ...prev]);
            toast.success(`Saved ${food.name} to Favorites!`, { icon: '❤️' });
        }
    }, [isAuthenticated, favorites]);

    const removeFavorite = useCallback((foodId) => {
        if (!isAuthenticated) return;
        const targetId = foodId?.id || foodId?._id || foodId;
        setFavorites((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
    }, [isAuthenticated]);

    const contextValue = useMemo(() => ({
        favorites: isAuthenticated ? favorites : [],
        favoritesCount: isAuthenticated ? favorites.length : 0,
        isFavorite,
        toggleFavorite,
        removeFavorite
    }), [favorites, isAuthenticated, isFavorite, toggleFavorite, removeFavorite]);

    return (
        <FavoritesContext.Provider value={contextValue}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export default FavoritesContext;
