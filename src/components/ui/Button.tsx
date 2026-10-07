import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]';

    const sizeStyles = {
      sm: 'px-3 py-2 text-xs min-h-[38px] gap-1.5',
      md: 'px-4 py-2.5 text-sm min-h-[46px] gap-2',
      lg: 'px-6 py-3.5 text-base min-h-[52px] gap-2.5 shadow-sm',
    };

    const variantStyles = {
      primary:
        'bg-merchant-primary hover:bg-merchant-primary-hover text-white shadow-md shadow-indigo-500/15 focus:ring-merchant-primary',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-slate-400',
      outline:
        'border-2 border-merchant-primary text-merchant-primary hover:bg-merchant-primary-light focus:ring-merchant-primary bg-transparent',
      whatsapp:
        'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-emerald-600/25 focus:ring-emerald-500 active:bg-[#1caa52]',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} color="currentColor" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
