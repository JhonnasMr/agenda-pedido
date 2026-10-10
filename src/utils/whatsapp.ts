import { ShipmentData } from '../types/shipment';
import { MerchantConfig } from '../types/merchant';
import { cleanDigits } from './phone';
import { formatLogisticsDate } from './date';

/**
 * Builds a structured, professional WhatsApp message for logistics dispatch
 */
export function buildWhatsAppMessage(
  shipment: ShipmentData,
  _merchant?: MerchantConfig
): string {
  const isAgency = shipment.deliveryType === 'agencia' || (!shipment.deliveryType && shipment.courier !== 'Motorizado');
  const deliveryHeader = isAgency
    ? '📦 NUEVO ENVÍO (AGENCIA)'
    : shipment.deliveryType === 'delivery'
      ? '🛵 NUEVO ENVÍO (DELIVERY)'
      : '🛵 NUEVO ENVÍO (A DOMICILIO)';

  const lines: string[] = [];

  lines.push(deliveryHeader);
  lines.push(''); // blank line

  // Customer identity
  lines.push(`👤 ${shipment.fullName.trim()}`);
  
  // Phone (display raw mobile or cleaned without '+')
  const phoneDisplay = shipment.rawPhone || shipment.phone.replace(/^\+51/, '') || shipment.phone;
  lines.push(`📱 ${phoneDisplay}`);
  if (shipment.email) {
    lines.push(`✉️ ${shipment.email}`);
  }

  // Document if provided
  if (shipment.documentNumber) {
    const docType = shipment.documentType || 'DNI';
    lines.push(`🆔 ${docType}: ${shipment.documentNumber.trim()}`);
  }

  // Location details
  const locationParts = [shipment.department, shipment.province, shipment.district].filter(Boolean);
  if (locationParts.length > 0) {
    if (isAgency) {
      lines.push(`🏢 Agencia/Destino: ${locationParts.join(' / ')}`);
    } else {
      lines.push(`📍 Ubicación: ${locationParts.join(' / ')}`);
    }
  }

  // Exact address or agency branch
  if (shipment.destinationSede) {
    let addressLine = isAgency
      ? `📍 Destino: ${shipment.destinationSede.trim()}`
      : `📍 Dirección de destino: ${shipment.destinationSede.trim()}`;
    if (shipment.reference) {
      addressLine += ` (Ref: ${shipment.reference.trim()})`;
    }
    lines.push(addressLine);
  }

  // Courier service
  if (shipment.courier && shipment.deliveryType !== 'delivery') {
    lines.push(`🚚 Courier: ${shipment.courier}`);
  }

  // Date / Scheduled dispatch
  const dateFormatted = shipment.preferredDate || formatLogisticsDate(new Date());
  lines.push(`📅 Fecha: ${dateFormatted}`);

  // Notes
  if (shipment.notes) {
    lines.push(`💬 Notas: ${shipment.notes.trim()}`);
  }

  // Dynamic additional fields
  if (shipment.dynamicValues && Object.keys(shipment.dynamicValues).length > 0) {
    for (const [key, val] of Object.entries(shipment.dynamicValues)) {
      if (val !== undefined && val !== null && val !== '') {
        lines.push(`• ${key}: ${val}`);
      }
    }
  }

  // Footer / Order code
  if (shipment.trackingCode) {
    lines.push('');
    lines.push(`🔖 Código de Registro: #${shipment.trackingCode}`);
  }

  return lines.join('\n');
}

/**
 * Builds an official wa.me direct URL with encoded message
 * @param phone Target phone number with country code (e.g. +51987654321 or 51987654321)
 * @param message Pre-filled message string
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  // Strip non-digits for the wa.me link
  const cleanPhone = cleanDigits(phone);
  const encodedText = encodeURIComponent(message);
  
  if (!cleanPhone) {
    // If no target merchant number is specified, open wa.me link with text to choose contact
    return `https://wa.me/?text=${encodedText}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
