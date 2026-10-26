import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiArrowRight,
  FiClock,
  FiTruck,
  FiShoppingBag,
  FiCheckCircle
} from 'react-icons/fi';

const LiveOperationsPulse = ({
  activeOrdersCount = 0,
  kitchenOrdersCount = 0,
  outForDeliveryCount = 0,
  pendingOrdersCount = 0,
  isDispatchPage = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 sm:p-6 border border-slate-800 shadow-md">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left: Live Beacon & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-2xs font-extrabold uppercase tracking-widest text-emerald-400">
              Live Operations Radar Active
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-2xs text-slate-400">WebSocket Real-Time Sync</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Order Fulfillment & Fleet Pulse
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time kitchen queues, driver assignments, and active delivery pipelines.
          </p>
        </div>

        {/* Center: Real-time Metric Micro-Counters */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 sm:gap-4 shrink-0">
          {/* Pending */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
            <span className="text-2xs text-slate-400 block font-medium">Pending</span>
            <span className="text-sm sm:text-base font-bold text-amber-400 tabular-nums">
              {pendingOrdersCount} orders
            </span>
          </div>

          {/* In Kitchen */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
            <span className="text-2xs text-slate-400 block font-medium">In Kitchen</span>
            <span className="text-sm sm:text-base font-bold text-primary-400 tabular-nums">
              {kitchenOrdersCount} preparing
            </span>
          </div>

          {/* On Road */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
            <span className="text-2xs text-slate-400 block font-medium">On Road</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
              {outForDeliveryCount} in transit
            </span>
          </div>
        </div>

        {/* Right: CTA to toggle between dispatch and executive views */}
        <div className="shrink-0 self-start lg:self-center">
          {!isDispatchPage ? (
            <button
              type="button"
              onClick={() => navigate('/admin/dispatch')}
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs transition-all shadow-md shadow-primary-900/30 flex items-center gap-2 group cursor-pointer"
            >
              <FiActivity className="w-4 h-4 text-primary-200" />
              <span>Open Dispatch Center</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>View Executive Dashboard</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveOperationsPulse;
