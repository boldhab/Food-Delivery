import React from 'react';
import { motion } from 'framer-motion';

const NutritionTab = ({ formData, setFormData }) => {
  const updateNutrient = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        [field]: val
      }
    }));
  };

  return (
    <motion.div
      key="nutrition"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <p className="text-sm text-slate-500">
        Provide nutritional content per standard serving size.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Calories (kcal)
          </label>
          <input
            type="number"
            min="0"
            value={formData.nutritionalInfo?.calories || ''}
            onChange={(e) => updateNutrient('calories', parseInt(e.target.value) || 0)}
            placeholder="e.g., 450"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Protein (g)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.nutritionalInfo?.protein || ''}
            onChange={(e) => updateNutrient('protein', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 25"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Carbohydrates (g)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.nutritionalInfo?.carbs || ''}
            onChange={(e) => updateNutrient('carbs', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 50"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Total Fat (g)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.nutritionalInfo?.fat || ''}
            onChange={(e) => updateNutrient('fat', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 15"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Dietary Fiber (g)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.nutritionalInfo?.fiber || ''}
            onChange={(e) => updateNutrient('fiber', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 4"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default NutritionTab;
