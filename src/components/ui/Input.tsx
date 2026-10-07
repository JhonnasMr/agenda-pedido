import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      isRequired,
      className = '',
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helpId = inputId ? `${inputId}-help` : undefined;

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            {label}
            {isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helpText ? helpId : undefined}
            className={`
              block w-full rounded-xl border transition-all duration-200
              /* 16px on mobile prevents auto-zoom in iOS Safari */
              text-base sm:text-sm text-slate-900 bg-white
              placeholder:text-slate-400 placeholder:text-sm
              h-12 px-3.5
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 bg-rose-50/20'
                  : 'border-slate-200 hover:border-slate-300 focus:border-merchant-primary focus:ring-4 focus:ring-merchant-primary/10'
              }
              disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
              focus:outline-none
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1 animate-fadeIn"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {error}
          </p>
        ) : helpText ? (
          <p id={helpId} className="mt-1.5 text-xs text-slate-500">
            {helpText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
