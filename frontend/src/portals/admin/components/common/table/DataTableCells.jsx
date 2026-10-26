import React, { useState } from 'react';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import {
  FiCheck,
  FiX,
  FiCopy,
  FiCheckCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiMoreVertical
} from 'react-icons/fi';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { formatCurrency } from '../../../utils/adminHelpers';

/**
 * Specialized Cell: Truncated text with accessible tooltip & optional copy button
 */
export const DataTableTextCell = ({
  value,
  secondary,
  maxWidth = 'max-w-[220px]',
  copyable = false,
  tooltip = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const text = value !== null && value !== undefined ? String(value) : '-';

  const handleCopy = (e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const content = (
    <div className={`flex items-center gap-1.5 ${maxWidth} ${className}`}>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-slate-900 dark:text-slate-100 font-medium">
          {text}
        </span>
        {secondary && (
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
            {secondary}
          </span>
        )}
      </div>
      {copyable && text !== '-' && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : `Copy ${text}`}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors shrink-0"
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <FiCopy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );

  if (!tooltip || text === '-') {
    return content;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div tabIndex={0} role="note" aria-label={text} className="inline-block cursor-default focus:outline-none focus:ring-1 focus:ring-primary-500 rounded">
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs break-words">
          <p className="font-semibold text-xs">{text}</p>
          {secondary && <p className="text-2xs opacity-80 mt-0.5">{secondary}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Specialized Cell: Consistent Date/Time using date-fns
 */
export const DataTableDateCell = ({
  date,
  formatPattern = 'MMM d, yyyy',
  includeTime = false,
  relative = false,
  className = ''
}) => {
  if (!date) return <span className="text-slate-400 text-xs">-</span>;

  const parsed = new Date(date);
  if (!isValid(parsed)) return <span className="text-slate-400 text-xs">Invalid date</span>;

  const pattern = includeTime ? `${formatPattern} • h:mm a` : formatPattern;
  const formatted = format(parsed, pattern);
  const relativeText = formatDistanceToNow(parsed, { addSuffix: true });

  return (
    <div className={`text-xs ${className}`}>
      <span className="text-slate-700 dark:text-slate-300 font-medium tabular-nums block">
        {formatted}
      </span>
      {relative && (
        <span className="text-2xs text-slate-400 dark:text-slate-500 block">
          {relativeText}
        </span>
      )}
    </div>
  );
};

/**
 * Specialized Cell: Accessible Boolean badge (icon + text, not color-alone)
 */
export const DataTableBooleanCell = ({
  value,
  trueLabel = 'Active',
  falseLabel = 'Inactive',
  trueVariant = 'success',
  className = ''
}) => {
  const isTrue = Boolean(value);
  const label = isTrue ? trueLabel : falseLabel;

  const variantStyles = {
    success: isTrue
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
    danger: isTrue
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-500/20'
  };

  const styleClass = variantStyles[trueVariant] || variantStyles.success;

  return (
    <span
      role="status"
      aria-label={`${label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold uppercase tracking-wider border select-none ${styleClass} ${className}`}
    >
      {isTrue ? (
        <FiCheck className="w-3 h-3 shrink-0 stroke-[2.5]" aria-hidden="true" />
      ) : (
        <FiX className="w-3 h-3 shrink-0 stroke-[2.5]" aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
};

/**
 * Specialized Cell: Dense / Tabular-nums Numeric & Currency
 */
export const DataTableNumericCell = ({
  value,
  currency = false,
  decimals = 2,
  prefix = '',
  suffix = '',
  highlightZero = false,
  align = 'right',
  mono = false,
  className = ''
}) => {
  const num = Number(value);
  const isInvalid = isNaN(num);

  if (isInvalid) {
    return <span className="text-slate-400 text-xs">-</span>;
  }

  let formatted = '';
  if (currency) {
    formatted = formatCurrency(num);
  } else {
    formatted = num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  const isZero = num === 0;

  return (
    <div
      className={`${mono ? 'font-mono' : 'font-sans'} tabular-nums text-sm ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${isZero && !highlightZero ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white font-medium'} ${className}`}
    >
      {prefix}
      {formatted}
      {suffix}
    </div>
  );
};

/**
 * Specialized Cell: Row Action Menu with accessible Radix dropdown
 */
export const DataTableActionMenu = ({
  record,
  onView,
  onEdit,
  onDelete,
  customActions = [],
  canEdit = true,
  canDelete = true,
  align = 'end'
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label="Open row actions menu"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none transition-colors"
          >
            <FiMoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align={align}
            sideOffset={4}
            className="z-50 min-w-[150px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 text-slate-700 dark:text-slate-300 shadow-xl animate-in fade-in-0 zoom-in-95 select-none"
          >
            {onView && (
              <DropdownMenuPrimitive.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onView(record);
                }}
                className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs outline-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FiEye className="w-3.5 h-3.5 text-blue-500" />
                <span>View Details</span>
              </DropdownMenuPrimitive.Item>
            )}

            {onEdit && canEdit && (
              <DropdownMenuPrimitive.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(record);
                }}
                className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs outline-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FiEdit2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Edit</span>
              </DropdownMenuPrimitive.Item>
            )}

            {customActions.map((action, idx) => (
              <DropdownMenuPrimitive.Item
                key={idx}
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.(record);
                }}
                className={`flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs outline-none transition-colors ${
                  action.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </DropdownMenuPrimitive.Item>
            ))}

            {onDelete && canDelete && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <DropdownMenuPrimitive.Item
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record);
                  }}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 outline-none hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </DropdownMenuPrimitive.Item>
              </>
            )}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
};
