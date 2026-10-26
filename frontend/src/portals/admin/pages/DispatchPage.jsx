import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiActivity, FiZap } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAdminDataContext } from '../context/adminDataContextCore';
import LiveOperationsCenter from './dashboard/components/LiveOperationsCenter';
import LiveOperationsPulse from './dashboard/components/LiveOperationsPulse';

const DispatchPage = () => {
  const navigate = useNavigate();
  const { state } = useAdminDataContext();

  const [rushModeActive, setRushModeActive] = useState(() => {
    return localStorage.getItem('admin_rush_mode') === 'true';
  });

  const toggleRushMode = () => {
    const nextState = !rushModeActive;
    setRushModeActive(nextState);
    localStorage.setItem('admin_rush_mode', String(nextState));
    if (nextState) {
      toast.success('⚡ Rush Mode Activated: +15 mins added to delivery ETA estimates for customers', {
        duration: 4000
      });
    } else {
      toast('Rush Mode Deactivated: Normal fulfillment estimates restored', {
        icon: '✓'
      });
    }
  };

  const ordersList = Array.isArray(state.orders) ? state.orders : [];
  const pendingOrdersCount = ordersList.filter((o) => o.orderStatus === 'pending').length;
  const kitchenOrdersCount = ordersList.filter((o) => o.orderStatus === 'preparing').length;
  const outForDeliveryCount = ordersList.filter((o) => o.orderStatus === 'out_for_delivery').length;
  const activeOrdersCount = pendingOrdersCount + kitchenOrdersCount + outForDeliveryCount;

  return (
    <div className="space-y-6 pb-8">
      {/* Dispatch Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="text-xs font-semibold text-slate-500 hover:text-primary-600 dark:text-slate-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Executive Dashboard</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Dispatch Operations Active
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FiActivity className="w-6 h-6 text-emerald-500" />
            Order Dispatch Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time fulfillment command: monitor incoming orders, assign couriers, and track live transit.
          </p>
        </div>

        {/* Quick Dispatch Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Rush Mode Toggle */}
          <button
            type="button"
            onClick={toggleRushMode}
            className={`h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              rushModeActive
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-card border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground'
            }`}
            title="Click to toggle rush hour delivery delay offset"
          >
            <FiZap className={`w-4 h-4 ${rushModeActive ? 'text-white' : 'text-amber-500'}`} />
            <span>{rushModeActive ? 'Rush Mode: ON (+15m)' : 'Rush Mode'}</span>
          </button>
        </div>
      </div>

      {/* Fulfillment Radar Pulse Strip */}
      <LiveOperationsPulse
        activeOrdersCount={activeOrdersCount}
        kitchenOrdersCount={kitchenOrdersCount}
        outForDeliveryCount={outForDeliveryCount}
        pendingOrdersCount={pendingOrdersCount}
        isDispatchPage={true}
      />

      {/* 4-Lane Real-Time Dispatch Board */}
      <LiveOperationsCenter />
    </div>
  );
};

export default DispatchPage;
