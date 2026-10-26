import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  className = '',
  required = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`form-input ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-danger mt-1">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-muted mt-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
