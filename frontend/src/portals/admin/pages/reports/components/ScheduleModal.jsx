import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScheduleModal = ({
  showScheduleModal,
  setShowScheduleModal,
  newSchedule,
  setNewSchedule,
  handleScheduleReport,
  cardVariants
}) => {
  return (
    <AnimatePresence>
      {showScheduleModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowScheduleModal(false)}
        >
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Schedule Report
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="e.g., Daily Sales Report"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Format
                  </label>
                  <select
                    value={newSchedule.format}
                    onChange={(e) => setNewSchedule({ ...newSchedule, format: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Recipients (comma separated)
                </label>
                <input
                  type="text"
                  value={newSchedule.recipients?.join(', ')}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      recipients: e.target.value.split(',').map((email) => email.trim())
                    })
                  }
                  placeholder="admin@example.com, manager@example.com"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScheduleReport}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                Schedule
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScheduleModal;
