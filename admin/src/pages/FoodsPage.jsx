import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash2,
  FiPlus,
  FiSearch,
  FiDownload,
  FiStar,
  FiPackage,
  FiAlertCircle,
  FiGrid,
  FiList,
  FiSliders,
  FiChevronDown,
  FiChevronUp,
  FiImage
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdminDataContext } from "../context/adminDataContextCore";
import StatusBadge from "../components/common/StatusBadge";
import DataTable from "../components/common/DataTable";
import FoodForm from "../components/foods/FoodForm";
import { format } from "date-fns";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};
const FoodsPage = ({ initialMode = null, initialFoodId = null }) => {
  const navigate = useNavigate();
  const {
    state,
    fetchFoods,
    fetchFoodById,
    createFood,
    updateFood,
    deleteFood,
    updateFoodAvailability,
    isLoading,
    getError,
    setFilters,
    clearFilters,
    pagination,
    goToPage,
    setPageSize,
    bulkUpdateFoods,
    bulkDeleteFoods,
    exportData,
    invalidateCache
  } = useAdminDataContext();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const categories = [
    "Pizza",
    "Burger",
    "Sushi",
    "Chinese",
    "Indian",
    "Mexican",
    "Italian",
    "Thai",
    "Desserts",
    "Beverages",
    "Salads",
    "Breakfast",
    "Seafood",
    "BBQ",
    "Healthy",
    "Fast Food",
    "Vegetarian",
    "Vegan"
  ];
  const cuisines = [
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "Japanese",
    "Thai",
    "American",
    "Mediterranean",
    "French",
    "Spanish",
    "Korean",
    "Vietnamese",
    "Greek",
    "Turkish",
    "Lebanese"
  ];
  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian", color: "green" },
    { id: "vegan", label: "Vegan", color: "emerald" },
    { id: "glutenFree", label: "Gluten Free", color: "yellow" },
    { id: "spicy", label: "Spicy", color: "red" }
  ];
  useEffect(() => {
    loadFoods();
  }, [selectedCategory, selectedCuisine, selectedStatus, priceRange, sortBy, sortOrder]);
  useEffect(() => {
    if (initialMode === "add") {
      handleOpenCreate();
    } else if (initialMode === "edit" && initialFoodId) {
      loadFoodForEdit(initialFoodId);
    }
  }, [initialMode, initialFoodId]);
  const loadFoods = async () => {
    await fetchFoods({
      search,
      category: selectedCategory !== "All" ? selectedCategory : void 0,
      cuisine: selectedCuisine !== "All" ? selectedCuisine : void 0,
      status: selectedStatus !== "All" ? selectedStatus : void 0,
      dietary: selectedDietary,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy,
      sortOrder,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage
    });
  };
  const loadFoodForEdit = async (id) => {
    const food = await fetchFoodById(id);
    if (food) {
      handleOpenEdit(food);
    } else {
      toast.error("Food item not found");
      navigate("/admin/foods");
    }
  };
  const handleSearch = useCallback((value) => {
    setSearch(value);
    const timeout = setTimeout(() => {
      loadFoods();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);
  const handleOpenCreate = () => {
    setEditingFood(null);
    setModalOpen(true);
  };
  const handleOpenEdit = (food) => {
    setEditingFood(food);
    setModalOpen(true);
  };
  const handleDuplicate = async (food) => {
    try {
      const { _id, createdAt, updatedAt, ...foodData } = food;
      await createFood({
        ...foodData,
        name: `${food.name} (Copy)`
      });
      toast.success("Food item duplicated");
      loadFoods();
    } catch (error) {
      toast.error("Failed to duplicate food");
    }
  };
  const handleDelete = async (foodId) => {
    const success = await deleteFood(foodId);
    if (success) {
      setSelectedFoods((prev) => prev.filter((id) => id !== foodId));
      setDeleteTarget(null);
    }
  };
  const handleBulkDelete = async () => {
    await bulkDeleteFoods(selectedFoods);
    setSelectedFoods([]);
    setBulkDeleteTarget(false);
    loadFoods();
  };
  const handleBulkUpdate = async (updates) => {
    await bulkUpdateFoods(selectedFoods, updates);
    setSelectedFoods([]);
    setShowBulkActions(false);
    loadFoods();
  };
  const handleToggleAvailability = async (food) => {
    await updateFoodAvailability(food._id, !food.available);
  };
  const handleExport = async (format2) => {
    await exportData("foods", format2);
  };
  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedCuisine("All");
    setSelectedStatus("All");
    setSelectedDietary([]);
    setPriceRange([0, 100]);
    clearFilters();
    loadFoods();
  };
  const columns = [
    {
      key: "image",
      title: "Image",
      render: (_, record) => <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {record.image ? <img
        src={record.image}
        alt={record.name}
        className="w-full h-full object-cover"
      /> : <FiImage className="w-6 h-6 m-3 text-slate-400" />}
                </div>,
      width: "80px"
    },
    {
      key: "name",
      title: "Item",
      sortable: true,
      render: (_, record) => <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                        {record.name}
                    </div>
                    <div className="text-xs text-slate-500">
                        {record.description?.substring(0, 50)}...
                    </div>
                </div>
    },
    {
      key: "category",
      title: "Category",
      sortable: true,
      render: (value) => <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                    {value}
                </span>
    },
    {
      key: "cuisine",
      title: "Cuisine",
      sortable: true
    },
    {
      key: "price",
      title: "Price",
      sortable: true,
      align: "right",
      render: (value, record) => <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                        ${Number(value || 0).toFixed(2)}
                    </div>
                    {record.discount > 0 && <div className="text-xs text-green-500">
                            -{record.discount}% off
                        </div>}
                </div>
    },
    {
      key: "rating",
      title: "Rating",
      sortable: true,
      align: "center",
      render: (value, record) => <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{value?.toFixed(1) || "0.0"}</span>
                    <span className="text-xs text-slate-400">
                        ({record.totalReviews})
                    </span>
                </div>
    },
    {
      key: "available",
      title: "Status",
      sortable: true,
      align: "center",
      render: (value) => <StatusBadge
        status={value}
        type="food"
        variant="pill"
        showIcon
      />
    },
    {
      key: "orderCount",
      title: "Orders",
      sortable: true,
      align: "right",
      render: (value) => Number(value || 0).toLocaleString()
    },
    {
      key: "preparationTime",
      title: "Prep Time",
      sortable: true,
      align: "right",
      render: (value) => `${Number(value || 0)} min`
    },
    {
      key: "createdAt",
      title: "Created",
      sortable: true,
      render: (value) => format(new Date(value), "MMM d, yyyy")
    }
  ];
  const FilterPanel = () => <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className="overflow-hidden"
  >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {
    /* Category Filter */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Category
                        </label>
                        <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            <option value="All">All Categories</option>
                            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {
    /* Cuisine Filter */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Cuisine
                        </label>
                        <select
    value={selectedCuisine}
    onChange={(e) => setSelectedCuisine(e.target.value)}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            <option value="All">All Cuisines</option>
                            {cuisines.map((cuisine) => <option key={cuisine} value={cuisine}>{cuisine}</option>)}
                        </select>
                    </div>

                    {
    /* Status Filter */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Status
                        </label>
                        <select
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            <option value="All">All Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>

                    {
    /* Price Range */
  }
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Price Range
                        </label>
                        <div className="flex items-center gap-2">
                            <input
    type="number"
    value={priceRange[0]}
    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                         border border-slate-200 dark:border-slate-700
                                         rounded-lg text-sm"
    placeholder="Min"
  />
                            <span>-</span>
                            <input
    type="number"
    value={priceRange[1]}
    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
    className="w-full px-3 py-2 bg-white dark:bg-slate-800
                                         border border-slate-200 dark:border-slate-700
                                         rounded-lg text-sm"
    placeholder="Max"
  />
                        </div>
                    </div>
                </div>

                {
    /* Dietary Filters */
  }
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                        Dietary Options
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {dietaryOptions.map((option) => <button
    key={option.id}
    onClick={() => {
      setSelectedDietary(
        (prev) => prev.includes(option.id) ? prev.filter((id) => id !== option.id) : [...prev, option.id]
      );
    }}
    className={`
                                    px-3 py-1.5 rounded-full text-xs font-medium
                                    transition-colors duration-200
                                    ${selectedDietary.includes(option.id) ? `bg-${option.color}-100 text-${option.color}-700
                                           dark:bg-${option.color}-900/30 dark:text-${option.color}-400` : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}
                                `}
  >
                                {option.label}
                            </button>)}
                    </div>
                </div>

                {
    /* Active Filters */
  }
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        {selectedCategory !== "All" && <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                Category: {selectedCategory}
                                <button onClick={() => setSelectedCategory("All")}>×</button>
                            </span>}
                        {selectedCuisine !== "All" && <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                Cuisine: {selectedCuisine}
                                <button onClick={() => setSelectedCuisine("All")}>×</button>
                            </span>}
                        {selectedStatus !== "All" && <span className="inline-flex items-center gap-1 px-2 py-1
                                           bg-orange-100 dark:bg-orange-900/30
                                           text-orange-700 dark:text-orange-300
                                           rounded-full text-xs">
                                Status: {selectedStatus}
                                <button onClick={() => setSelectedStatus("All")}>×</button>
                            </span>}
                        {selectedDietary.map((diet) => <span key={diet} className="inline-flex items-center gap-1 px-2 py-1
                                                       bg-orange-100 dark:bg-orange-900/30
                                                       text-orange-700 dark:text-orange-300
                                                       rounded-full text-xs">
                                {diet}
                                <button onClick={() => setSelectedDietary((prev) => prev.filter((d) => d !== diet))}>×</button>
                            </span>)}
                    </div>
                    
                    <button
    onClick={handleClearFilters}
    className="text-xs text-orange-500 hover:text-orange-600"
  >
                        Clear All
                    </button>
                </div>
            </div>
        </motion.div>;
  const BulkActionsBar = () => <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                     bg-white dark:bg-slate-800 rounded-xl shadow-2xl
                     border border-slate-200 dark:border-slate-700
                     p-4 flex items-center gap-4"
  >
            <span className="text-sm font-medium">
                {selectedFoods.length} items selected
            </span>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <select
    onChange={(e) => {
      const value = e.target.value;
      if (value === "available" || value === "unavailable") {
        handleBulkUpdate({ available: value === "available" });
      } else if (value === "delete") {
        setBulkDeleteTarget(true);
      }
      e.target.value = "";
    }}
    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700
                         border border-transparent rounded-lg text-sm
                         focus:outline-none focus:border-orange-500"
  >
                <option value="">Bulk Actions</option>
                <option value="available">Mark as Available</option>
                <option value="unavailable">Mark as Unavailable</option>
                <option value="delete" className="text-red-500">Delete Selected</option>
            </select>

            <button
    onClick={() => setSelectedFoods([])}
    className="text-slate-400 hover:text-slate-600"
  >
                Cancel
            </button>
        </motion.div>;
  if (isLoading("foods") && !state.foods.length) {
    return <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-orange-200 dark:border-orange-900/30 
                                      border-t-orange-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FiPackage className="w-6 h-6 text-orange-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Loading food items...
                    </p>
                </div>
            </div>;
  }
  return <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-6"
  >
            {
    /* Header */
  }
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Food Items
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage your menu items, pricing, and availability
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {
    /* View Toggle */
  }
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button
    onClick={() => setViewMode("list")}
    className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-orange-500 shadow-sm" : "text-slate-500 hover:text-orange-500"}`}
  >
                            <FiList className="w-4 h-4" />
                        </button>
                        <button
    onClick={() => setViewMode("grid")}
    className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-orange-500 shadow-sm" : "text-slate-500 hover:text-orange-500"}`}
  >
                            <FiGrid className="w-4 h-4" />
                        </button>
                    </div>

                    {
    /* Export Dropdown */
  }
                    <div className="relative">
                        <button
    onClick={() => setShowBulkActions(!showBulkActions)}
    className="px-4 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-xl text-slate-700 dark:text-slate-300
                                     hover:border-orange-500 transition-colors
                                     flex items-center gap-2"
  >
                            <FiDownload className="w-4 h-4" />
                            <span>Export</span>
                        </button>

                        <AnimatePresence>
                            {showBulkActions && <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800
                                             rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                             overflow-hidden z-10"
  >
                                    {["csv", "excel", "pdf"].map((format2) => <button
    key={format2}
    onClick={() => {
      handleExport(format2);
      setShowBulkActions(false);
    }}
    className="w-full px-4 py-3 text-left text-sm
                                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                                     flex items-center gap-2"
  >
                                            <FiDownload className="w-4 h-4" />
                                            <span className="capitalize">Export as {format2.toUpperCase()}</span>
                                        </button>)}
                                </motion.div>}
                        </AnimatePresence>
                    </div>

                    {
    /* Add Button */
  }
                    <button
    onClick={handleOpenCreate}
    className="px-4 py-2 bg-orange-500 hover:bg-orange-600
                                 text-white rounded-xl transition-colors
                                 flex items-center gap-2 shadow-lg shadow-orange-500/25"
  >
                        <FiPlus className="w-4 h-4" />
                        <span>Add Food</span>
                    </button>
                </div>
            </motion.div>

            {
    /* Search and Filters */
  }
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {
    /* Search */
  }
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
    value={search}
    onChange={(e) => handleSearch(e.target.value)}
    placeholder="Search food items by name, description, or tags..."
    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm
                                     focus:outline-none focus:border-orange-500
                                     focus:ring-2 focus:ring-orange-500/20"
  />
                    </div>

                    {
    /* Filter Toggle */
  }
                    <button
    onClick={() => setShowFilters(!showFilters)}
    className={`px-4 py-2 rounded-lg border transition-colors
                                 flex items-center gap-2
                                 ${showFilters ? "bg-orange-500 text-white border-orange-500" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500"}`}
  >
                        <FiSliders className="w-4 h-4" />
                        <span>Filters</span>
                        {(selectedCategory !== "All" || selectedCuisine !== "All" || selectedStatus !== "All" || selectedDietary.length > 0) && <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center">
                                {[
    selectedCategory !== "All" ? 1 : 0,
    selectedCuisine !== "All" ? 1 : 0,
    selectedStatus !== "All" ? 1 : 0,
    selectedDietary.length
  ].reduce((a, b) => a + b, 0)}
                            </span>}
                    </button>

                    {
    /* Sort */
  }
                    <div className="flex items-center gap-2">
                        <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="px-3 py-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg text-sm"
  >
                            <option value="createdAt">Date Created</option>
                            <option value="name">Name</option>
                            <option value="price">Price</option>
                            <option value="rating">Rating</option>
                            <option value="orderCount">Popularity</option>
                        </select>
                        <button
    onClick={() => setSortOrder((prev) => prev === "asc" ? "desc" : "asc")}
    className="p-2 bg-white dark:bg-slate-800
                                     border border-slate-200 dark:border-slate-700
                                     rounded-lg hover:border-orange-500 transition-colors"
  >
                            {sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>
                </div>

                {
    /* Filter Panel */
  }
                <AnimatePresence>
                    {showFilters && <FilterPanel />}
                </AnimatePresence>
            </motion.div>

            {
    /* Error Display */
  }
            <AnimatePresence>
                {getError("foods") && <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="p-4 bg-red-50 dark:bg-red-900/20
                                 border border-red-200 dark:border-red-800
                                 rounded-xl flex items-center gap-3"
  >
                        <FiAlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                            {getError("foods")}
                        </span>
                        <button
    onClick={loadFoods}
    className="ml-auto text-sm text-red-600 hover:text-red-700"
  >
                            Retry
                        </button>
                    </motion.div>}
            </AnimatePresence>

            {
    /* Data Table */
  }
            <motion.div variants={itemVariants}>
                <DataTable
    columns={columns}
    data={state.foods}
    loading={isLoading("foods")}
    onSort={(key, direction) => {
      setSortBy(key);
      setSortOrder(direction);
    }}
    onRowClick={(record) => navigate(`/admin/foods/${record._id}`)}
    onSelectionChange={(selected) => setSelectedFoods(selected)}
    onEdit={(record) => handleOpenEdit(record)}
    onDelete={(record) => setDeleteTarget(record)}
    onView={(record) => navigate(`/admin/foods/${record._id}`)}
    selectable
    rowKey="_id"
    currentPage={pagination.currentPage}
    pageSize={pagination.itemsPerPage}
    totalItems={pagination.totalItems}
    onPageChange={goToPage}
    onPageSizeChange={setPageSize}
    showSizeChanger
    pageSizeOptions={[10, 25, 50, 100]}
    striped
    hoverable
  />
            </motion.div>

            {
    /* Bulk Actions Bar */
  }
            <AnimatePresence>
                {selectedFoods.length > 0 && <BulkActionsBar />}
            </AnimatePresence>

            {
    /* Food Form Modal */
  }
            <AnimatePresence>
                {modalOpen && <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
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
    onClick={(e) => e.stopPropagation()}
    className="w-full max-w-4xl"
  >
                            <FoodForm
    initialData={editingFood || void 0}
    onSubmit={async (data) => {
      if (editingFood) {
        await updateFood(editingFood._id, data);
      } else {
        await createFood(data);
      }
      setModalOpen(false);
      loadFoods();
    }}
    onCancel={() => setModalOpen(false)}
    onDelete={editingFood ? async (id) => {
      await deleteFood(id);
      setModalOpen(false);
      loadFoods();
    } : void 0}
    mode={editingFood ? "edit" : "create"}
    categories={categories}
    cuisines={cuisines}
    loading={isLoading("createFood") || isLoading("updateFood")}
  />
                        </motion.div>
                    </motion.div>}
            </AnimatePresence>

            {
    /* Delete Confirmation Modal */
  }
            <AnimatePresence>
                {deleteTarget && <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
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
    onClick={(e) => e.stopPropagation()}
    className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
  >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30
                                              rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiTrash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Delete Food Item
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Are you sure you want to delete <span className="font-semibold">{deleteTarget.name}</span>? 
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
    onClick={() => setDeleteTarget(null)}
    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                                 transition-colors"
  >
                                        Cancel
                                    </button>
                                    <button
    onClick={() => handleDelete(deleteTarget._id)}
    className="flex-1 px-4 py-2 bg-red-500 text-white
                                                 rounded-lg text-sm hover:bg-red-600
                                                 transition-colors"
  >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>}
            </AnimatePresence>

            {
    /* Bulk Delete Confirmation Modal */
  }
            <AnimatePresence>
                {bulkDeleteTarget && <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setBulkDeleteTarget(false)}
  >
                        <motion.div
    variants={modalVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    onClick={(e) => e.stopPropagation()}
    className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl"
  >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30
                                              rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiAlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Delete Multiple Items
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Are you sure you want to delete {selectedFoods.length} food items? 
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
    onClick={() => setBulkDeleteTarget(false)}
    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700
                                                 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700
                                                 transition-colors"
  >
                                        Cancel
                                    </button>
                                    <button
    onClick={handleBulkDelete}
    className="flex-1 px-4 py-2 bg-red-500 text-white
                                                 rounded-lg text-sm hover:bg-red-600
                                                 transition-colors"
  >
                                        Delete All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>}
            </AnimatePresence>
        </motion.div>;
};
var stdin_default = FoodsPage;
export {
  stdin_default as default
};
