/**
 * CarLogo Component
 *
 * Displays vehicle brand logos using car-logos-dataset (387 brands).
 * Uses PNG images from CDN with smart fallback to generic car icon.
 *
 * Dataset: https://github.com/filippofilip95/car-logos-dataset
 *
 * Usage:
 * ```tsx
 * <CarLogo make="Volvo" size={48} />
 * <CarLogo make="Tesla" size={24} className="rounded-full" />
 * ```
 */

import React, { useState } from 'react';
import { Car } from 'lucide-react';
import carLogosData from '@/assets/logos/data.json';

/**
 * Car logo data structure from car-logos-dataset
 */
interface CarLogoData {
  name: string;
  slug: string;
  image: {
    source: string;
    thumb: string;
    optimized: string;
    original: string;
    localThumb: string;
    localOptimized: string;
    localOriginal: string;
  };
}

/**
 * Normalize brand name for matching
 * Handles case, spaces, special characters
 */
function normalizeBrandName(make: string): string {
  return make
    .toLowerCase()
    .trim()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric
}

/**
 * Find logo data for a brand
 */
function findLogoData(make: string): CarLogoData | null {
  if (!make) return null;

  const normalized = normalizeBrandName(make);
  const logoData = carLogosData as CarLogoData[];

  // Try exact slug match first
  const exactMatch = logoData.find(
    (logo) => logo.slug === normalized
  );
  if (exactMatch) return exactMatch;

  // Try normalized name match
  const nameMatch = logoData.find(
    (logo) => normalizeBrandName(logo.name) === normalized
  );
  if (nameMatch) return nameMatch;

  // Try partial match (e.g., "Mercedes" matches "Mercedes-Benz")
  const partialMatch = logoData.find(
    (logo) =>
      normalizeBrandName(logo.name).includes(normalized) ||
      normalized.includes(normalizeBrandName(logo.name))
  );
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * Get appropriate image URL based on size
 */
function getImageUrl(logoData: CarLogoData, size: number, useCdn: boolean = true): string {
  const { image } = logoData;

  if (useCdn) {
    // Use CDN images (faster, no bundling)
    return size <= 40 ? image.thumb : image.optimized;
  } else {
    // Use local images (fallback)
    return size <= 40 ? image.localThumb : image.localOptimized;
  }
}

/**
 * CarLogo Component Props
 */
export interface CarLogoProps {
  /** Vehicle brand/make (e.g., "Volvo", "Tesla", "Mercedes-Benz") */
  make: string;

  /** Size in pixels (default: 32) */
  size?: number;

  /** Additional CSS classes */
  className?: string;

  /** Show fallback icon if brand not found (default: true) */
  showFallback?: boolean;

  /** Custom fallback icon */
  fallbackIcon?: React.ReactNode;

  /** Alt text for image (default: "{make} logo") */
  alt?: string;

  /** Use local images instead of CDN (default: false) */
  useLocal?: boolean;
}

/**
 * CarLogo Component
 *
 * Renders a vehicle brand logo from car-logos-dataset.
 * Displays 387+ brand logos with smart fallback.
 */
export const CarLogo: React.FC<CarLogoProps> = ({
  make,
  size = 32,
  className = '',
  showFallback = true,
  fallbackIcon,
  alt,
  useLocal = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [useCdn, setUseCdn] = useState(!useLocal);

  const logoData = findLogoData(make);

  // No logo found - show fallback
  if (!logoData || imageError) {
    if (!showFallback) return null;

    if (fallbackIcon) {
      return <>{fallbackIcon}</>;
    }

    return (
      <Car
        size={size}
        className={`text-slate-400 ${className}`}
        aria-label={`${make} (generic car icon)`}
      />
    );
  }

  const imageUrl = getImageUrl(logoData, size, useCdn);
  const altText = alt || `${logoData.name} logo`;

  return (
    <img
      src={imageUrl}
      alt={altText}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => {
        // If CDN fails, try local images
        if (useCdn) {
          setUseCdn(false);
        } else {
          // Both CDN and local failed - show fallback
          setImageError(true);
        }
      }}
      loading="lazy"
    />
  );
};

/**
 * Hook to check if a brand logo is available
 */
export const useHasBrandLogo = (make: string): boolean => {
  return findLogoData(make) !== null;
};

/**
 * Get all supported brand names
 */
export const getSupportedBrands = (): string[] => {
  const logoData = carLogosData as CarLogoData[];
  return logoData.map((logo) => logo.name);
};

/**
 * Get brand count
 */
export const getBrandCount = (): number => {
  return (carLogosData as CarLogoData[]).length;
};

export default CarLogo;
