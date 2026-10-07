import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageSquare, CheckCircle2 } from 'lucide-react';
import {
  COUNTRY_OPTIONS,
  cleanDigits,
  formatPeruvianMobileDisplay,
  isValidPeruvianPhone,
  isValidPhoneNumber,
  extractMobileDigits,
} from '../../utils/phone';

export interface PhoneInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (normalizedValue: string, rawDigits: string, dialCode: string) => void;
  onValidChange?: (isValid: boolean) => void;
  error?: string;
  defaultCountryCode?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id = 'phone-input',
  label = 'Tu WhatsApp',
  value,
  onChange,
  onValidChange,
  error,
  defaultCountryCode = '+51',
  placeholder = '9XXXXXXXX',
  helpText = 'Ingresa los 9 dígitos de tu WhatsApp personal para coordinar tu entrega.',
  required = true,
  disabled = false,
}) => {
  const initialCountry =
    COUNTRY_OPTIONS.find((c) => c.dialCode === defaultCountryCode) || COUNTRY_OPTIONS[0];
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Extract pure mobile digits for display (never prepends +51 into the input field)
  const isPeruvian = selectedCountry.dialCode === '+51';
  const currentDigits = extractMobileDigits(value, selectedCountry.dialCode);

  const isValidNumber = isPeruvian
    ? isValidPeruvianPhone(value)
    : isValidPhoneNumber(value, selectedCountry.dialCode);

  useEffect(() => {
    if (onValidChange) {
      onValidChange(isValidNumber);
    }
  }, [isValidNumber, onValidChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digitsOnly = cleanDigits(e.target.value);

    // If user pasted or typed with the country dial code (e.g. 51987654321):
    const dialDigits = cleanDigits(selectedCountry.dialCode);
    if (digitsOnly.startsWith(dialDigits)) {
      digitsOnly = digitsOnly.slice(dialDigits.length);
    }

    const maxDigits = isPeruvian ? 9 : 15;
    const trimmed = digitsOnly.slice(0, maxDigits);

    const normalized = trimmed ? `${selectedCountry.dialCode}${trimmed}` : '';
    onChange(normalized, trimmed, selectedCountry.dialCode);
  };

  const handleSelectCountry = (country: typeof COUNTRY_OPTIONS[0]) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    const normalized = currentDigits ? `${country.dialCode}${currentDigits}` : '';
    onChange(normalized, currentDigits, country.dialCode);
  };

  const displayFormatted = isPeruvian ? formatPeruvianMobileDisplay(currentDigits) : currentDigits;

  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return (
    <div className="w-full text-left">
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>

        {isValidNumber && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Número verificado
          </span>
        )}
      </div>

      <div className="relative flex rounded-xl shadow-sm">
        {/* Country Selector Button */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="h-12 px-3 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-700 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-merchant-primary focus:z-10"
            aria-label="Seleccionar país de teléfono"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="text-xs text-slate-800 font-mono font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Country Dropdown */}
          {showCountryPicker && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowCountryPicker(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 z-30 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 max-h-60 overflow-y-auto animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Selecciona tu país
                </div>
                {COUNTRY_OPTIONS.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className="w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="font-medium text-slate-700">{country.name}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Input */}
        <div className="relative flex-1">
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={disabled}
            value={displayFormatted}
            onChange={handleInputChange}
            placeholder={placeholder}
            aria-invalid={Boolean(error && !isValidNumber)}
            aria-describedby={error && !isValidNumber ? errorId : helpText ? helpId : undefined}
            className={`
              block w-full h-12 px-3.5 rounded-r-xl border transition-all duration-200
              text-base sm:text-base font-semibold tracking-wide text-slate-900 bg-white
              placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal
              ${
                isValidNumber
                  ? 'border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 bg-emerald-50/10'
                  : error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 bg-rose-50/20'
                  : 'border-slate-200 hover:border-slate-300 focus:border-merchant-primary focus:ring-4 focus:ring-merchant-primary/10'
              }
              focus:outline-none focus:z-10 relative
              disabled:bg-slate-100 disabled:cursor-not-allowed
            `}
          />

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            {isValidNumber ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-fadeIn" />
            ) : (
              <MessageSquare className="w-4 h-4 text-emerald-500" />
            )}
          </div>
        </div>
      </div>

      {error && !isValidNumber ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
          {error}
        </p>
      ) : helpText ? (
        <p id={helpId} className="mt-1.5 text-xs text-slate-500">
          {helpText}
        </p>
      ) : null}
    </div>
  );
};
