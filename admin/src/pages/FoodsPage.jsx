import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminFoodService from '../services/adminFoodService';

const categories = [
    'Pizza', 'Burger', 'Sushi', 'Chinese', 'Indian',
    'Mexican', 'Italian', 'Thai', 'Desserts', 'Beverages',
    'Salads', 'Breakfast', 'Seafood', 'BBQ', 'Healthy',
    'Fast Food', 'Vegetarian', 'Vegan'
];

const modalVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } }
};

const FoodsPage = ({ initialMode = null, initialFoodId = null }) => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [formState, setFormState] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Pizza',
        isAvailable: true,
        isVegetarian: false,
        isPopular: false,
        preparationTime: 15,
        image: null
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const response = await adminFoodService.getFoodsWithStats();
                const data = response?.data?.foods || [];
                setFoods(data);
            } catch (error) {
                console.error('Failed to fetch foods', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);

    useEffect(() => {
        if (!loading && initialMode === 'add') {
            handleOpenCreate();
        }
        if (!loading && initialMode === 'edit' && initialFoodId) {
            const match = foods.find((food) => food._id === initialFoodId);
            if (match) {
                handleOpenEdit(match);
            }
        }
    }, [loading, initialMode, initialFoodId, foods]);

    const filteredFoods = useMemo(() => {
        return foods.filter((food) => {
            const matchesSearch = `${food.name} ${food.description}`
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesCategory = category === 'All' || food.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [foods, search, category]);

    const handleOpenCreate = () => {
        setEditingFood(null);
        setFormState({
            name: '',
            description: '',
            price: '',
            category: 'Pizza',
            isAvailable: true,
            isVegetarian: false,
            isPopular: false,
            preparationTime: 15,
            image: null
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (food) => {
        setEditingFood(food);
        setFormState({
            name: food.name || '',
            description: food.description || '',
            price: food.price || '',
            category: food.category || 'Pizza',
            isAvailable: !!food.isAvailable,
            isVegetarian: !!food.isVegetarian,
            isPopular: !!food.isPopular,
            preparationTime: food.preparationTime || 15,
            image: null
        });
        setModalOpen(true);
    };

    const handleDelete = async (foodId) => {
        try {
            await adminFoodService.deleteFood(foodId);
            setFoods((prev) => prev.filter((item) => item._id !== foodId));
            toast.success('Food item deleted');
            setDeleteTarget(null);
        } catch (error) {
            toast.error('Failed to delete food');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('name', formState.name.trim());
        formData.append('description', formState.description.trim());
        formData.append('price', String(Number(formState.price)));
        formData.append('category', formState.category);
        formData.append('isAvailable', String(Boolean(formState.isAvailable)));
        formData.append('isVegetarian', String(Boolean(formState.isVegetarian)));
        formData.append('isPopular', String(Boolean(formState.isPopular)));
        if (formState.preparationTime !== '' && formState.preparationTime !== null && formState.preparationTime !== undefined) {
            formData.append('preparationTime', String(Number(formState.preparationTime)));
        }
        if (formState.image instanceof File) {
            formData.append('image', formState.image);
        }

        try {
            if (editingFood) {
                const response = await adminFoodService.updateFood(editingFood._id, formData);
                const updated = response?.data || response?.data?.data;
                setFoods((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
                toast.success('Food item updated');
            } else {
                const response = await adminFoodService.createFood(formData);
                const created = response?.data || response?.data?.data;
                setFoods((prev) => [created, ...prev]);
                toast.success('Food item created');
            }
            setModalOpen(false);
            navigate('/admin/foods');
        } catch (error) {
            const validationMessage = error?.response?.data?.errors?.[0]?.message;
            const message = validationMessage || error?.response?.data?.message || 'Failed to save food item';
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Food Items</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Manage menu items, pricing, and availability.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                    <FiPlus />
                    Add Food
                </button>
            </div>

            <div className="rounded-2xl bg-[var(--surface)] border border-slate-100 shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-3 top-3 text-[var(--text-secondary)]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search food items..."
                            className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                                <th className="pb-3">Item</th>
                                <th className="pb-3">Category</th>
                                <th className="pb-3">Price</th>
                                <th className="pb-3">Rating</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <AnimatePresence>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFoods.map((food, index) => (
                                    <motion.tr
                                        key={food._id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.2 }}
                                        whileHover={{ scale: 1.005 }}
                                        className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                                    >
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden">
                                                    {food.image && (
                                                        <img src={food.image} alt={food.name} className="h-full w-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[var(--text-primary)]">{food.name}</div>
                                                    <div className="text-xs text-[var(--text-secondary)]">{food.description?.slice(0, 40)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-[var(--text-secondary)]">{food.category}</td>
                                        <td className="py-4 font-semibold text-[var(--text-primary)]">${food.price}</td>
                                        <td className="py-4 text-[var(--text-secondary)]">
                                            {food.avgRating ? `${food.avgRating} (${food.reviewCount})` : 'No reviews'}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                food.isAvailable ? 'bg-secondary/20 text-secondary' : 'bg-danger/20 text-danger'
                                            }`}>
                                                {food.isAvailable ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(food)}
                                                    className="p-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(food)}
                                                    className="p-2 rounded-md bg-danger/10 text-danger hover:bg-danger/20"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </AnimatePresence>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setModalOpen(false)}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(event) => event.stopPropagation()}
                            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                    {editingFood ? 'Edit Food Item' : 'Add Food Item'}
                                </h2>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    type="button"
                                >
                                    Close
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Name</label>
                                        <input
                                            value={formState.name}
                                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Category</label>
                                        <select
                                            value={formState.category}
                                            onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Description</label>
                                    <textarea
                                        value={formState.description}
                                        onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Price</label>
                                        <input
                                            type="number"
                                            value={formState.price}
                                            onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Prep Time (min)</label>
                                        <input
                                            type="number"
                                            value={formState.preparationTime}
                                            onChange={(e) => setFormState({ ...formState, preparationTime: e.target.value })}
                                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormState({ ...formState, image: e.target.files?.[0] || null })}
                                            className="mt-1 w-full text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                        <input
                                            type="checkbox"
                                            checked={formState.isAvailable}
                                            onChange={(e) => setFormState({ ...formState, isAvailable: e.target.checked })}
                                        />
                                        Available
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                        <input
                                            type="checkbox"
                                            checked={formState.isVegetarian}
                                            onChange={(e) => setFormState({ ...formState, isVegetarian: e.target.checked })}
                                        />
                                        Vegetarian
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                        <input
                                            type="checkbox"
                                            checked={formState.isPopular}
                                            onChange={(e) => setFormState({ ...formState, isPopular: e.target.checked })}
                                        />
                                        Popular
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-4 py-2 rounded-md bg-white border border-slate-200 text-[var(--text-primary)]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                                    >
                                        {editingFood ? 'Save Changes' : 'Create Food'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteTarget(null)}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(event) => event.stopPropagation()}
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                        >
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Confirm Delete</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">
                                Delete <span className="font-semibold text-[var(--text-primary)]">{deleteTarget.name}</span>? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2 rounded-md bg-white border border-slate-200 text-[var(--text-primary)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(deleteTarget._id)}
                                    className="px-4 py-2 rounded-md bg-danger text-white hover:bg-danger/90"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoodsPage;
