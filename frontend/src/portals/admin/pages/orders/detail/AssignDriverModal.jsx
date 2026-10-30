import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTruck, FiRefreshCw } from 'react-icons/fi';

const AssignDriverModal = ({
  showDriverModal,
  setShowDriverModal,
  availableDrivers,
  selectedDriver,
  setSelectedDriver,
  handleAssignDriver,
  loadingDrivers
}) => {
  return (
    <AnimatePresence>
      {showDriverModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDriverModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)]">
                <FiTruck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Assign Delivery Driver
                </h3>
                <p className="text-xs text-slate-500">
                  Select an available driver to deliver this order
                </p>
              </div>
            </div>

            {loadingDrivers ? (
              <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2">
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading available drivers...</span>
              </div>
            ) : availableDrivers.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No active delivery drivers found online.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-1">
                {availableDrivers.map((driver) => (
                  <label
                    key={driver.id || driver._id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedDriver === (driver.id || driver._id)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="driver"
                        checked={selectedDriver === (driver.id || driver._id)}
                        onChange={() => setSelectedDriver(driver.id || driver._id)}
                        className="w-4 h-4 text-primary-600 accent-orange-500"
                      />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                          {driver.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {driver.driverProfile?.vehicleType || 'Vehicle'} • {driver.phone}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowDriverModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDriver}
                onClick={handleAssignDriver}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                Assign
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignDriverModal;
