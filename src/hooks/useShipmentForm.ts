import { useState } from 'react';
import { ShipmentData } from '../types/shipment';
import { MerchantConfig } from '../types/merchant';
import { createShipment } from '../services/shipmentService';
import { sendShipmentToWhatsApp } from '../services/whatsappService';

export type FormStep = 'form' | 'summary' | 'success';

export interface UseShipmentFormProps {
  merchant: MerchantConfig;
  initialData?: Partial<ShipmentData>;
}

export function useShipmentForm({ merchant, initialData }: UseShipmentFormProps) {
  const [step, setStep] = useState<FormStep>('form');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(() => {
    if (initialData && initialData.phone) {
      return {
        merchantId: merchant.id,
        phone: initialData.phone || '',
        fullName: initialData.fullName || '',
        ...initialData,
      } as ShipmentData;
    }
    return null;
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Called when user clicks "Agendar y ver resumen"
   * Moves form to 'summary' stage or creates the record
   */
  const handleProceedToSummary = async (formData: ShipmentData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate backend save / validation
      const response = await createShipment(formData);
      if (response.success) {
        setShipmentData(response.data);
        setStep('summary');
      } else {
        setSubmitError(response.message || 'Error al procesar el envío');
      }
    } catch (err) {
      setSubmitError('Ocurrió un error inesperado al registrar el envío. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * User wants to go back to edit information
   */
  const handleEditData = () => {
    setStep('form');
  };

  /**
   * User confirms in summary or success and clicks WhatsApp CTA
   */
  const handleSendWhatsApp = () => {
    if (!shipmentData) return;
    sendShipmentToWhatsApp(shipmentData, merchant);
    setStep('success');
  };

  /**
   * Reset to register a new shipment
   */
  const handleReset = () => {
    setShipmentData(null);
    setStep('form');
  };

  return {
    step,
    setStep,
    isSubmitting,
    shipmentData,
    submitError,
    handleProceedToSummary,
    handleEditData,
    handleSendWhatsApp,
    handleReset,
  };
}
