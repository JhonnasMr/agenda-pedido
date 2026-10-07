import React from 'react';
import { AlertCircle, Store, ArrowRight, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { getAvailableMerchantIds, MOCK_MERCHANTS } from '../../config/merchants';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  merchantId?: string | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Enlace no válido',
  message = 'No hemos podido identificar la tienda asociada a este formulario. Verifica el enlace recibido de tu vendedor.',
  merchantId,
  onRetry,
  className = '',
}) => {
  const demoIds = getAvailableMerchantIds();

  return (
    <div className={`text-center space-y-6 animate-fadeIn ${className}`}>
      {/* Icon */}
      <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      {/* Headings */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>

        {merchantId && (
          <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
            Parámetro recibido: <span className="font-bold text-slate-800">?merchant={merchantId}</span>
          </div>
        )}
      </div>

      {/* Interactive Helper / Demo Links */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-left space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Comercios de demostración disponibles</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Puedes seleccionar cualquiera de estas tiendas de prueba para explorar la experiencia del formulario:
        </p>

        <div className="space-y-2 pt-1">
          {demoIds.map((id) => {
            const m = MOCK_MERCHANTS[id];
            return (
              <a
                key={id}
                href={`/form?merchant=${id}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-merchant-primary/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-merchant-primary">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-merchant-primary transition-colors">
                      {m.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">?merchant={id}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-merchant-primary group-hover:translate-x-0.5 transition-all" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Reintentar cargar
          </Button>
        </div>
      )}
    </div>
  );
};
