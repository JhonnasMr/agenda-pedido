import React, { useState } from 'react';
import { Calendar, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { getFutureScheduleOptions, getTomorrowIsoString } from '../../utils/date';

export interface DateSchedulerProps {
  value?: string;
  onChange: (dateValue: string) => void;
  error?: string;
  disabled?: boolean;
}

export const DateScheduler: React.FC<DateSchedulerProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const options = getFutureScheduleOptions();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const minFutureDate = getTomorrowIsoString();

  const handleSelectOption = (optValue: string) => {
    setShowCustomPicker(false);
    onChange(optValue);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) return;

    // Format custom date in Spanish
    const [year, month, day] = raw.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

    const formatted = `${daysOfWeek[dateObj.getDay()]} ${String(day).padStart(2, '0')} de ${months[dateObj.getMonth()]}`;
    onChange(formatted);
  };

  return (
    <div className="w-full text-left space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Agendar Fecha de Envío <span className="text-rose-500 font-bold">*</span>
        </label>
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          Solo fechas futuras
        </span>
      </div>

      {/* Grid of future options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectOption(opt.value)}
              className={`
                relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between
                ${
                  isSelected
                    ? 'border-merchant-primary bg-merchant-primary-light/40 ring-2 ring-merchant-primary/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {opt.badge && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  {opt.badge}
                </span>
              )}

              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'border-merchant-primary bg-merchant-primary text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 pr-14 sm:pr-12">
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {opt.dayName}
                  </p>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                    {opt.formattedDate}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {opt.subtitle}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom future date toggle */}
      <div className="pt-1">
        {!showCustomPicker ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowCustomPicker(true)}
            className="text-xs text-merchant-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>¿Deseas elegir otra fecha posterior?</span>
          </button>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-fadeIn">
            <label
              htmlFor="custom-future-date"
              className="block text-xs font-semibold text-slate-700"
            >
              Selecciona una fecha futura (a partir de mañana)
            </label>
            <input
              id="custom-future-date"
              type="date"
              min={minFutureDate}
              disabled={disabled}
              onChange={handleCustomDateChange}
              className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-merchant-primary"
            />
          </div>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {error}
        </p>
      ) : null}
    </div>
  );
};
