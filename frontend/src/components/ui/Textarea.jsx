import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  rows = 4,
  className = '',
  required = false,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`form-input resize-y ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-text-muted mt-1">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
