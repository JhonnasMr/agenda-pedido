import { FormFieldConfig } from './form';

export interface MerchantTheme {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryForeground?: string;
  secondary?: string;
}

export interface MerchantConfig {
  id: string;
  name: string;
  logo?: string;
  badgeText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: Partial<MerchantTheme>;
  phoneCountryCode: string; // e.g. "+51"
  phonePlaceholder: string; // e.g. "9XXXXXXXX"
  cutoffTime?: string; // "HH:mm", e.g. "18:00"
  cutoffEnabled?: boolean;
  cutoffNoticeTitle?: string;
  cutoffNoticeMessage?: string;
  cutoffPassedMessage?: string;
  whatsappEnabled: boolean;
  whatsappNumber?: string; // Merchant destination WhatsApp number, e.g. "+51987654321"
  whatsappTemplateType?: 'standard' | 'detailed' | 'custom';
  successTitle?: string;
  successMessage?: string;
  formTitle?: string;
  formSubtitle?: string;
  fields: FormFieldConfig[];
  allowedCouriers?: string[];
  defaultCourier?: string;
  supportPhone?: string;
  supportEmail?: string;
  termsUrl?: string;
}
