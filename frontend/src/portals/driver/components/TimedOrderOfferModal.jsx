import React, { useEffect, useState, useRef } from 'react';
import { 
  FiClock, 
  FiMapPin, 
  FiDollarSign, 
  FiPackage, 
  FiCheck, 
  FiX, 
  FiNavigation, 
  FiArrowRight,
  FiZap
} from 'react-icons/fi';

const OFFER_TIMEOUT_SECONDS = 45;

const triggerDispatchHaptic = () => {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([250, 100, 250, 100, 400]);
    }
  } catch (_e) {
    // Quiet fallback if vibration not supported or blocked
  }
};

const TimedOrderOfferModal = ({
  order,
  isOpen,
  onAccept,
  onDecline
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(OFFER_TIMEOUT_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !order) {
      setSecondsRemaining(OFFER_TIMEOUT_SECONDS);
      return;
    }

    // Trigger mobile courier dispatch vibration
    triggerDispatchHaptic();

    setSecondsRemaining(OFFER_TIMEOUT_SECONDS);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onDecline?.(order?._id || order?.id, 'Offer timed out');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, order, onDecline]);

  if (!isOpen || !order) return null;

  const orderId = order._id || order.id;
  const deliveryFee = Number(order.deliveryFee || 5.0);
  const tip = Number(order.driverWorkflow?.tip || 0);
  const totalPayout = (deliveryFee + tip).toFixed(2);
  const itemCount = Array.isArray(order.items) ? order.items.length : 1;
  const dropAddress = order.deliveryAddress?.street || order.deliveryStreet || 'Customer Address';
  const dropCity = order.deliveryAddress?.city || order.deliveryCity || '';

  const progressPercent = (secondsRemaining / OFFER_TIMEOUT_SECONDS) * 100;
  const strokeColor = secondsRemaining > 15 ? '#10b981' : secondsRemaining > 8 ? '#f59e0b' : '#ef4444';

  const handleAcceptClick = async () => {
    setIsSubmitting(true);
    try {
      await onAccept?.(orderId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineClick = () => {
    onDecline?.(orderId, 'Declined by courier');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl relative space-y-4 sm:space-y-5">
        {/* Animated Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Circular Countdown Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Exclusive Dispatch Radar Offer
              </span>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Trip #{order.orderNumber || orderId.slice(0, 8)}
              </h2>
            </div>
          </div>

          {/* Circular Countdown SVG */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.2"
                strokeDasharray={`${progressPercent}, 100`}
                strokeLinecap="round"
                stroke={strokeColor}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute font-mono font-bold tabular-nums text-xs text-slate-900 dark:text-white">
              {secondsRemaining}s
            </div>
          </div>
        </div>

        {/* Upfront Guaranteed Payout Box */}
        <div className="bg-linear-to-r from-emerald-500/15 via-emerald-500/5 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Total Guaranteed Pay
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              {totalPayout}
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">ETB</span>
            </div>
          </div>

          {/* Earnings Breakdown Pills */}
          <div className="space-y-1 text-right text-[11px]">
            <div className="text-slate-600 dark:text-slate-300 font-semibold">
              Base Fee: <span className="font-mono text-slate-900 dark:text-white">{deliveryFee.toFixed(2)} ETB</span>
            </div>
            {tip > 0 ? (
              <div className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md inline-block">
                Customer Tip: +{tip.toFixed(2)} ETB
              </div>
            ) : (
              <div className="text-slate-500 text-[10px]">
                Tip eligible upon drop-off
              </div>
            )}
          </div>
        </div>

        {/* Trip Route Waypoints */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">1. Pickup</div>
              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">Central Kitchen / Restaurant</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} • Packaging ready
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="ml-3 pl-3 border-l-2 border-dashed border-slate-200 dark:border-slate-800 h-2" />

          {/* Drop-off */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <FiMapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">2. Drop-off</div>
              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{dropAddress}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{dropCity || 'Customer destination'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Accept / Decline */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleDeclineClick}
            className="py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <FiX className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            Decline
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAcceptClick}
            className="py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Accept ({secondsRemaining}s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimedOrderOfferModal;
