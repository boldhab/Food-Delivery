import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSun, FiMoon, FiMonitor, FiCheck } from 'react-icons/fi';
import { useTheme } from '@/shared/context/ThemeContext';
import { cn } from '@/lib/utils';

export const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    description: 'Crisp, high-contrast light surfaces',
    icon: FiSun,
    colorClass: 'text-amber-500 dark:text-amber-400',
    activeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Layered dark surfaces easy on the eyes',
    icon: FiMoon,
    colorClass: 'text-purple-600 dark:text-purple-400',
    activeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    value: 'system',
    label: 'System',
    description: 'Syncs automatically with your OS preference',
    icon: FiMonitor,
    colorClass: 'text-blue-500 dark:text-blue-400',
    activeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
];

/**
 * Reusable ThemeSwitcher Component supporting Dropdown, Segmented, and Cycle variants.
 */
export const ThemeSwitcher = ({
  variant = 'dropdown', // 'dropdown' | 'segmented' | 'cycle'
  align = 'end', // 'start' | 'end' | 'center'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabel = false,
  className = '',
  buttonClassName = '',
}) => {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme, cycleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const itemsRef = useRef([]);

  // Active option details
  const activeOption = THEME_OPTIONS.find((opt) => opt.value === theme) || THEME_OPTIONS[2];
  const CurrentIcon = activeOption.icon;

  const currentStatusText =
    theme === 'system'
      ? `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`
      : activeOption.label;

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle dropdown keyboard navigation
  const handleDropdownKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const idx = THEME_OPTIONS.findIndex((opt) => opt.value === theme);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const next = prev < THEME_OPTIONS.length - 1 ? prev + 1 : 0;
        itemsRef.current[next]?.focus();
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : THEME_OPTIONS.length - 1;
        itemsRef.current[next]?.focus();
        return next;
      });
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const handleSelect = useCallback(
    (value) => {
      setTheme(value);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [setTheme]
  );

  // Focus item when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
      itemsRef.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  // 1. SEGMENTED CONTROL VARIANT
  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Theme mode"
        className={cn(
          'inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 transition-colors',
          className
        )}
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                size === 'sm' && 'px-2.5 py-1 text-xs',
                size === 'md' && 'px-3 py-1.5 text-xs sm:text-sm',
                size === 'lg' && 'px-4 py-2 text-sm',
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              )}
              title={`${opt.label} mode: ${opt.description}`}
            >
              <Icon
                className={cn(
                  size === 'sm' && 'w-3.5 h-3.5',
                  size === 'md' && 'w-4 h-4',
                  size === 'lg' && 'w-4.5 h-4.5',
                  isSelected ? opt.colorClass : 'text-slate-500 dark:text-slate-400'
                )}
              />
              <span>{opt.label}</span>
              {opt.value === 'system' && isSelected && (
                <span className="text-2xs opacity-75 font-normal hidden sm:inline">
                  ({resolvedTheme})
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 2. QUICK CYCLE VARIANT
  if (variant === 'cycle') {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={cycleTheme}
        className={cn(
          'relative p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--background)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          buttonClassName,
          className
        )}
        aria-label={`Theme: ${currentStatusText}. Click to cycle.`}
        title={`Theme: ${currentStatusText} (Click to switch)`}
      >
        <CurrentIcon className={cn('w-5 h-5 transition-transform duration-200', activeOption.colorClass)} />
        {showLabel && (
          <span className="ml-2 text-xs font-semibold text-[var(--foreground)]">
            {currentStatusText}
          </span>
        )}
      </button>
    );
  }

  // 3. DROPDOWN MENU VARIANT (Default)
  return (
    <div className={cn('relative inline-block text-left', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Theme settings, currently ${currentStatusText}`}
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) {
            const idx = THEME_OPTIONS.findIndex((opt) => opt.value === theme);
            setFocusedIndex(idx >= 0 ? idx : 0);
          }
        }}
        onKeyDown={handleDropdownKeyDown}
        className={cn(
          'flex items-center gap-2 p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)] border border-transparent hover:border-[var(--border)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isOpen && 'bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] shadow-xs',
          buttonClassName
        )}
        title={`Appearance: ${currentStatusText}`}
      >
        <CurrentIcon className={cn('w-5 h-5 shrink-0 transition-transform duration-200', activeOption.colorClass)} />
        {showLabel && (
          <span className="text-xs font-semibold text-[var(--foreground)]">
            {currentStatusText}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          aria-orientation="vertical"
          aria-label="Choose appearance theme"
          className={cn(
            'absolute z-50 mt-2 w-56 rounded-2xl bg-[var(--card)] p-1.5 shadow-xl border border-[var(--border)] focus:outline-none animate-in fade-in-0 zoom-in-95 backdrop-blur-md',
            align === 'end' && 'right-0 origin-top-right',
            align === 'start' && 'left-0 origin-top-left',
            align === 'center' && 'left-1/2 -translate-x-1/2 origin-top'
          )}
        >
          <div className="px-3 py-2 border-b border-[var(--border)]/70 mb-1">
            <p className="text-2xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Appearance
            </p>
            <p className="text-xs font-medium text-[var(--foreground)] mt-0.5">
              Active: <span className="font-semibold capitalize text-primary">{resolvedTheme}</span>
            </p>
          </div>

          <div className="space-y-0.5" role="none">
            {THEME_OPTIONS.map((opt, index) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;

              return (
                <button
                  key={opt.value}
                  ref={(el) => (itemsRef.current[index] = el)}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  tabIndex={isOpen ? (focusedIndex === index ? 0 : -1) : -1}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)]',
                    isSelected
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                      : 'text-[var(--foreground)] hover:bg-[var(--accent)]/70 hover:text-[var(--foreground)]'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border)]/50',
                        isSelected ? 'bg-[var(--primary)]/15' : 'bg-[var(--background)]'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isSelected ? 'text-primary' : opt.colorClass)} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold truncate">{opt.label}</span>
                        {opt.value === 'system' && (
                          <span className="text-2xs px-1.5 py-0.5 rounded-full font-semibold bg-[var(--background)] text-[var(--muted-foreground)] border border-[var(--border)]">
                            Auto
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-[var(--muted-foreground)] truncate mt-0.5">
                        {opt.value === 'system'
                          ? `Follows OS (${resolvedTheme})`
                          : opt.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <FiCheck className="w-4 h-4 text-primary shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
