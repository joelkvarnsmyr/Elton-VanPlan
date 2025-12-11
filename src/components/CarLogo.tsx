/**
 * CarLogo Component
 *
 * Displays a vehicle brand logo using react-icons (Simple Icons) with smart fallback
 * to generic car icon if brand is not supported.
 *
 * Usage:
 * ```tsx
 * <CarLogo make="Volvo" size={48} />
 * <CarLogo make="Tesla" size={24} className="text-blue-500" />
 * ```
 */

import React from 'react';
import { IconType } from 'react-icons';
import { Car } from 'lucide-react';

// Import all supported car brand logos from Simple Icons
import {
  SiVolvo,
  SiTesla,
  SiBmw,
  SiFord,
  SiToyota,
  SiMercedes,
  SiAudi,
  SiVolkswagen,
  SiPorsche,
  SiFerrari,
  SiLamborghini,
  SiMaserati,
  SiMclaren,
  SiBugatti,
  SiRollsroyce,
  SiBentley,
  SiAstonmartin,
  SiJaguar,
  SiLandrover,
  SiMini,
  SiPeugeot,
  SiRenault,
  SiCitroen,
  SiFiat,
  SiAlfaromeo,
  SiSkoda,
  SiSeat,
  SiOpel,
  SiMazda,
  SiHonda,
  SiNissan,
  SiMitsubishi,
  SiSubaru,
  SiSuzuki,
  SiHyundai,
  SiKia,
  SiChevrolet,
} from 'react-icons/si';

/**
 * Brand logo mapping
 * Maps normalized brand names to their Simple Icons components
 */
const BRAND_LOGOS: Record<string, IconType> = {
  // European brands
  'volvo': SiVolvo,
  'bmw': SiBmw,
  'mercedes': SiMercedes,
  'mercedes-benz': SiMercedes,
  'audi': SiAudi,
  'volkswagen': SiVolkswagen,
  'vw': SiVolkswagen,
  'porsche': SiPorsche,
  'ferrari': SiFerrari,
  'lamborghini': SiLamborghini,
  'maserati': SiMaserati,
  'mclaren': SiMclaren,
  'bugatti': SiBugatti,
  'rolls-royce': SiRollsroyce,
  'rollsroyce': SiRollsroyce,
  'bentley': SiBentley,
  'aston martin': SiAstonmartin,
  'astonmartin': SiAstonmartin,
  'jaguar': SiJaguar,
  'land rover': SiLandrover,
  'landrover': SiLandrover,
  'mini': SiMini,
  'peugeot': SiPeugeot,
  'renault': SiRenault,
  'citroen': SiCitroen,
  'citroën': SiCitroen,
  'fiat': SiFiat,
  'alfa romeo': SiAlfaromeo,
  'alfaromeo': SiAlfaromeo,
  'skoda': SiSkoda,
  'škoda': SiSkoda,
  'seat': SiSeat,
  'opel': SiOpel,

  // Japanese brands
  'toyota': SiToyota,
  'mazda': SiMazda,
  'honda': SiHonda,
  'nissan': SiNissan,
  'mitsubishi': SiMitsubishi,
  'subaru': SiSubaru,
  'suzuki': SiSuzuki,

  // Korean brands
  'hyundai': SiHyundai,
  'kia': SiKia,

  // American brands
  'tesla': SiTesla,
  'ford': SiFord,
  'chevrolet': SiChevrolet,
  'chevy': SiChevrolet,
};

/**
 * Official brand colors for accurate representation
 * These colors are sourced from official brand guidelines
 */
