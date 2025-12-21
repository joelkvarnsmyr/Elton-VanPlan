/**
 * Formatting Utilities
 *
 * Centralized formatting functions to avoid duplication across components.
 * All formatting follows Swedish locale and conventions.
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { sv } from 'date-fns/locale';

// ===========================
// CURRENCY FORMATTING
// ===========================

/**
 * Format number as Swedish currency (SEK)
 * @param amount - The amount to format
 * @param options - Formatting options
 */
export function formatCurrency(
  amount: number | undefined | null,
  options: {
    showDecimals?: boolean;
    showSymbol?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showDecimals = false, showSymbol = true, compact = false } = options;

  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? '0 kr' : '0';
  }

  if (compact && Math.abs(amount) >= 1000) {
    const formatted = new Intl.NumberFormat('sv-SE', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
    return showSymbol ? `${formatted} kr` : formatted;
  }

  const formatted = new Intl.NumberFormat('sv-SE', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'SEK',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0
  }).format(amount);

  return formatted;
}

/**
 * Alias for formatCurrency (backwards compatibility)
 */
export const formatSEK = formatCurrency;

/**
 * Format price range
 */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) {
    return formatCurrency(min);
  }
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

// ===========================
// NUMBER FORMATTING
// ===========================

/**
 * Format number with Swedish thousands separator
 */
export function formatNumber(
  value: number | undefined | null,
  options: {
    decimals?: number;
    unit?: string;
  } = {}
): string {
  const { decimals = 0, unit } = options;

  if (value === undefined || value === null || isNaN(value)) {
    return unit ? `0 ${unit}` : '0';
  }

  const formatted = new Intl.NumberFormat('sv-SE', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format mileage (Swedish: mil = 10 km)
 */
export function formatMileage(
  kilometers: number | undefined | null,
  options: {
    useMil?: boolean; // Use Swedish "mil" (10 km) instead of km
    showUnit?: boolean;
  } = {}
): string {
  const { useMil = true, showUnit = true } = options;

  if (kilometers === undefined || kilometers === null || isNaN(kilometers)) {
    return showUnit ? (useMil ? '0 mil' : '0 km') : '0';
  }

  if (useMil) {
    const mil = kilometers / 10;
    const formatted = formatNumber(mil, { decimals: mil < 100 ? 1 : 0 });
    return showUnit ? `${formatted} mil` : formatted;
  }

  const formatted = formatNumber(kilometers);
  return showUnit ? `${formatted} km` : formatted;
}

/**
 * Format fuel consumption (l/100km or l/mil)
 */
export function formatFuelConsumption(
  litersPer100km: number | undefined | null,
  useMil: boolean = true
): string {
  if (litersPer100km === undefined || litersPer100km === null || isNaN(litersPer100km)) {
    return useMil ? '0 l/mil' : '0 l/100km';
  }

  if (useMil) {
    // Convert l/100km to l/mil (1 mil = 10 km)
    const litersPerMil = litersPer100km / 10;
    return `${formatNumber(litersPerMil, { decimals: 2 })} l/mil`;
  }

  return `${formatNumber(litersPer100km, { decimals: 1 })} l/100km`;
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number | undefined | null,
  options: {
    decimals?: number;
    showSign?: boolean;
  } = {}
): string {
  const { decimals = 0, showSign = false } = options;

  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }

  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, { decimals })}%`;
}

// ===========================
// DATE FORMATTING
// ===========================

/**
 * Format date in Swedish locale
 */
export function formatDate(
  date: Date | string | undefined | null,
  formatStr: string = 'd MMM yyyy'
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return '';
  }

  return format(dateObj, formatStr, { locale: sv });
}

/**
 * Format date as relative time (e.g., "3 dagar sedan")
 */
export function formatRelativeTime(
  date: Date | string | undefined | null,
  options: {
    addSuffix?: boolean;
  } = {}
): string {
  const { addSuffix = true } = options;

  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return '';
  }

  return formatDistanceToNow(dateObj, { locale: sv, addSuffix });
}

/**
 * Format date range
 */
export function formatDateRange(
  start: Date | string | undefined | null,
  end: Date | string | undefined | null
): string {
  const startStr = formatDate(start, 'd MMM');
  const endStr = formatDate(end, 'd MMM yyyy');

  if (!startStr && !endStr) return '';
  if (!startStr) return endStr;
  if (!endStr) return startStr;

  return `${startStr} – ${endStr}`;
}

/**
 * Common date formats
 */
export const DATE_FORMATS = {
  short: 'd MMM',           // 5 dec
  medium: 'd MMM yyyy',     // 5 dec 2025
  long: 'd MMMM yyyy',      // 5 december 2025
  full: 'EEEE d MMMM yyyy', // fredag 5 december 2025
  time: 'HH:mm',            // 14:30
  datetime: 'd MMM HH:mm',  // 5 dec 14:30
  iso: 'yyyy-MM-dd',        // 2025-12-05
} as const;

// ===========================
// TEXT FORMATTING
// ===========================

/**
 * Truncate text with ellipsis
 */
export function truncate(
  text: string | undefined | null,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string | undefined | null): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Format phone number (Swedish format)
 */
export function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return '';

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Swedish mobile: 07X XXX XX XX
  if (digits.startsWith('07') && digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }

  // Swedish landline: 0XX-XXX XX XX
  if (digits.startsWith('0') && digits.length >= 9) {
    const areaCode = digits.slice(0, digits.length === 9 ? 2 : 3);
    const rest = digits.slice(areaCode.length);
    return `${areaCode}-${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5)}`;
  }

  // International: +46 ...
  if (digits.startsWith('46') && digits.length >= 11) {
    return `+46 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }

  return phone;
}

/**
 * Format registration number (Swedish)
 */
export function formatRegNo(regNo: string | undefined | null): string {
  if (!regNo) return '';

  // Normalize: uppercase, remove spaces
  const normalized = regNo.toUpperCase().replace(/\s/g, '');

  // Format: ABC 123 or ABC 12D
  if (normalized.length === 6) {
    return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
  }

  return normalized;
}

// ===========================
// FILE SIZE FORMATTING
// ===========================

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

// ===========================
// TASK STATUS FORMATTING
// ===========================

/**
 * Status color mapping for Tailwind classes
 */
export const STATUS_COLORS = {
  'Idé & Research': {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-900 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-900'
  },
  'Att göra': {
    bg: 'bg-nordic-pink dark:bg-rose-900/40',
    text: 'text-rose-900 dark:text-rose-200',
    border: 'border-rose-200 dark:border-rose-900'
  },
  'Pågående': {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-900 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-900'
  },
  'Klart': {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-900 dark:text-green-200',
    border: 'border-green-200 dark:border-green-900'
  },
  'Blockerad': {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-900 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-900'
  }
} as const;

/**
 * Get status badge classes
 */
export function getStatusClasses(status: string): string {
  const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (!colors) {
    return 'bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-900';
  }
  return `${colors.bg} ${colors.text} ${colors.border}`;
}

/**
 * Priority color mapping
 */
export const PRIORITY_COLORS = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-orange-600 dark:text-orange-400',
  critical: 'text-red-600 dark:text-red-400'
} as const;

/**
 * Get priority color class
 */
export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
}
