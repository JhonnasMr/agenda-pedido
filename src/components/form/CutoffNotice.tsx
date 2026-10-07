import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { MerchantConfig } from '../../types/merchant';
import { isBeforeCutoff, getTimeUntilCutoff } from '../../utils/date';

export interface CutoffNoticeProps {
  merchant: MerchantConfig;
  className?: string;
}

export const CutoffNotice: React.FC<CutoffNoticeProps> = ({ merchant, className = '' }) => {
  if (!merchant.cutoffTime) {
    return null;
  }

  const beforeCutoff = isBeforeCutoff(merchant.cutoffTime);
  const { hours, minutes } = getTimeUntilCutoff(merchant.cutoffTime);

  const title = merchant.cutoffNoticeTitle || `Hora de corte: ${merchant.cutoffTime}`;
  const message = beforeCutoff
    ? merchant.cutoffNoticeMessage || 'Asegura tu envío registrando tus datos antes de la hora de corte.'
    : merchant.cutoffPassedMessage || 'Hora de corte finalizada. Tu paquete será procesado con prioridad en el siguiente turno de despacho.';

  return (
    <div
      role="status"
      className={`rounded-xl border p-3 sm:p-3.5 transition-all ${
        beforeCutoff
          ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      } ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 shrink-0 ${beforeCutoff ? 'text-amber-600' : 'text-slate-500'}`}>
          <Clock className="w-4 h-4 animate-pulse" />
        </div>

        <div className="flex-1 text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <span className="font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              {title}
            </span>

            {beforeCutoff ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Quedan {hours > 0 ? `${hours}h ` : ''}{minutes}m</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" />
                <span>Turno siguiente</span>
              </span>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
