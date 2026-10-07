import { ShipmentData } from '../types/shipment';
import { MerchantConfig } from '../types/merchant';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';

export { buildWhatsAppMessage, buildWhatsAppUrl };

/**
 * Triggers sending the formatted shipment notification via WhatsApp.
 * Opens WhatsApp in a new tab/window or native app.
 */
export function sendShipmentToWhatsApp(
  shipment: ShipmentData,
  merchant?: MerchantConfig
): { url: string; success: boolean } {
  const message = buildWhatsAppMessage(shipment, merchant);
  const targetPhone = merchant?.whatsappNumber || '';
  const url = buildWhatsAppUrl(targetPhone, message);

  try {
    // Open wa.me URL
    window.open(url, '_blank', 'noopener,noreferrer');
    return { url, success: true };
  } catch (error) {
    console.error('Error opening WhatsApp URL:', error);
    // Fallback: direct window.location
    window.location.href = url;
    return { url, success: false };
  }
}

/**
 * Copies the formatted WhatsApp message to the system clipboard
 */
export async function copyShipmentWhatsAppMessage(
  shipment: ShipmentData,
  merchant?: MerchantConfig
): Promise<boolean> {
  const message = buildWhatsAppMessage(shipment, merchant);
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = message;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
