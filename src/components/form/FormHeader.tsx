import React, { useState } from 'react';
import { ShieldCheck, Store, Package } from 'lucide-react';
import { MerchantConfig } from '../../types/merchant';

export interface FormHeaderProps {
  merchant: MerchantConfig;
  className?: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ merchant, className = '' }) => {
  const [logoError, setLogoError] = useState(false);

  // Derive stylish initials if logo is absent or fails to load
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  const title = merchant.formTitle || 'Formulario de Envío';
  const subtitle = merchant.formSubtitle || 'Completa los datos para coordinar el despacho seguro de tu paquete.';

  return (
    <header className={`text-center space-y-3 pb-6 border-b border-slate-100 ${className}`}>
      {/* Merchant Branding Row */}
      <div className="flex flex-col items-center justify-center gap-2">
        {merchant.logo && !logoError ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white p-1 flex items-center justify-center">
            <img
              src={merchant.logo}
              alt={merchant.name}
              onError={() => setLogoError(true)}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white shadow-md flex items-center justify-center font-bold text-lg tracking-wider border-2 border-white ring-2 ring-slate-100">
            {merchant.name ? (
              <span>{getInitials(merchant.name)}</span>
            ) : (
              <Store className="w-6 h-6 text-slate-200" />
            )}
          </div>
        )}

        {/* Merchant Name Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/60 text-xs font-semibold text-slate-700">
          <Store className="w-3.5 h-3.5 text-slate-500" />
          <span>{merchant.name}</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      </div>

      {/* Main Form Titles */}
      <div className="space-y-1 pt-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-2">
          <Package className="w-5 h-5 text-merchant-primary inline-block sm:hidden" />
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
};
