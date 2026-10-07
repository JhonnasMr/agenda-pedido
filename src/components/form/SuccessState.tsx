import React, { useState } from 'react';
import {
  CheckCircle2,
  Send,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { ShipmentData } from '../../types/shipment';
import { MerchantConfig } from '../../types/merchant';
import { sendShipmentToWhatsApp, copyShipmentWhatsAppMessage } from '../../services/whatsappService';
import { formatNormalizedPhoneDisplay } from '../../utils/phone';
import { Button } from '../ui/Button';

export interface SuccessStateProps {
  shipment: ShipmentData;
  merchant: MerchantConfig;
  onReset: () => void;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  shipment,
  merchant,
  onReset,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyShipmentWhatsAppMessage(shipment, merchant);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    sendShipmentToWhatsApp(shipment, merchant);
  };

  const title = merchant.successTitle || '¡Registro Exitoso!';
  const message =
    merchant.successMessage ||
    'Tu envío ha sido programado correctamente. Verifica los datos y envíalos por chat con el botón verde para confirmar tu despacho.';

  return (
    <div className={`text-center space-y-6 animate-fadeIn ${className}`}>
      {/* Success Badge Icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
        </div>
      </div>

      {/* Headings */}
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {/* Order Ticket Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-left space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
          <span className="font-semibold text-slate-600">Código de Envío</span>
          <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
            #{shipment.trackingCode || 'REGISTRADO'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Destinatario:</span>
            <span className="font-semibold text-slate-800">{shipment.fullName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">WhatsApp:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatNormalizedPhoneDisplay(shipment.phone)}
            </span>
          </div>

          {shipment.courier && (
            <div className="flex justify-between">
              <span className="text-slate-500">Transporte:</span>
              <span className="font-bold text-merchant-primary">{shipment.courier}</span>
            </div>
          )}

          {shipment.destinationSede && (
            <div className="flex justify-between">
              <span className="text-slate-500">
                {shipment.deliveryType === 'agencia' ? 'Agencia:' : 'Dirección:'}
              </span>
              <span className="font-medium text-slate-800 text-right max-w-[240px]">
                {shipment.deliveryType === 'agencia' && `${shipment.courier?.toLocaleUpperCase() || 'SHALOM'}, `}
                {shipment.destinationSede}
              </span>
            </div>
          )}

          {shipment.district && (
            <div className="flex justify-between">
              <span className="text-slate-500">Distrito:</span>
              <span className="font-medium text-slate-800">{shipment.district}</span>
            </div>
          )}

          {shipment.preferredDate && (
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500">Fecha Agendada:</span>
              <span className="font-bold text-emerald-700">{shipment.preferredDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary WhatsApp Action */}
      <div className="space-y-3 pt-2">
        <Button
          type="button"
          size="lg"
          variant="whatsapp"
          fullWidth
          onClick={handleOpenWhatsApp}
          leftIcon={<Send className="w-5 h-5 fill-current" />}
          className="text-base font-bold py-4 shadow-xl shadow-emerald-600/25"
        >
          Enviar por WhatsApp
        </Button>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleCopy}
            leftIcon={
              copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-slate-600" />
              )
            }
            className="w-full text-xs sm:text-sm"
          >
            {copied ? '¡Texto Copiado!' : 'Copiar texto'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-4 h-4 text-slate-600" />}
            className="w-full text-xs sm:text-sm"
          >
            Registrar otro
          </Button>
        </div>
      </div>

      {/* Support Info */}
      {merchant.supportPhone && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
          <span>Soporte de la tienda:</span>
          <span className="font-semibold text-slate-700">{merchant.supportPhone}</span>
        </div>
      )}
    </div>
  );
};
