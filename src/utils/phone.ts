export interface CountryOption {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
  format: string;
  length: number;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'PE', dialCode: '+51', name: 'Perú', flag: '🇵🇪', format: '9XXXXXXXX', length: 9 },
  { code: 'CL', dialCode: '+56', name: 'Chile', flag: '🇨🇱', format: '9XXXXXXXX', length: 9 },
  { code: 'CO', dialCode: '+57', name: 'Colombia', flag: '🇨🇴', format: '3XXXXXXXXX', length: 10 },
  { code: 'MX', dialCode: '+52', name: 'México', flag: '🇲🇽', format: 'XXXXXXXXXX', length: 10 },
  { code: 'AR', dialCode: '+54', name: 'Argentina', flag: '🇦🇷', format: '9XXXXXXXXXX', length: 11 },
  { code: 'US', dialCode: '+1', name: 'Estados Unidos', flag: '🇺🇸', format: 'XXXXXXXXXX', length: 10 },
  { code: 'ES', dialCode: '+34', name: 'España', flag: '🇪🇸', format: 'XXXXXXXXX', length: 9 },
];

/**
 * Strips all non-digit characters from the input string
 */
export function cleanDigits(value: string | undefined | null): string {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

/**
 * Extracts pure local mobile digits from any phone string (raw, formatted, or with country code).
 * Strips the leading country dial code if present so the user never sees duplicated prefixes.
 */
export function extractMobileDigits(value: string | undefined | null, dialCode: string = '+51'): string {
  if (!value) return '';
  let clean = cleanDigits(value);
  const cleanDial = cleanDigits(dialCode); // e.g. "51"

  if (cleanDial && clean.startsWith(cleanDial)) {
    clean = clean.slice(cleanDial.length);
  }
  return clean;
}

/**
 * Backward compatibility alias for extractMobileDigits with +51
 */
export function extractPeruvianMobileDigits(input: string | undefined | null): string {
  return extractMobileDigits(input, '+51');
}

/**
 * Checks if a string is a valid Peruvian mobile number (9 digits, starts with 9)
 * Supports raw digits (987654321), normalized (+51987654321), or with spaces (+51 987 654 321)
 */
export function isValidPeruvianPhone(digits: string | undefined | null): boolean {
  const local = extractMobileDigits(digits, '+51');
  return /^9\d{8}$/.test(local);
}

/**
 * Validates phone numbers based on country dial code
 */
export function isValidPhoneNumber(digits: string | undefined | null, dialCode = '+51'): boolean {
  if (dialCode === '+51') {
    return isValidPeruvianPhone(digits);
  }
  const local = extractMobileDigits(digits, dialCode);
  return local.length >= 7 && local.length <= 15;
}

/**
 * Normalizes phone number into E.164 format (e.g. +51987654321)
 */
export function normalizePhoneNumber(rawNumber: string, dialCode = '+51'): string {
  const local = extractMobileDigits(rawNumber, dialCode);
  if (!local) return '';
  return `${dialCode}${local}`;
}

/**
 * Formats a 9-digit Peruvian number for friendly display (e.g. "987 654 321")
 */
export function formatPeruvianMobileDisplay(digits: string | undefined | null): string {
  const clean = extractMobileDigits(digits, '+51');
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
}

/**
 * Formats E.164 normalized phone for display (e.g. "+51 987 654 321")
 */
export function formatNormalizedPhoneDisplay(normalized: string): string {
  if (!normalized) return '';
  const digits = extractMobileDigits(normalized, '+51');
  if (digits.length === 9) {
    return `+51 ${formatPeruvianMobileDisplay(digits)}`;
  }
  return normalized;
}
