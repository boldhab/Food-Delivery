import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiChevronRight, FiCheck } from 'react-icons/fi';

const triggerHaptic = (pattern = [40, 30, 40]) => {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (_e) {
    // Quiet fallback if vibration not supported or blocked
  }
};

const SlideToConfirm = ({
  label = "Slide to Confirm",
  onConfirm,
  disabled = false,
  color = "emerald", // "emerald" | "amber" | "blue"
  icon: Icon = FiChevronRight,
  className = ""
}) => {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const startXRef = useRef(0);
  const [maxDrag, setMaxDrag] = useState(0);

  const updateMaxDrag = useCallback(() => {
    if (trackRef.current && thumbRef.current) {
      setMaxDrag(Math.max(0, trackRef.current.clientWidth - thumbRef.current.clientWidth - 8));
    }
  }, []);

  useEffect(() => {
    updateMaxDrag();
    window.addEventListener('resize', updateMaxDrag);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && trackRef.current) {
      ro = new ResizeObserver(() => {
        updateMaxDrag();
      });
      ro.observe(trackRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateMaxDrag);
      if (ro) ro.disconnect();
    };
  }, [updateMaxDrag]);

  const handleStart = (clientX) => {
    if (disabled || isLoading || isConfirmed) return;
    updateMaxDrag();
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };

  const handleMove = (clientX) => {
    if (!isDragging || disabled || isLoading || isConfirmed) return;
    const newX = Math.max(0, Math.min(clientX - startXRef.current, maxDrag));
    setDragX(newX);

    // If dragged >= 88%, auto-complete
    if (maxDrag > 0 && newX >= maxDrag * 0.88) {
      handleSuccess();
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!isConfirmed && !isLoading) {
      // Spring back to start
      setDragX(0);
    }
  };

  const handleSuccess = async () => {
    setIsDragging(false);
    setDragX(maxDrag);
    setIsConfirmed(true);
    setIsLoading(true);
    triggerHaptic([60, 40, 80]);

    try {
      if (onConfirm) {
        await onConfirm();
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsConfirmed(false);
        setDragX(0);
      }, 700);
    }
  };

  // Mouse event handlers
  const onMouseDown = (e) => handleStart(e.clientX);
  const onMouseMove = (e) => handleMove(e.clientX);
  const onMouseUp = () => handleEnd();

  // Touch event handlers
  const onTouchStart = (e) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  const colorStyles = {
    emerald: {
      bg: "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40",
      fill: "bg-emerald-500/20 dark:bg-emerald-500/25",
      thumb: "bg-emerald-500 text-slate-950 shadow-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-400"
    },
    amber: {
      bg: "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 dark:border-amber-500/40",
      fill: "bg-amber-500/20 dark:bg-amber-500/25",
      thumb: "bg-amber-500 text-slate-950 shadow-amber-500/30",
      text: "text-amber-700 dark:text-amber-400"
    },
    blue: {
      bg: "bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/30 dark:border-blue-500/40",
      fill: "bg-blue-500/20 dark:bg-blue-500/25",
      thumb: "bg-blue-500 text-white shadow-blue-500/30",
      text: "text-blue-700 dark:text-blue-400"
    }
  }[color] || {
    bg: "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40",
    fill: "bg-emerald-500/20 dark:bg-emerald-500/25",
    thumb: "bg-emerald-500 text-slate-950 shadow-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400"
  };

  const progressRatio = maxDrag > 0 ? dragX / maxDrag : 0;

  return (
    <div
      ref={trackRef}
      className={`relative h-15 rounded-2xl select-none overflow-hidden border p-1 flex items-center transition-all ${
        colorStyles.bg
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab shadow-lg'} ${className}`}
    >
      {/* Dynamic progress fill */}
      <div
        className={`absolute left-0 top-0 bottom-0 ${colorStyles.fill} transition-all duration-75`}
        style={{ width: `${Math.min(100, Math.max(0, (dragX + 50) / (maxDrag + 50) * 100))}%` }}
      />

      {/* Centered instruction text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-14">
        <span
          className={`text-xs font-black uppercase tracking-wider transition-opacity duration-150 ${colorStyles.text}`}
          style={{ opacity: Math.max(0, 1 - progressRatio * 1.5) }}
        >
          {isLoading ? "Executing..." : label}
        </span>
      </div>

      {/* Draggable thumb element */}
      <div
        ref={thumbRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
        }}
        className={`relative z-10 w-13 h-13 rounded-xl flex items-center justify-center font-bold shadow-xl transition-transform active:scale-95 cursor-grab active:cursor-grabbing ${
          colorStyles.thumb
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
        ) : isConfirmed ? (
          <FiCheck className="w-6 h-6 stroke-[3]" />
        ) : (
          <Icon className="w-6 h-6 stroke-[2.5]" />
        )}
      </div>
    </div>
  );
};

export default SlideToConfirm;
