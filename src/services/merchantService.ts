import { MerchantConfig } from '../types/merchant';
import { MOCK_MERCHANTS } from '../config/merchants';

/**
 * Service to fetch merchant configuration.
 * Currently backed by MOCK_MERCHANTS, designed to be swapped with
 * a real REST or GraphQL API (e.g. GET /api/merchants/:id) without changing UI components.
 */
export async function getMerchantById(merchantId?: string | null): Promise<MerchantConfig | null> {
  // Simulate network latency (250ms) for realistic UX and testing loading skeletons
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (!merchantId) {
    return null;
  }

  const normalizedId = merchantId.trim().toLowerCase();
  
  // Find case-insensitive match in mock database
  const matchingKey = Object.keys(MOCK_MERCHANTS).find(
    (key) => key.toLowerCase() === normalizedId
  );

  if (matchingKey) {
    return MOCK_MERCHANTS[matchingKey];
  }

  return null;
}

/**
 * Applies merchant branding colors dynamically as CSS custom properties on :root
 */
export function applyMerchantTheme(merchant?: MerchantConfig | null) {
  if (!merchant) return;

  const root = document.documentElement;
  const primary = merchant.primaryColor || merchant.theme?.primary || '#4f46e5';
  const primaryHover = merchant.theme?.primaryHover || darkenColor(primary, 15);
  const primaryLight = merchant.theme?.primaryLight || lightenColor(primary, 90);
  const primaryForeground = merchant.theme?.primaryForeground || '#ffffff';
  const secondary = merchant.secondaryColor || merchant.theme?.secondary || '#64748b';

  root.style.setProperty('--merchant-primary', primary);
  root.style.setProperty('--merchant-primary-hover', primaryHover);
  root.style.setProperty('--merchant-primary-light', primaryLight);
  root.style.setProperty('--merchant-primary-foreground', primaryForeground);
  root.style.setProperty('--merchant-secondary', secondary);

  // Update meta theme-color for mobile address bar
  const themeMeta = document.getElementById('meta-theme-color');
  if (themeMeta) {
    themeMeta.setAttribute('content', primary);
  }

  // Update document title dynamically
  if (merchant.name) {
    document.title = `${merchant.formTitle || 'Formulario de Envío'} | ${merchant.name}`;
  }
}

/**
 * Simple color helper to darken a hex color
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Simple color helper to lighten a hex color
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
