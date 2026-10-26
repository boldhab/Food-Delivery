import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' }
  }),
  hover: {
    y: -3,
    transition: { duration: 0.2 }
  }
};

const DashboardMetricCards = ({ metrics = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {metrics.map((metric, index) => {
        const isPositive = Number(metric.change || 0) >= 0;
        const changeValue = Math.abs(Number(metric.change || 0)).toFixed(1);

        return (
          <motion.div
            key={metric.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-primary-400 dark:hover:border-primary-600 transition-all flex flex-col justify-between"
          >
            {/* Background Accent Wave */}
            <svg
              className="absolute -right-3 -bottom-3 w-32 h-16 opacity-10 pointer-events-none text-current"
              viewBox="0 0 100 40"
              fill="none"
              stroke="currentColor"
            >
              <path
                d={
                  isPositive
                    ? 'M0 35 Q 25 32, 50 18 T 100 5'
                    : 'M0 8 Q 25 15, 50 25 T 100 38'
                }
                strokeWidth="4"
                strokeLinecap="round"
                className={metric.textColor}
              />
            </svg>

            <div>
              {/* Header: Title & Icon */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                  {metric.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    metric.bgColor || 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  <metric.icon className={`w-5 h-5 ${metric.textColor || 'text-primary-600'}`} />
                </div>
              </div>

              {/* Metric Value */}
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white mt-1">
                {metric.value}
              </h3>
            </div>

            {/* Footer: Trend / Subtext */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    <FiArrowUp className="w-3.5 h-3.5" />
                    +{changeValue}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    <FiArrowDown className="w-3.5 h-3.5" />
                    -{changeValue}%
                  </span>
                )}
                <span className="text-2xs text-slate-400 ml-1">vs last period</span>
              </div>

              {metric.subText && (
                <span className="text-2xs font-medium text-slate-500 truncate max-w-[120px]">
                  {metric.subText}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardMetricCards;
