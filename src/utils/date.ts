/**
 * Determines whether the current time is before the merchant's cutoff time
 * @param cutoffTime string in "HH:mm" format (e.g., "18:00")
 * @param now optional Date instance for testing/predictability
 */
export function isBeforeCutoff(cutoffTime?: string, now: Date = new Date()): boolean {
  if (!cutoffTime) return true;
  
  const [cutoffHourStr, cutoffMinStr] = cutoffTime.split(':');
  const cutoffHour = parseInt(cutoffHourStr, 10);
  const cutoffMin = parseInt(cutoffMinStr || '0', 10);
  
  if (isNaN(cutoffHour)) return true;
  
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  
  if (currentHour < cutoffHour) return true;
  if (currentHour === cutoffHour && currentMin < cutoffMin) return true;
  return false;
}

/**
 * Returns remaining hours and minutes until cutoff time
 */
export function getTimeUntilCutoff(cutoffTime?: string, now: Date = new Date()): {
  hours: number;
  minutes: number;
  passed: boolean;
} {
  if (!cutoffTime) {
    return { hours: 0, minutes: 0, passed: false };
  }

  const [cutoffHourStr, cutoffMinStr] = cutoffTime.split(':');
  const cutoffHour = parseInt(cutoffHourStr, 10);
  const cutoffMin = parseInt(cutoffMinStr || '0', 10);

  if (isNaN(cutoffHour)) {
    return { hours: 0, minutes: 0, passed: false };
  }

  const cutoffDate = new Date(now);
  cutoffDate.setHours(cutoffHour, cutoffMin, 0, 0);

  const diffMs = cutoffDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, passed: true };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, passed: false };
}

/**
 * Formats a date into Peruvian Spanish logistics standard (e.g. "Jueves 01/10")
 */
export function formatLogisticsDate(date: Date = new Date()): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${dayName} ${day}/${month}`;
}

/**
 * Formats a full readable date string (e.g., "1 de Octubre de 2026, 15:45")
 */
export function formatFullDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export interface FutureScheduleOption {
  value: string;
  dayName: string;
  formattedDate: string;
  badge?: string;
  subtitle: string;
  dateObj: Date;
  isTomorrow: boolean;
}

/**
 * Generates future schedule date options:
 * - 1st option: Tomorrow (+1 day)
 * - Following options: every 2 days afterwards (+3 days, +5 days, +7 days)
 * ONLY future dates are included.
 */
export function getFutureScheduleOptions(now: Date = new Date()): FutureScheduleOption[] {
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

  // Days offset: +1 (tomorrow), then leaving 2 days: +3, +5, +7
  const offsets = [
    { offset: 1, subtitle: 'Día siguiente (Más rápido)', badge: 'Recomendado', isTomorrow: true },
    { offset: 3, subtitle: 'En 3 días', isTomorrow: false },
    { offset: 5, subtitle: 'En 5 días', isTomorrow: false },
    { offset: 7, subtitle: 'En 1 semana', isTomorrow: false },
  ];

  return offsets.map(({ offset, subtitle, badge, isTomorrow }) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(12, 0, 0, 0); // normalize time

    const dayName = daysOfWeek[d.getDay()];
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthName = months[d.getMonth()];

    const value = `${dayName} ${dayNum} de ${monthName}`;

    return {
      value,
      dayName: isTomorrow ? `Mañana (${dayName})` : dayName,
      formattedDate: `${dayNum} ${monthName}`,
      subtitle,
      badge,
      dateObj: d,
      isTomorrow,
    };
  });
}

/**
 * Returns tomorrow's date in YYYY-MM-DD format for HTML date input `min` attribute
 */
export function getTomorrowIsoString(now: Date = new Date()): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
