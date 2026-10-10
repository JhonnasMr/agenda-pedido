import React, { useState } from 'react';
import {
  User,
  Phone,
  Truck,
  MapPin,
  Calendar,
  FileText,
  Edit2,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { ShipmentData } from '../../types/shipment';
import { MerchantConfig } from '../../types/merchant';
import { formatNormalizedPhoneDisplay } from '../../utils/phone';
import { copyShipmentWhatsAppMessage } from '../../services/whatsappService';
import { Button } from '../ui/Button';

export interface FormSummaryProps {
  shipment: ShipmentData;
  merchant: MerchantConfig;
  onEdit: () => void;
  onConfirmSend: () => void;
  className?: string;
}

export const FormSummary: React.FC<FormSummaryProps> = ({
  shipment,
  merchant,
  onEdit,
  onConfirmSend,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyShipmentWhatsAppMessage(shipment, merchant);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formattedPhone = formatNormalizedPhoneDisplay(shipment.phone);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title & Ready Banner */}
      <div className="text-center space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-3.5 h-3.5" />
          Datos listos para despacho
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-1">
          Resumen de tu Envío
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Verifica que todos los datos sean correctos antes de enviar el reporte por WhatsApp.
        </p>
      </div>

      {/* Structured Summary Ticket */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-200/70 text-left">
        {/* Recipient Section */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-500" />
            <span>Destinatario</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
            <div>
              <p className="text-xs text-slate-500">Nombre Completo</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{shipment.fullName}</p>
            </div>

            {shipment.documentNumber && (
              <div>
                <p className="text-xs text-slate-500">{shipment.documentType || 'DNI'}</p>
                <p className="text-sm font-semibold font-mono text-slate-900 mt-0.5">
                  {shipment.documentNumber}
                </p>
              </div>
            )}
            {shipment.email && (
              <div>
                <p className="text-xs text-slate-500">Correo electrónico</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{shipment.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp & Contact */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp de Contacto</span>
          </div>

          <div className="pl-1 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Número</p>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5 tracking-wide">
                {formattedPhone}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100/80 text-emerald-800">
              Verificado
            </span>
          </div>
        </div>

        {/* Courier & Scheduled Date */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-500" />
            <span>Transporte & Fecha</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
            {shipment.courier && (
              <div>
                <p className="text-xs text-slate-500">Empresa de Transporte</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-merchant-primary"></span>
                  {shipment.courier}
                </p>
              </div>
            )}

            {shipment.preferredDate && (
              <div>
                <p className="text-xs text-slate-500">Fecha Agendada</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{shipment.preferredDate}</span>
                </p>
              </div>
            )}

            {shipment.deliveryType && (
              <div>
                <p className="text-xs text-slate-500">Tipo de envío</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {shipment.deliveryType === 'delivery'
                    ? 'Delivery'
                    : shipment.deliveryType === 'domicilio'
                      ? 'A domicilio'
                      : 'Retiro en agencia'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Destination Location */}
        {shipment.destinationSede && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>{shipment.deliveryType === 'agencia' ? 'Agencia de envío' : 'Dirección de envío'}</span>
            </div>

            <div className="space-y-1.5 pl-1">
              {shipment.district && (
                <p className="text-xs text-slate-600">Distrito: {shipment.district}</p>
              )}
              <p className="text-sm font-bold text-slate-900">
                {shipment.deliveryType === 'agencia' && `${shipment.courier?.toLocaleUpperCase() || 'SHALOM'}, `}
                {shipment.destinationSede}
              </p>

              {shipment.reference && (
                <p className="text-xs text-slate-600 italic">
                  Ref: {shipment.reference}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {shipment.notes && (
          <div className="p-4 sm:p-5 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Observaciones</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic pl-1">
              {shipment.notes}
            </p>
          </div>
        )}

        {/* Tracking Code Footer */}
        {shipment.trackingCode && (
          <div className="p-3 sm:p-4 bg-slate-100/70 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Código de Solicitud:
            </span>
            <span className="font-mono font-bold text-slate-800 px-2 py-0.5 bg-white rounded border border-slate-200">
              #{shipment.trackingCode}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* WhatsApp Main CTA */}
        <Button
          type="button"
          size="lg"
          variant="whatsapp"
          fullWidth
          onClick={onConfirmSend}
          leftIcon={<Send className="w-5 h-5 fill-current" />}
          className="text-base font-bold shadow-xl shadow-emerald-600/20 py-4"
        >
          Enviar por WhatsApp
        </Button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onEdit}
            leftIcon={<Edit2 className="w-4 h-4 text-slate-600" />}
            className="w-full text-xs sm:text-sm"
          >
            Editar datos
          </Button>

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
            {copied ? '¡Copiado!' : 'Copiar texto'}
          </Button>
        </div>
      </div>
    </div>
  );
};