const BRAND_COLORS: Record<string, string> = {
  'volvo': '#003057',
  'tesla': '#E82127',
  'bmw': '#0066B1',
  'ford': '#003478',
  'toyota': '#EB0A1E',
  'mercedes': '#00ADEF',
  'mercedes-benz': '#00ADEF',
  'audi': '#BB0A30',
  'volkswagen': '#001E50',
  'vw': '#001E50',
  'porsche': '#D5001C',
  'ferrari': '#DC0000',
  'lamborghini': '#FFD700',
  'maserati': '#0C2340',
  'mclaren': '#FF8700',
  'bugatti': '#BE0F34',
  'rolls-royce': '#680021',
  'rollsroyce': '#680021',
  'bentley': '#00A550',
  'jaguar': '#006D5B',
  'land rover': '#005A2B',
  'landrover': '#005A2B',
  'mini': '#000000',
  'peugeot': '#002FA7',
  'renault': '#FFCC33',
  'citroen': '#C8102E',
  'citroën': '#C8102E',
  'fiat': '#A6192E',
  'alfa romeo': '#9B0000',
  'alfaromeo': '#9B0000',
  'skoda': '#4BA82E',
  'škoda': '#4BA82E',
  'mazda': '#C8102E',
  'honda': '#E40521',
  'nissan': '#C3002F',
  'mitsubishi': '#E60012',
  'subaru': '#003D7C',
  'suzuki': '#EB2226',
  'lexus': '#000000',
  'hyundai': '#002C5F',
  'kia': '#BB162B',
  'chevrolet': '#FFC72C',
  'chevy': '#FFC72C',
  'dodge': '#C8102E',
  'jeep': '#154734',
  'ram': '#E30613',
  'cadillac': '#000000',
  'gmc': '#C8102E',
};

/**
 * Normalize brand name for lookup
 * Handles case, spaces, and common variations
 */
function normalizeBrandName(make: string): string {
  return make
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .replace(/-/g, ' '); // Convert hyphens to spaces for matching
}

/**
 * Get the logo component for a brand
 */
function getBrandLogo(make: string): IconType | null {
  const normalized = normalizeBrandName(make);

  // Direct match
  if (BRAND_LOGOS[normalized]) {
    return BRAND_LOGOS[normalized];
  }

  // Try without spaces (e.g., "Land Rover" → "landrover")
  const noSpaces = normalized.replace(/\s+/g, '');
  if (BRAND_LOGOS[noSpaces]) {
    return BRAND_LOGOS[noSpaces];
  }

  // Try with hyphens (e.g., "Aston Martin" → "aston-martin")
  const withHyphens = normalized.replace(/\s+/g, '-');
  if (BRAND_LOGOS[withHyphens]) {
    return BRAND_LOGOS[withHyphens];
  }

  return null;
}

/**
 * Get the official brand color
 */
function getBrandColor(make: string): string | undefined {
  const normalized = normalizeBrandName(make);

  // Direct match
  if (BRAND_COLORS[normalized]) {
    return BRAND_COLORS[normalized];
  }

  // Try without spaces
  const noSpaces = normalized.replace(/\s+/g, '');
  if (BRAND_COLORS[noSpaces]) {
    return BRAND_COLORS[noSpaces];
  }

  // Try with hyphens
  const withHyphens = normalized.replace(/\s+/g, '-');
  if (BRAND_COLORS[withHyphens]) {
    return BRAND_COLORS[withHyphens];
  }

  return undefined;
}

/**
 * CarLogo Component Props
 */
export interface CarLogoProps {
  /** Vehicle brand/make (e.g., "Volvo", "Tesla") */
  make: string;

  /** Size in pixels (default: 32) */
  size?: number;

  /** Additional CSS classes */
  className?: string;

  /** Override color (uses brand color by default) */
  color?: string;

  /** Show fallback icon if brand not found (default: true) */
  showFallback?: boolean;

  /** Fallback icon component (default: Car from lucide-react) */
  fallbackIcon?: React.ReactNode;
}

/**
 * CarLogo Component
 *
 * Displays a vehicle brand logo with smart fallback.
 */
export const CarLogo: React.FC<CarLogoProps> = ({
  make,
  size = 32,
  className = '',
  color,
  showFallback = true,
  fallbackIcon,
}) => {
  const LogoComponent = getBrandLogo(make);
  const brandColor = color || getBrandColor(make);

  // If we have a logo, render it
  if (LogoComponent) {
    return (
      <LogoComponent
        size={size}
        color={brandColor}
        className={className}
        aria-label={`${make} logo`}
      />
    );
  }

  // Fallback: Show generic car icon
  if (showFallback) {
    if (fallbackIcon) {
      return <>{fallbackIcon}</>;
    }

    return (
      <Car
        size={size}
        className={className}
        aria-label={`${make} (generic car icon)`}
      />
    );
  }

  // No logo and no fallback
  return null;
};

/**
 * Hook to check if a brand logo is available
 */
export const useHasBrandLogo = (make: string): boolean => {
  return getBrandLogo(make) !== null;
};

/**
 * Get all supported brand names
 */
export const getSupportedBrands = (): string[] => {
  return Object.keys(BRAND_LOGOS);
};

export default CarLogo;
