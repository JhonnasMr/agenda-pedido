import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  icon,
}) => {
  const configs = {
    info: {
      bg: 'bg-blue-50/80 border-blue-200/80 text-blue-900',
      iconColor: 'text-blue-600',
      defaultIcon: <Info className="w-5 h-5 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900',
      iconColor: 'text-emerald-600',
      defaultIcon: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200/80 text-amber-900',
      iconColor: 'text-amber-600',
      defaultIcon: <AlertTriangle className="w-5 h-5 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50/80 border-rose-200/80 text-rose-900',
      iconColor: 'text-rose-600',
      defaultIcon: <AlertCircle className="w-5 h-5 shrink-0" />,
    },
  };

  const current = configs[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${current.bg} ${className}`}
    >
      <div className={`mt-0.5 ${current.iconColor}`}>
        {icon || current.defaultIcon}
      </div>

      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5 leading-snug">{title}</h4>}
        <div className="text-slate-700 text-xs sm:text-sm leading-relaxed opacity-95">
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
