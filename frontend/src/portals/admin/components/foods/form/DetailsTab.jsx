import React from 'react';
import { motion } from 'framer-motion';
import {
  FiAperture,
  FiHeart,
  FiAlertTriangle,
  FiZap,
  FiStar,
  FiX
} from 'react-icons/fi';

const DetailsTab = ({
  formData,
  setFormData,
  newTag,
  setNewTag,
  addTag,
  removeTag
}) => {
  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Dietary Flags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Dietary Preferences & Badges
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={formData.isVegetarian}
              onChange={(e) => setFormData((prev) => ({ ...prev, isVegetarian: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded accent-orange-500"
            />
            <FiAperture className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Vegetarian</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={formData.isVegan}
              onChange={(e) => setFormData((prev) => ({ ...prev, isVegan: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded accent-orange-500"
            />
            <FiHeart className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium">Vegan</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={formData.isGlutenFree}
              onChange={(e) => setFormData((prev) => ({ ...prev, isGlutenFree: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded accent-orange-500"
            />
            <FiAlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Gluten Free</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={formData.isSpicy}
              onChange={(e) => setFormData((prev) => ({ ...prev, isSpicy: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded accent-orange-500"
            />
            <FiZap className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Spicy</span>
          </label>
        </div>
      </div>

      {/* Visibility, Availability, and Highlights */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Status & Highlights
        </label>
        <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.available !== false}
              onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded accent-orange-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Currently Available
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPopular: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded accent-orange-500"
            />
            <span className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              <FiStar className="w-4 h-4 text-yellow-500" />
              Popular Item
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded accent-orange-500"
            />
            <span className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              <FiStar className="w-4 h-4 text-amber-500" />
              Featured On Home
            </span>
          </label>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Search Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-500 ml-1"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag (e.g. cheesy, crispy)..."
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-primary-500 transition-colors text-sm"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm"
          >
            Add Tag
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailsTab;
