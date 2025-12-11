/**
 * CarLogo Component
 *
 * Displays a vehicle brand logo using car-logos-dataset (387+ brands) with smart fallback
 * to generic car icon if brand is not supported.
 *
 * This component uses PNG images from car-logos-dataset, NOT react-icons.
 * NOTE: This is separate from the AI-generated project icon (customIcon),
 * which shows a flat-design illustration of the specific vehicle.
 *
 * Usage:
 * ```tsx
 * <CarLogo make="Volvo" size={48} />
 * <CarLogo make="Tesla" size={24} className="rounded-full" />
 * ```
 */

import React, { useMemo } from 'react';
import { Car } from 'lucide-react';
import carLogosData from '../data/car-logos.json';

/**
 * Car brand logo data structure
 */
interface CarBrandLogo {
  name: string;
  slug: string;
  image: {
    thumb: string;
    optimized: string;
    original: string;
  };
}

/**
 * Normalize brand name for lookup
 * Handles case, spaces, and common variations
 */
function normalizeBrandName(make: string): string {
  return make
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Convert spaces to hyphens (e.g., "Alfa Romeo" → "alfa-romeo")
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[éè]/g, 'e');
}

/**
 * Get logo data for a brand
 */
function getBrandLogoData(make: string): CarBrandLogo | null {
  const normalized = normalizeBrandName(make);

  // Direct slug match
  const directMatch = (carLogosData as CarBrandLogo[]).find(
    (brand) => brand.slug === normalized
  );
  if (directMatch) return directMatch;

  // Try partial match (e.g., "Mercedes" matches "mercedes-benz")
  const partialMatch = (carLogosData as CarBrandLogo[]).find(
    (brand) => brand.slug.includes(normalized) || normalized.includes(brand.slug)
  );
  if (partialMatch) return partialMatch;

  // Try name match (case-insensitive)
  const nameMatch = (carLogosData as CarBrandLogo[]).find(
    (brand) => brand.name.toLowerCase() === make.toLowerCase()
  );
  if (nameMatch) return nameMatch;

  return null;
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

  /** Show fallback icon if brand not found (default: true) */
  showFallback?: boolean;

  /** Fallback icon component (default: Car from lucide-react) */
  fallbackIcon?: React.ReactNode;

  /** Use optimized or thumb version (default: 'thumb') */
  imageVariant?: 'thumb' | 'optimized' | 'original';
}

/**
 * CarLogo Component
 *
 * Displays a vehicle brand logo with smart fallback.
 * Supports 387+ car brands from car-logos-dataset.
 */
export const CarLogo: React.FC<CarLogoProps> = ({
  make,
  size = 32,
  className = '',
  showFallback = true,
  fallbackIcon,
  imageVariant = 'thumb',
}) => {
  const logoData = useMemo(() => getBrandLogoData(make), [make]);

  // If we have a logo, render it
  if (logoData) {
    const imageUrl = logoData.image[imageVariant];

    return (
      <img
        src={imageUrl}
        alt={`${logoData.name} logo`}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        loading="lazy"
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
  return getBrandLogoData(make) !== null;
};

/**
 * Get all supported brand names
 */
export const getSupportedBrands = (): string[] => {
  return (carLogosData as CarBrandLogo[]).map((brand) => brand.name);
};

/**
 * Get all supported brand slugs
 */
export const getSupportedBrandSlugs = (): string[] => {
  return (carLogosData as CarBrandLogo[]).map((brand) => brand.slug);
};

export default CarLogo;
