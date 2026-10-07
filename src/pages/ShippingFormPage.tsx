import React from 'react';
import { useMerchant } from '../hooks/useMerchant';
import { useShipmentForm } from '../hooks/useShipmentForm';
import { Card } from '../components/ui/Card';
import { ShippingForm } from '../components/form/ShippingForm';
import { FormSummary } from '../components/form/FormSummary';
import { SuccessState } from '../components/form/SuccessState';
import { ErrorState } from '../components/form/ErrorState';
import { Spinner } from '../components/ui/Spinner';
import { ShieldCheck, Truck } from 'lucide-react';

export const ShippingFormPage: React.FC = () => {
  const { merchant, merchantId, loading, error, isValid } = useMerchant();

  // If merchant is valid, pass to form controller
  const {
    step,
    isSubmitting,
    shipmentData,
    submitError,
    handleProceedToSummary,
    handleEditData,
    handleSendWhatsApp,
    handleReset,
  } = useShipmentForm({
    merchant: merchant || ({} as any),
  });

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10 px-3 sm:px-6 flex flex-col justify-between items-center selection:bg-merchant-primary/20">
      {/* Top logistics watermark */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between text-xs text-slate-400 pb-3 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <Truck className="w-4 h-4 text-merchant-primary" />
          <span>Sistema de Despachos & Logística</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px]">Conexión Segura SSL</span>
        </div>
      </div>

      {/* Main Form Centerpiece */}
      <main className="w-full max-w-[520px] mx-auto my-auto">
        <Card variant="elevated" padding="md" className="sm:p-8 border border-slate-200/70">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
              <Spinner size="lg" className="text-merchant-primary" />
              <p className="text-sm font-medium text-slate-600 animate-pulse">
                Cargando configuración de la tienda...
              </p>
            </div>
          ) : !isValid || !merchant ? (
            <ErrorState
              title="Enlace no válido"
              message={
                error ||
                'No hemos podido identificar la tienda. Verifica el enlace o consulta directamente con tu vendedor.'
              }
              merchantId={merchantId}
              onRetry={() => window.location.reload()}
            />
          ) : step === 'form' ? (
            <ShippingForm
              merchant={merchant}
              initialValues={shipmentData}
              onSubmit={handleProceedToSummary}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          ) : step === 'summary' && shipmentData ? (
            <FormSummary
              shipment={shipmentData}
              merchant={merchant}
              onEdit={handleEditData}
              onConfirmSend={handleSendWhatsApp}
            />
          ) : step === 'success' && shipmentData ? (
            <SuccessState
              shipment={shipmentData}
              merchant={merchant}
              onReset={handleReset}
            />
          ) : null}
        </Card>
      </main>

      {/* Platform Footer */}
      <footer className="w-full max-w-lg mx-auto pt-6 text-center text-xs text-slate-400 space-y-1">
        <p className="font-medium text-slate-500">
          {merchant?.name ? `${merchant.name} • Envíos Oficiales` : 'Plataforma de Formularios de Envío'}
        </p>
        <p className="text-[11px] text-slate-400">
          Plantilla modular de logística multi-comercio
        </p>
      </footer>
    </div>
  );
};
