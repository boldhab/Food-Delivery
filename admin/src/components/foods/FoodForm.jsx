import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiX,
  FiPlus,
  FiDollarSign,
  FiClock,
  FiList,
  FiImage,
  FiInfo,
  FiAlertCircle,
  FiStar,
  FiHeart,
  FiZap,
  FiAperture,
  FiAlertTriangle,
  FiPackage,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiRefreshCw
} from "react-icons/fi";
const FoodForm = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  mode = "create",
  categories = ["Appetizer", "Main Course", "Dessert", "Beverage", "Side"],
  cuisines = ["Italian", "Chinese", "Indian", "Mexican", "Japanese", "Thai", "American", "Mediterranean"],
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    cuisine: "",
    image: null,
    images: [],
    preparationTime: 15,
    calories: 0,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: false,
    isFeatured: false,
    discount: 0,
    available: true,
    maxQuantity: 10,
    ingredients: [],
    allergens: [],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    },
    customizations: [],
    tags: [],
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imagePreview, setImagePreview] = useState(
    typeof initialData?.image === "string" ? initialData.image : null
  );
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [newIngredient, setNewIngredient] = useState("");
  const [newAllergen, setNewAllergen] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.image && typeof initialData.image === "string") {
        setImagePreview(initialData.image);
      }
      if (initialData.images) {
        setImagePreviews(initialData.images.filter((img) => typeof img === "string"));
      }
    }
  }, [initialData]);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Food name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Food name must be at least 3 characters";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.cuisine) {
      newErrors.cuisine = "Cuisine is required";
    }
    if (!formData.preparationTime || formData.preparationTime < 5) {
      newErrors.preparationTime = "Preparation time must be at least 5 minutes";
    }
    if (formData.discount && (formData.discount < 0 || formData.discount > 100)) {
      newErrors.discount = "Discount must be between 0 and 100";
    }
    if (formData.calories && formData.calories < 0) {
      newErrors.calories = "Calories must be positive";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.getElementById(`field-${firstError}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSubmit(formData);
  };
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image size must be less than 5MB" }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "File must be an image" }));
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };
  const handleMultipleImageUpload = (e) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = [];
    const newPreviews = [];
    Array.from(files).forEach((file) => {
      if (file.size <= 5 * 1024 * 1024 && file.type.startsWith("image/")) {
        newImages.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images || [], ...newImages]
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients.includes(newIngredient.trim())) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }));
      setNewIngredient("");
    }
  };
  const removeIngredient = (ingredient) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i !== ingredient)
    }));
  };
  const addAllergen = () => {
    if (newAllergen.trim() && !formData.allergens.includes(newAllergen.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergens: [...prev.allergens, newAllergen.trim()]
      }));
      setNewAllergen("");
    }
  };
  const removeAllergen = (allergen) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.filter((a) => a !== allergen)
    }));
  };
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };
  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag)
    }));
  };
  const tabs = [
    { id: "basic", label: "Basic Info", icon: FiInfo },
    { id: "details", label: "Details", icon: FiPackage },
    { id: "nutrition", label: "Nutrition", icon: FiHeart },
    { id: "ingredients", label: "Ingredients", icon: FiList },
    { id: "customizations", label: "Customizations", icon: FiEdit2 },
    { id: "media", label: "Media", icon: FiImage }
  ];
  if (mode === "view") {
    return <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Food Details
                </h2>
                <div className="space-y-4">
                    {
      /* View mode content */
    }
                    <p className="text-slate-600 dark:text-slate-400">View mode implementation</p>
                </div>
            </div>;
  }
  return <form
    ref={formRef}
    onSubmit={handleSubmit}
    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
  >
            {
    /* Header */
  }
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {mode === "create" ? "Add New Food Item" : "Edit Food Item"}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {mode === "create" ? "Fill in the details to add a new food item to your menu" : "Update the food item details"}
                        </p>
                    </div>
                    
                    {mode === "edit" && onDelete && <button
    type="button"
    onClick={() => setShowDeleteConfirm(true)}
    className="px-4 py-2 text-red-600 border border-red-200
                                     dark:border-red-800 rounded-lg hover:bg-red-50
                                     dark:hover:bg-red-900/20 transition-colors
                                     flex items-center gap-2"
  >
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                        </button>}
                </div>

                {
    /* Error display */
  }
                <AnimatePresence>
                    {error && <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="mt-4 p-3 bg-red-50 dark:bg-red-900/20
                                     border border-red-200 dark:border-red-800
                                     rounded-lg flex items-center gap-2"
  >
                            <FiAlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-red-700 dark:text-red-300">
                                {error}
                            </span>
                        </motion.div>}
                </AnimatePresence>
            </div>

            {
    /* Tabs */
  }
            <div className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex overflow-x-auto px-6">
                    {tabs.map((tab) => <button
    key={tab.id}
    type="button"
    onClick={() => setActiveTab(tab.id)}
    className={`
                                px-4 py-3 font-medium text-sm border-b-2
                                transition-colors duration-200
                                flex items-center gap-2 whitespace-nowrap
                                ${activeTab === tab.id ? "border-orange-500 text-orange-500" : "border-transparent text-slate-500 hover:text-slate-700"}
                            `}
  >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>)}
                </div>
            </div>

            {
    /* Form Content */
  }
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {
    /* Basic Info Tab */
  }
                    {activeTab === "basic" && <motion.div
    key="basic"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
                            {
    /* Name */
  }
                            <div id="field-name">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Food Name *
                                </label>
                                <input
    type="text"
    value={formData.name}
    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
    placeholder="e.g., Margherita Pizza"
    className={`
                                        w-full px-4 py-3 rounded-xl border
                                        transition-colors duration-200
                                        ${touched.name && errors.name ? "border-red-500 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:border-orange-500"}
                                        dark:bg-slate-900 dark:text-white
                                    `}
  />
                                {touched.name && errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <FiAlertCircle className="w-3 h-3" />
                                        {errors.name}
                                    </p>}
                            </div>

                            {
    /* Description */
  }
                            <div id="field-description">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Description *
                                </label>
                                <textarea
    value={formData.description}
    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
    onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
    placeholder="Describe the food item..."
    rows={4}
    className={`
                                        w-full px-4 py-3 rounded-xl border
                                        transition-colors duration-200
                                        ${touched.description && errors.description ? "border-red-500 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:border-orange-500"}
                                        dark:bg-slate-900 dark:text-white
                                    `}
  />
                                {touched.description && errors.description && <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <FiAlertCircle className="w-3 h-3" />
                                        {errors.description}
                                    </p>}
                            </div>

                            {
    /* Price and Category Row */
  }
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {
    /* Price */
  }
                                <div id="field-price">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Price ($) *
                                    </label>
                                    <div className="relative">
                                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
    type="number"
    step="0.01"
    min="0"
    value={formData.price}
    onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
    onBlur={() => setTouched((prev) => ({ ...prev, price: true }))}
    className={`
                                                w-full pl-10 pr-4 py-3 rounded-xl border
                                                transition-colors duration-200
                                                ${touched.price && errors.price ? "border-red-500 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:border-orange-500"}
                                                dark:bg-slate-900 dark:text-white
                                            `}
  />
                                    </div>
                                    {touched.price && errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                </div>

                                {
    /* Discount */
  }
                                <div id="field-discount">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Discount (%)
                                    </label>
                                    <input
    type="number"
    min="0"
    max="100"
    value={formData.discount}
    onChange={(e) => setFormData((prev) => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
    className="w-full px-4 py-3 rounded-xl border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white
                                                 focus:border-orange-500 transition-colors"
  />
                                </div>
                            </div>

                            {
    /* Category and Cuisine Row */
  }
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {
    /* Category */
  }
                                <div id="field-category">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Category *
                                    </label>
                                    <select
    value={formData.category}
    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
    onBlur={() => setTouched((prev) => ({ ...prev, category: true }))}
    className={`
                                            w-full px-4 py-3 rounded-xl border
                                            transition-colors duration-200
                                            ${touched.category && errors.category ? "border-red-500 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:border-orange-500"}
                                            dark:bg-slate-900 dark:text-white
                                        `}
  >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    {touched.category && errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                                </div>

                                {
    /* Cuisine */
  }
                                <div id="field-cuisine">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Cuisine *
                                    </label>
                                    <select
    value={formData.cuisine}
    onChange={(e) => setFormData((prev) => ({ ...prev, cuisine: e.target.value }))}
    onBlur={() => setTouched((prev) => ({ ...prev, cuisine: true }))}
    className={`
                                            w-full px-4 py-3 rounded-xl border
                                            transition-colors duration-200
                                            ${touched.cuisine && errors.cuisine ? "border-red-500 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:border-orange-500"}
                                            dark:bg-slate-900 dark:text-white
                                        `}
  >
                                        <option value="">Select cuisine</option>
                                        {cuisines.map((cuisine) => <option key={cuisine} value={cuisine}>{cuisine}</option>)}
                                    </select>
                                    {touched.cuisine && errors.cuisine && <p className="mt-1 text-xs text-red-500">{errors.cuisine}</p>}
                                </div>
                            </div>

                            {
    /* Preparation Time */
  }
                            <div id="field-preparationTime">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Preparation Time (minutes) *
                                </label>
                                <div className="relative">
                                    <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
    type="number"
    min="5"
    value={formData.preparationTime}
    onChange={(e) => setFormData((prev) => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
    onBlur={() => setTouched((prev) => ({ ...prev, preparationTime: true }))}
    className={`
                                            w-full pl-10 pr-4 py-3 rounded-xl border
                                            transition-colors duration-200
                                            ${touched.preparationTime && errors.preparationTime ? "border-red-500 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:border-orange-500"}
                                            dark:bg-slate-900 dark:text-white
                                        `}
  />
                                </div>
                                {touched.preparationTime && errors.preparationTime && <p className="mt-1 text-xs text-red-500">{errors.preparationTime}</p>}
                            </div>

                            {
    /* Availability */
  }
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
    type="checkbox"
    checked={formData.available}
    onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
    className="w-4 h-4 text-orange-500 border-slate-300 rounded
                                                 focus:ring-orange-500"
  />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Available for ordering
                                    </span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
    type="number"
    min="1"
    value={formData.maxQuantity}
    onChange={(e) => setFormData((prev) => ({ ...prev, maxQuantity: parseInt(e.target.value) || 1 }))}
    className="w-20 px-2 py-1 border border-slate-200 dark:border-slate-700
                                                 rounded-lg dark:bg-slate-900 dark:text-white"
  />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Max per order
                                    </span>
                                </label>
                            </div>
                        </motion.div>}

                    {
    /* Details Tab */
  }
                    {activeTab === "details" && <motion.div
    key="details"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
                            {
    /* Dietary flags */
  }
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <label className="flex items-center gap-3 p-3 border border-slate-200
                                                dark:border-slate-700 rounded-lg cursor-pointer
                                                hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <input
    type="checkbox"
    checked={formData.isVegetarian}
    onChange={(e) => setFormData((prev) => ({ ...prev, isVegetarian: e.target.checked }))}
    className="w-4 h-4 text-orange-500"
  />
                                    <FiAperture className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">Vegetarian</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-slate-200
                                                dark:border-slate-700 rounded-lg cursor-pointer
                                                hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <input
    type="checkbox"
    checked={formData.isVegan}
    onChange={(e) => setFormData((prev) => ({ ...prev, isVegan: e.target.checked }))}
    className="w-4 h-4 text-orange-500"
  />
                                    <FiHeart className="w-4 h-4 text-green-600" />
                                    <span className="text-sm">Vegan</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-slate-200
                                                dark:border-slate-700 rounded-lg cursor-pointer
                                                hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <input
    type="checkbox"
    checked={formData.isGlutenFree}
    onChange={(e) => setFormData((prev) => ({ ...prev, isGlutenFree: e.target.checked }))}
    className="w-4 h-4 text-orange-500"
  />
                                    <FiAlertTriangle className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm">Gluten Free</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-slate-200
                                                dark:border-slate-700 rounded-lg cursor-pointer
                                                hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <input
    type="checkbox"
    checked={formData.isSpicy}
    onChange={(e) => setFormData((prev) => ({ ...prev, isSpicy: e.target.checked }))}
    className="w-4 h-4 text-orange-500"
  />
                                    <FiZap className="w-4 h-4 text-red-500" />
                                    <span className="text-sm">Spicy</span>
                                </label>
                            </div>

                            {
    /* Popular and Featured */
  }
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
    type="checkbox"
    checked={formData.isPopular}
    onChange={(e) => setFormData((prev) => ({ ...prev, isPopular: e.target.checked }))}
    className="w-4 h-4 text-orange-500 border-slate-300 rounded"
  />
                                    <span className="flex items-center gap-1">
                                        <FiStar className="w-4 h-4 text-yellow-500" />
                                        Popular Item
                                    </span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
    type="checkbox"
    checked={formData.isFeatured}
    onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
    className="w-4 h-4 text-orange-500 border-slate-300 rounded"
  />
                                    <span className="flex items-center gap-1">
                                        <FiStar className="w-4 h-4 text-purple-500" />
                                        Featured
                                    </span>
                                </label>
                            </div>

                            {
    /* Tags */
  }
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.tags.map((tag, index) => <span
    key={index}
    className="inline-flex items-center gap-1 px-3 py-1
                                                     bg-slate-100 dark:bg-slate-700
                                                     text-slate-700 dark:text-slate-300
                                                     rounded-full text-sm"
  >
                                            {tag}
                                            <button
    type="button"
    onClick={() => removeTag(tag)}
    className="hover:text-red-500"
  >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>)}
                                </div>
                                <div className="flex gap-2">
                                    <input
    type="text"
    value={newTag}
    onChange={(e) => setNewTag(e.target.value)}
    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
    placeholder="Add a tag..."
    className="flex-1 px-4 py-2 rounded-lg border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white
                                                 focus:border-orange-500 transition-colors"
  />
                                    <button
    type="button"
    onClick={addTag}
    className="px-4 py-2 bg-orange-500 text-white rounded-lg
                                                 hover:bg-orange-600 transition-colors"
  >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </motion.div>}

                    {
    /* Nutrition Tab */
  }
                    {activeTab === "nutrition" && <motion.div
    key="nutrition"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Calories
                                    </label>
                                    <input
    type="number"
    value={formData.nutritionalInfo?.calories || ""}
    onChange={(e) => setFormData((prev) => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        calories: parseInt(e.target.value) || 0
      }
    }))}
    className="w-full px-4 py-2 rounded-lg border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
  />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Protein (g)
                                    </label>
                                    <input
    type="number"
    value={formData.nutritionalInfo?.protein || ""}
    onChange={(e) => setFormData((prev) => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        protein: parseFloat(e.target.value) || 0
      }
    }))}
    className="w-full px-4 py-2 rounded-lg border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
  />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Carbs (g)
                                    </label>
                                    <input
    type="number"
    value={formData.nutritionalInfo?.carbs || ""}
    onChange={(e) => setFormData((prev) => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        carbs: parseFloat(e.target.value) || 0
      }
    }))}
    className="w-full px-4 py-2 rounded-lg border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
  />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Fat (g)
                                    </label>
                                    <input
    type="number"
    value={formData.nutritionalInfo?.fat || ""}
    onChange={(e) => setFormData((prev) => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        fat: parseFloat(e.target.value) || 0
      }
    }))}
    className="w-full px-4 py-2 rounded-lg border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
  />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Fiber (g)
                                    </label>
                                    <input
    type="number"
    value={formData.nutritionalInfo?.fiber || ""}
    onChange={(e) => setFormData((prev) => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        fiber: parseFloat(e.target.value) || 0
      }
    }))}
    className="w-full px-4 py-2 rounded-lg border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
  />
                                </div>
                            </div>
                        </motion.div>}

                    {
    /* Ingredients & Allergens Tab */
  }
                    {activeTab === "ingredients" && <motion.div
    key="ingredients"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
                            {
    /* Ingredients */
  }
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Ingredients
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.ingredients.map((ingredient, index) => <span
    key={index}
    className="inline-flex items-center gap-1 px-3 py-1
                                                     bg-green-100 dark:bg-green-900/30
                                                     text-green-700 dark:text-green-400
                                                     rounded-full text-sm"
  >
                                            {ingredient}
                                            <button
    type="button"
    onClick={() => removeIngredient(ingredient)}
    className="hover:text-red-500"
  >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>)}
                                </div>
                                <div className="flex gap-2">
                                    <input
    type="text"
    value={newIngredient}
    onChange={(e) => setNewIngredient(e.target.value)}
    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
    placeholder="Add ingredient..."
    className="flex-1 px-4 py-2 rounded-lg border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
  />
                                    <button
    type="button"
    onClick={addIngredient}
    className="px-4 py-2 bg-orange-500 text-white rounded-lg
                                                 hover:bg-orange-600 transition-colors"
  >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {
    /* Allergens */
  }
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Allergens
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.allergens.map((allergen, index) => <span
    key={index}
    className="inline-flex items-center gap-1 px-3 py-1
                                                     bg-red-100 dark:bg-red-900/30
                                                     text-red-700 dark:text-red-400
                                                     rounded-full text-sm"
  >
                                            {allergen}
                                            <button
    type="button"
    onClick={() => removeAllergen(allergen)}
    className="hover:text-red-700"
  >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>)}
                                </div>
                                <div className="flex gap-2">
                                    <input
    type="text"
    value={newAllergen}
    onChange={(e) => setNewAllergen(e.target.value)}
    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergen())}
    placeholder="Add allergen..."
    className="flex-1 px-4 py-2 rounded-lg border border-slate-200
                                                 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
  />
                                    <button
    type="button"
    onClick={addAllergen}
    className="px-4 py-2 bg-orange-500 text-white rounded-lg
                                                 hover:bg-orange-600 transition-colors"
  >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </motion.div>}

                    {
    /* Media Tab */
  }
                    {activeTab === "media" && <motion.div
    key="media"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
                            {
    /* Main Image */
  }
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Main Image
                                </label>
                                <div
    onClick={() => fileInputRef.current?.click()}
    className={`
                                        border-2 border-dashed rounded-xl p-6
                                        text-center cursor-pointer transition-colors
                                        ${imagePreview ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-slate-300 dark:border-slate-600 hover:border-orange-500"}
                                    `}
  >
                                    {imagePreview ? <div className="relative">
                                            <img
    src={imagePreview}
    alt="Preview"
    className="max-h-48 mx-auto rounded-lg"
  />
                                            <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, image: null }));
    }}
    className="absolute top-2 right-2 p-1 bg-red-500
                                                         text-white rounded-full hover:bg-red-600"
  >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </div> : <div>
                                            <FiUpload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Click to upload main image
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                PNG, JPG up to 5MB
                                            </p>
                                        </div>}
                                    <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    className="hidden"
  />
                                </div>
                                {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                            </div>

                            {
    /* Additional Images */
  }
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Additional Images
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {imagePreviews.map((preview, index) => <div key={index} className="relative">
                                            <img
    src={preview}
    alt={`Preview ${index + 1}`}
    className="w-full h-24 object-cover rounded-lg"
  />
                                            <button
    type="button"
    onClick={() => removeImage(index)}
    className="absolute top-1 right-1 p-1 bg-red-500
                                                         text-white rounded-full hover:bg-red-600"
  >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </div>)}
                                    <button
    type="button"
    onClick={() => document.getElementById("multi-image-input")?.click()}
    className="border-2 border-dashed border-slate-300
                                                 dark:border-slate-600 rounded-lg
                                                 h-24 flex items-center justify-center
                                                 hover:border-orange-500 transition-colors"
  >
                                        <FiPlus className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>
                                <input
    id="multi-image-input"
    type="file"
    accept="image/*"
    multiple
    onChange={handleMultipleImageUpload}
    className="hidden"
  />
                            </div>
                        </motion.div>}
                </AnimatePresence>
            </div>

            {
    /* Form Actions */
  }
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-end gap-3">
                    {onCancel && <button
    type="button"
    onClick={onCancel}
    className="px-6 py-3 border border-slate-200 dark:border-slate-700
                                     text-slate-700 dark:text-slate-300 rounded-xl
                                     hover:bg-slate-100 dark:hover:bg-slate-800
                                     transition-colors duration-200"
  >
                            Cancel
                        </button>}
                    
                    <button
    type="submit"
    disabled={loading}
    className="px-6 py-3 bg-orange-500 hover:bg-orange-600
                                 text-white font-medium rounded-xl
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-colors duration-200
                                 flex items-center gap-2"
  >
                        {loading ? <>
                                <FiRefreshCw className="w-5 h-5 animate-spin" />
                                <span>Saving...</span>
                            </> : <>
                                <FiSave className="w-5 h-5" />
                                <span>{mode === "create" ? "Create Food Item" : "Save Changes"}</span>
                            </>}
                    </button>
                </div>
            </div>

            {
    /* Delete Confirmation Modal */
  }
            <AnimatePresence>
                {showDeleteConfirm && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setShowDeleteConfirm(false)}
  >
                        <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md
                                     shadow-xl border border-slate-200 dark:border-slate-700"
    onClick={(e) => e.stopPropagation()}
  >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30
                                              rounded-full flex items-center justify-center
                                              mx-auto mb-4">
                                    <FiAlertTriangle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Delete Food Item
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Are you sure you want to delete this food item? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
    onClick={() => setShowDeleteConfirm(false)}
    className="flex-1 px-4 py-2 border border-slate-200
                                                 dark:border-slate-700 rounded-lg
                                                 hover:bg-slate-50 dark:hover:bg-slate-700
                                                 transition-colors"
  >
                                        Cancel
                                    </button>
                                    <button
    onClick={() => {
      onDelete?.(formData.id);
      setShowDeleteConfirm(false);
    }}
    className="flex-1 px-4 py-2 bg-red-500 text-white
                                                 rounded-lg hover:bg-red-600 transition-colors"
  >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>}
            </AnimatePresence>
        </form>;
};
var stdin_default = FoodForm;
export {
  stdin_default as default
};
