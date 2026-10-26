import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiPackage, FiAlertCircle, FiImage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";

import { useAdminDataContext } from "../context/adminDataContextCore";
import StatusBadge from "../components/common/StatusBadge";
import FoodForm from "../components/foods/FoodForm";

import FoodFilters from "./foods/components/FoodFilters";
import BulkActionsBar from "./foods/components/BulkActionsBar";
import FoodDeleteModals from "./foods/components/FoodDeleteModals";
import FoodHeaderToolbar from "./foods/components/FoodHeaderToolbar";
import FoodGridView from "./foods/components/FoodGridView";
import FoodTableView from "./foods/components/FoodTableView";
import FoodDetailModal from "./foods/components/FoodDetailModal";

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
    clearFilters,
    foodPagination,
    goToPage,
    setPageSize,
    bulkUpdateFoods,
    bulkDeleteFoods,
    exportData
  } = useAdminDataContext();

  const pagination = foodPagination || state.pagination?.foods || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  };

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
  const [viewingFood, setViewingFood] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const categories = [
    "Pizza", "Burger", "Sushi", "Chinese", "Indian", "Mexican",
    "Italian", "Thai", "Desserts", "Beverages", "Salads", "Breakfast",
    "Seafood", "BBQ", "Healthy", "Fast Food", "Vegetarian", "Vegan"
  ];

  const cuisines = [
    "Italian", "Chinese", "Indian", "Mexican", "Japanese", "Thai",
    "American", "Mediterranean", "French", "Spanish", "Korean",
    "Vietnamese", "Greek", "Turkish", "Lebanese"
  ];

  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian", color: "green" },
    { id: "vegan", label: "Vegan", color: "emerald" },
    { id: "glutenFree", label: "Gluten Free", color: "yellow" },
    { id: "spicy", label: "Spicy", color: "red" }
  ];

  const loadFoods = useCallback(async () => {
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
  }, [
    fetchFoods, search, selectedCategory, selectedCuisine, selectedStatus, 
    selectedDietary, priceRange, sortBy, sortOrder, pagination.currentPage, pagination.itemsPerPage
  ]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    if (initialMode === "add") {
      handleOpenCreate();
    } else if (initialMode === "edit" && initialFoodId) {
      loadFoodForEdit(initialFoodId);
    }
  }, [initialMode, initialFoodId]);

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
  }, []);

  const handleOpenCreate = () => {
    setEditingFood(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (food) => {
    setEditingFood(food);
    setModalOpen(true);
  };

  const handleOpenView = (food) => {
    setViewingFood(food);
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
    const isCurrentAvailable = food.available ?? food.isAvailable ?? true;
    const foodId = food._id || food.id;
    await updateFoodAvailability(foodId, !isCurrentAvailable);
    if (viewingFood && (viewingFood._id === foodId || viewingFood.id === foodId)) {
      setViewingFood((prev) => ({
        ...prev,
        isAvailable: !isCurrentAvailable,
        available: !isCurrentAvailable
      }));
    }
    loadFoods();
  };

  const handleExport = async (formatType) => {
    const isSelected = selectedFoods && selectedFoods.length > 0;
    await exportData("foods", formatType, {
      selectedIds: isSelected ? selectedFoods : [],
      filters: {
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        status: selectedStatus !== "All" ? selectedStatus : undefined,
        search: search.trim() || undefined,
        sortBy,
        sortOrder
      }
    });
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

  const activeFilterCount = [
    selectedCategory !== "All" ? 1 : 0,
    selectedCuisine !== "All" ? 1 : 0,
    selectedStatus !== "All" ? 1 : 0,
    selectedDietary.length
  ].reduce((a, b) => a + b, 0);

  if (isLoading("foods") && !state.foods.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 dark:border-orange-900/30 border-t-primary-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-primary-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading food items...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header and Toolbar with Expandable Filter Panel */}
      <motion.div variants={itemVariants}>
        <FoodHeaderToolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          showBulkActions={showBulkActions}
          setShowBulkActions={setShowBulkActions}
          handleExport={handleExport}
          selectedCount={selectedFoods.length}
          handleOpenCreate={handleOpenCreate}
          search={search}
          handleSearch={handleSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilterCount={activeFilterCount}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        >
          <AnimatePresence>
            {showFilters && (
              <FoodFilters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                selectedCuisine={selectedCuisine}
                setSelectedCuisine={setSelectedCuisine}
                cuisines={cuisines}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                dietaryOptions={dietaryOptions}
                selectedDietary={selectedDietary}
                setSelectedDietary={setSelectedDietary}
                handleClearFilters={handleClearFilters}
              />
            )}
          </AnimatePresence>
        </FoodHeaderToolbar>
      </motion.div>

      {/* Error Alert Display */}
      <AnimatePresence>
        {getError("foods") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
          >
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {getError("foods")}
            </span>
            <button
              onClick={loadFoods}
              className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Items View: List or Grid */}
      <motion.div variants={itemVariants}>
        {viewMode === "list" ? (
          <FoodTableView
            foods={state.foods}
            loading={isLoading("foods")}
            selectedFoods={selectedFoods}
            onSelectFood={(id) => {
              setSelectedFoods((prev) =>
                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
              );
            }}
            onSelectAll={() => {
              const allIds = state.foods.map((f) => f._id || f.id);
              const isAll = state.foods.length > 0 && state.foods.every((f) => selectedFoods.includes(f._id || f.id));
              setSelectedFoods(isAll ? [] : allIds);
            }}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={(record) => setDeleteTarget(record)}
            onToggleAvailability={handleToggleAvailability}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(key, direction) => {
              setSortBy(key);
              setSortOrder(direction);
            }}
            currentPage={pagination.currentPage}
            pageSize={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
            onPageChange={(page) => goToPage("foods", page)}
            onPageSizeChange={(size) => setPageSize("foods", size)}
          />
        ) : (
          <FoodGridView
            foods={state.foods}
            onEdit={handleOpenEdit}
            onDelete={(record) => setDeleteTarget(record)}
            onView={handleOpenView}
            onToggleAvailability={handleToggleAvailability}
            selectedFoods={selectedFoods}
            onSelectFood={(id) => {
              setSelectedFoods((prev) =>
                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
              );
            }}
          />
        )}
      </motion.div>

      {/* Bulk Actions Floating Bar */}
      <AnimatePresence>
        {selectedFoods.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedFoods.length}
            onBulkUpdate={handleBulkUpdate}
            onOpenBulkDelete={() => setBulkDeleteTarget(true)}
            onCancel={() => setSelectedFoods([])}
          />
        )}
      </AnimatePresence>

      {/* Food Create/Edit Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modals */}
      <FoodDeleteModals
        deleteTarget={deleteTarget}
        onCloseDelete={() => setDeleteTarget(null)}
        onConfirmDelete={handleDelete}
        bulkDeleteTarget={bulkDeleteTarget}
        selectedCount={selectedFoods.length}
        onCloseBulkDelete={() => setBulkDeleteTarget(false)}
        onConfirmBulkDelete={handleBulkDelete}
      />

      {/* Centralized Food Detail Modal */}
      <FoodDetailModal
        food={viewingFood}
        isOpen={Boolean(viewingFood)}
        onClose={() => setViewingFood(null)}
        onEdit={(food) => {
          setViewingFood(null);
          handleOpenEdit(food);
        }}
        onDelete={(food) => {
          setViewingFood(null);
          setDeleteTarget(food);
        }}
        onToggleAvailability={handleToggleAvailability}
      />
    </motion.div>
  );
};

export default FoodsPage;
