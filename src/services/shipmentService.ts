import { ShipmentData, ShipmentResponse } from '../types/shipment';
import { cleanDigits } from '../utils/phone';

/**
 * Service to register or create a new shipment schedule.
 * Currently simulates backend API request with Promise + setTimeout.
 */
export async function createShipment(
  data: ShipmentData
): Promise<ShipmentResponse> {
  // Simulate network latency (400ms)
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Generate unique tracking code for this shipment
  const phoneSuffix = cleanDigits(data.phone).slice(-4) || '0000';
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const trackingCode = `L5S-${phoneSuffix}-${randomSuffix}`;
  const shipmentId = `ship_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const createdShipment: ShipmentData = {
    ...data,
    id: shipmentId,
    trackingCode,
    createdAt: new Date().toISOString(),
  };

  // Optionally cache the last shipment in sessionStorage for reload persistence
  try {
    sessionStorage.setItem('last_shipment_data', JSON.stringify(createdShipment));
  } catch {
    // Ignore storage quota errors in private browsing
  }

  return {
    success: true,
    shipmentId,
    trackingCode,
    message: 'Envío agendado exitosamente.',
    data: createdShipment,
  };
}

/**
 * Retrieves the last stored shipment from current session (for back/forward navigation or refresh)
 */
export function getLastSessionShipment(): ShipmentData | null {
  try {
    const raw = sessionStorage.getItem('last_shipment_data');
    if (!raw) return null;
    return JSON.parse(raw) as ShipmentData;
  } catch {
    return null;
  }
}
