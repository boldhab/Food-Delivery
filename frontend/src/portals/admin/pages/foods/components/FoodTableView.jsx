import React from 'react';
import {
  FiStar,
  FiClock,
  FiPackage,
  FiImage,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import StatusBadge from '../../../components/common/StatusBadge';
import FoodActionMenu from './FoodActionMenu';
import { formatCurrency } from '../../../utils/adminHelpers';
import { DataTablePagination } from '../../../components/common/table/DataTablePagination';

const FoodTableView = ({
  foods = [],
  loading = false,
  selectedFoods = [],
  onSelectFood,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onToggleAvailability,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSort,
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange
}) => {
  const allIds = foods.map((f) => f._id || f.id);
  const isAllSelected = foods.length > 0 && foods.every((f) => selectedFoods.includes(f._id || f.id));
  const someSelected = selectedFoods.length > 0;

  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'orderCount', label: 'Orders' },
    { key: 'preparationTime', label: 'Prep Time' },
    { key: 'createdAt', label: 'Date Added' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* List Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-3">
          {onSelectAll && (
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium select-none hover:text-slate-900 dark:hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span>Select all on this page</span>
            </label>
          )}

          {someSelected && (
            <span className="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold px-2 py-0.5 rounded-full text-2xs">
              {selectedFoods.length} selected
            </span>
          )}

          <span className="text-slate-400">•</span>
          <span className="text-slate-500 tabular-nums">
            {totalItems || foods.length} food items
          </span>
        </div>

        {/* Sort Controls */}
        {onSort && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSort(e.target.value, sortOrder)}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={`Sort direction: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'asc' ? (
                <FiArrowUp className="w-3.5 h-3.5" />
              ) : (
                <FiArrowDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Skeleton, Empty, or Row List */}
      {loading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 animate-pulse flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1 max-w-sm">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            </div>
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FiImage className="w-6 h-6" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">
            No food items found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your filters, categories, or search terms.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {foods.map((food) => {
            const foodId = food._id || food.id;
            const isSelected = selectedFoods.includes(foodId);
            const isAvailable = food.available ?? food.isAvailable;
            const price = Number(food.price || 0);
            const discount = Number(food.discount || 0);
            const rating = Number(food.rating || 0);
            const totalReviews = food.totalReviews ?? food.numReviews ?? 0;
            const orderCount = food.stats?.orderCount ?? food.orderCount ?? 0;
            const prepTime = Number(food.preparationTime || 15);

            return (
              <div
                key={foodId}
                onClick={() => onView?.(food)}
                className={`group flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 shadow-xs'
                    : 'border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-850 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs'
                }`}
              >
                {/* Left section: Checkbox, Food Image & Core Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {onSelectFood && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectFood(foodId)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                    title={food.name}
                  >
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FiImage className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Name, Category, & Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm truncate">
                        {food.name}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-2xs font-medium">
                        {food.category || 'General'}
                      </span>
                      {food.cuisine && (
                        <span className="text-2xs text-slate-400 dark:text-slate-500">
                          {food.cuisine}
                        </span>
                      )}
                      {food.isVegetarian && (
                        <span className="text-2xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                          Veg
                        </span>
                      )}
                      {food.isSpicy && (
                        <span className="text-2xs bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 rounded font-medium">
                          🌶️ Spicy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-2xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <p className="truncate max-w-xs sm:max-w-md">
                        {food.description || 'No description provided'}
                      </p>
                      <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                      <span className="hidden sm:inline-flex items-center gap-1">
                        <FiClock className="w-3 h-3 text-slate-400" />
                        {prepTime} min prep
                      </span>
                      <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                      <span className="hidden sm:inline-flex items-center gap-1">
                        <FiPackage className="w-3 h-3 text-slate-400" />
                        {orderCount.toLocaleString()} orders
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right section: Price, Rating, Stock Toggle & Action Buttons */}
                <div
                  className="flex items-center justify-between md:justify-end gap-3.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Rating */}
                  <div className="flex items-center gap-1 min-w-[60px]" title={`${rating.toFixed(1)} rating (${totalReviews} reviews)`}>
                    <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs tabular-nums">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-2xs text-slate-400 tabular-nums">
                      ({totalReviews})
                    </span>
                  </div>

                  {/* Price & Discount */}
                  <div className="text-right min-w-[75px]">
                    <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums block">
                      {formatCurrency(price)}
                    </span>
                    {discount > 0 && (
                      <span className="text-2xs font-semibold tabular-nums text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1 py-0.2 rounded inline-block">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Availability Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => onToggleAvailability?.(food)}
                    className="transition-transform active:scale-95 cursor-pointer"
                    title="Click to toggle availability"
                  >
                    <StatusBadge
                      status={isAvailable}
                      type="food"
                      variant="pill"
                      showIcon
                    />
                  </button>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(food)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View details"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(food)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Edit food"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(food)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete food"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <FoodActionMenu
                      food={food}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleAvailability={onToggleAvailability}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            selectedCount={selectedFoods.length}
          />
        </div>
      )}
    </div>
  );
};

export default FoodTableView;
