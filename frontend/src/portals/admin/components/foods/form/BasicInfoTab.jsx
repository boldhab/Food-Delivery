import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiDollarSign, FiClock } from 'react-icons/fi';

const BasicInfoTab = ({
  formData,
  setFormData,
  errors,
  touched,
  setTouched,
  categories,
  cuisines
}) => {
  return (
    <motion.div
      key="basic"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Food Name */}
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
          className={`w-full px-4 py-3 rounded-xl border transition-colors duration-200 ${
            touched.name && errors.name
              ? 'border-red-500 focus:ring-red-200'
              : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'
          } dark:bg-slate-900 dark:text-white`}
        />
        {touched.name && errors.name && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle className="w-3 h-3" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Description */}
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
          className={`w-full px-4 py-3 rounded-xl border transition-colors duration-200 ${
            touched.description && errors.description
              ? 'border-red-500 focus:ring-red-200'
              : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'
          } dark:bg-slate-900 dark:text-white`}
        />
        {touched.description && errors.description && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle className="w-3 h-3" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Price & Discount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div id="field-price">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Price (ETB) *
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
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors duration-200 ${
                touched.price && errors.price
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'
              } dark:bg-slate-900 dark:text-white`}
            />
          </div>
          {touched.price && errors.price && (
            <p className="mt-1 text-xs text-red-500">{errors.price}</p>
          )}
        </div>

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
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Category & Cuisine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div id="field-category">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            onBlur={() => setTouched((prev) => ({ ...prev, category: true }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-primary-500 transition-colors"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {touched.category && errors.category && (
            <p className="mt-1 text-xs text-red-500">{errors.category}</p>
          )}
        </div>

        <div id="field-cuisine">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Cuisine
          </label>
          <select
            value={formData.cuisine}
            onChange={(e) => setFormData((prev) => ({ ...prev, cuisine: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-primary-500 transition-colors"
          >
            <option value="">Select Cuisine</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preparation Time */}
      <div id="field-prep-time">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Preparation Time (minutes)
        </label>
        <div className="relative">
          <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="number"
            min="1"
            value={formData.preparationTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, preparationTime: parseInt(e.target.value) || 15 }))}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-primary-500 transition-colors"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default BasicInfoTab;
