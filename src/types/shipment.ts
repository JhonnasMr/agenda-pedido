export interface ShipmentData {
  id?: string;
  merchantId: string;
  phone: string; // E.164 format, e.g. "+51987654321"
  rawPhone?: string; // Number without country prefix, e.g. "987654321"
  fullName: string;
  documentType?: 'DNI' | 'CE' | 'RUC' | 'Pasaporte' | string;
  documentNumber?: string;
  deliveryType?: 'agencia' | 'domicilio';
  courier?: string; // e.g. "Shalom", "Olva Courier", "Marvisur", "Motorizado"
  department?: string;
  province?: string;
  district?: string;
  destinationSede?: string;
  reference?: string;
  preferredDate?: string;
  notes?: string;
  createdAt?: string;
  trackingCode?: string;
  // Dynamic fields key-value store for arbitrary merchant fields
  dynamicValues?: Record<string, string | number | boolean>;
}

export interface ShipmentResponse {
  success: boolean;
  shipmentId: string;
  trackingCode?: string;
  message: string;
  data: ShipmentData;
}
