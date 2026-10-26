import React from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const IngredientsTab = ({
  formData,
  setFormData,
  newIngredient,
  setNewIngredient,
  addIngredient,
  removeIngredient,
  newAllergen,
  setNewAllergen,
  addAllergen,
  removeAllergen
}) => {
  return (
    <motion.div
      key="ingredients"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Ingredients List */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Ingredients
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.ingredients?.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => removeIngredient(ingredient)}
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
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
            placeholder="Add ingredient (e.g. Mozzarella)..."
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm"
          />
          <button
            type="button"
            onClick={addIngredient}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Allergens */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Allergens
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.allergens?.map((allergen, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium"
            >
              ⚠️ {allergen}
              <button
                type="button"
                onClick={() => removeAllergen(allergen)}
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
            value={newAllergen}
            onChange={(e) => setNewAllergen(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
            placeholder="Add allergen (e.g. Peanuts, Gluten)..."
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm"
          />
          <button
            type="button"
            onClick={addAllergen}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default IngredientsTab;
