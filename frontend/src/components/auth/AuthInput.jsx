import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

/**
 * Polished, accessible 44px authentication input group with inline icons,
 * focus rings, password toggling, and validation states.
 */
const AuthInput = forwardRef(({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  autoComplete,
  icon: Icon,
  error,
  helperText,
  disabled = false,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || name || `auth-input-${Math.random().toString(36).substring(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-90 select-none"
        >
          {label}
          {required && <span className="text-[var(--color-danger)] ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Leading Inline Icon */}
        {Icon && (
          <div
            className="absolute left-3.5 flex items-center pointer-events-none text-[var(--muted-foreground)] transition-colors duration-200"
            aria-hidden="true"
          >
            <Icon className="w-4 h-4" />
          </div>
        )}

        {/* The 44px Input Element */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`
            w-full h-11 text-sm rounded-xl
            bg-[var(--card)] text-[var(--foreground)]
            placeholder:text-[var(--muted-foreground)]/60
            border transition-all duration-200 motion-reduce:transition-none
            ${Icon ? 'pl-10.5' : 'pl-3.5'}
            ${isPassword ? 'pr-11' : 'pr-3.5'}
            ${
              error
                ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/20'
                : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 hover:border-[var(--primary)]/50'
            }
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${inputClassName}
          `}
          {...props}
        />

        {/* Trailing Password Visibility Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 rounded-md transition-colors"
          >
            {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          className="text-xs text-[var(--color-danger)] flex items-center gap-1.5 font-medium animate-fadeIn pt-0.5"
          role="alert"
        >
          <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Helper Text (when no error) */}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-[var(--muted-foreground)] pt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

AuthInput.displayName = 'AuthInput';

AuthInput.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  autoComplete: PropTypes.string,
  icon: PropTypes.elementType,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string
};

export default AuthInput;
