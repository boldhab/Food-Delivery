import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiInfo,
  FiPackage,
  FiHeart,
  FiList,
  FiImage,
  FiTrash2,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi';

// Form Subcomponents
import BasicInfoTab from './form/BasicInfoTab';
import DetailsTab from './form/DetailsTab';
import NutritionTab from './form/NutritionTab';
import IngredientsTab from './form/IngredientsTab';
import MediaTab from './form/MediaTab';
import DeleteConfirmModal from './form/DeleteConfirmModal';

const FoodForm = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  mode = 'create',
  categories = ['Burger', 'Pizza', 'Sushi', 'Desserts', 'Beverages', 'Salads', 'Fast Food'],
  cuisines = ['Italian', 'American', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai'],
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    cuisine: '',
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
    typeof initialData?.image === 'string' ? initialData.image : null
  );
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [newIngredient, setNewIngredient] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const isAvail = initialData.isAvailable ?? initialData.available ?? true;
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        available: isAvail,
        isAvailable: isAvail
      }));
      if (initialData.image && typeof initialData.image === 'string') {
        setImagePreview(initialData.image);
      }
      if (initialData.images) {
        setImagePreviews(initialData.images.filter((img) => typeof img === 'string'));
      }
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Food name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Food name must be at least 3 characters';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), file]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients?.includes(newIngredient.trim())) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((i) => i !== ingredient)
    }));
  };

  const addAllergen = () => {
    if (newAllergen.trim() && !formData.allergens?.includes(newAllergen.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergens: [...(prev.allergens || []), newAllergen.trim()]
      }));
      setNewAllergen('');
    }
  };

  const removeAllergen = (allergen) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens?.filter((a) => a !== allergen)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag)
    }));
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FiInfo },
    { id: 'details', label: 'Details & Flags', icon: FiPackage },
    { id: 'nutrition', label: 'Nutrition', icon: FiHeart },
    { id: 'ingredients', label: 'Ingredients', icon: FiList },
    { id: 'media', label: 'Photos', icon: FiImage }
  ];

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {mode === 'edit' ? 'Edit Menu Item' : 'Create New Menu Item'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Fill in the details below to publish to the customer storefront
          </p>
        </div>

        {mode === 'edit' && onDelete && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-9 px-3.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete Item</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <div className="flex px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <BasicInfoTab
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                touched={touched}
                setTouched={setTouched}
                categories={categories}
                cuisines={cuisines}
              />
            )}

            {activeTab === 'details' && (
              <DetailsTab
                formData={formData}
                setFormData={setFormData}
                newTag={newTag}
                setNewTag={setNewTag}
                addTag={addTag}
                removeTag={removeTag}
              />
            )}

            {activeTab === 'nutrition' && (
              <NutritionTab
                formData={formData}
                setFormData={setFormData}
              />
            )}

            {activeTab === 'ingredients' && (
              <IngredientsTab
                formData={formData}
                setFormData={setFormData}
                newIngredient={newIngredient}
                setNewIngredient={setNewIngredient}
                addIngredient={addIngredient}
                removeIngredient={removeIngredient}
                newAllergen={newAllergen}
                setNewAllergen={setNewAllergen}
                addAllergen={addAllergen}
                removeAllergen={removeAllergen}
              />
            )}

            {activeTab === 'media' && (
              <MediaTab
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setFormData={setFormData}
                imagePreviews={imagePreviews}
                handleImageUpload={handleImageUpload}
                handleMultipleImageUpload={handleMultipleImageUpload}
                removeImage={removeImage}
                fileInputRef={fileInputRef}
                errors={errors}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Actions Footer */}
        <div className="p-6 border-t border-border bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-5 border border-border text-foreground rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-9 px-5 bg-primary hover:bg-primary-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span>{mode === 'edit' ? 'Update Menu Item' : 'Save Item'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onDelete={onDelete}
      />
    </div>
  );
};

export default FoodForm;
