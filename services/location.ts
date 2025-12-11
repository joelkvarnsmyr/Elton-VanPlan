export interface LocationData {
    city: string;
    region: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    source: 'gps' | 'ip' | 'manual';
    lastUpdated: string;
}

interface IPApiResponse {
    city: string;
    region: string;
    country_name: string;
    latitude: number;
    longitude: number;
}

const LOCATION_CACHE_KEY = 'vanplan_user_location';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get user location using Browser Geolocation API (GPS)
 * Requires HTTPS and user permission
 */
export const getLocationFromGPS = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse geocode to get city name
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                        {
                            headers: {
                                'User-Agent': 'VanPlan/1.0'
                            }
                        }
                    );
                    const data = await response.json();

                    const locationData: LocationData = {
                        city: data.address.city || data.address.town || data.address.village || data.address.municipality || 'Okänd ort',
                        region: data.address.state || data.address.county || '',
                        country: data.address.country || 'Sverige',
                        coordinates: { lat: latitude, lng: longitude },
                        source: 'gps',
                        lastUpdated: new Date().toISOString()
                    };

                    cacheLocation(locationData);
                    resolve(locationData);
                } catch (error) {
                    // Fallback if reverse geocoding fails
                    const locationData: LocationData = {
                        city: 'Okänd ort',
                        region: '',
                        country: 'Sverige',
                        coordinates: { lat: latitude, lng: longitude },
                        source: 'gps',
                        lastUpdated: new Date().toISOString()
                    };
                    cacheLocation(locationData);
                    resolve(locationData);
                }
            },
            (error) => {
                reject(new Error(`GPS error: ${error.message}`));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};

/**
 * Get user location from IP address (fallback)
 * Free tier: 1000 requests/day
 */
export const getLocationFromIP = async (): Promise<LocationData> => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data: IPApiResponse = await response.json();

        const locationData: LocationData = {
            city: data.city || 'Okänd ort',
            region: data.region || '',
            country: data.country_name || 'Sverige',
            coordinates: {
                lat: data.latitude,
                lng: data.longitude
            },
            source: 'ip',
            lastUpdated: new Date().toISOString()
        };

        cacheLocation(locationData);
        return locationData;
    } catch (error) {
        throw new Error('Could not determine location from IP');
    }
};

/**
 * Create location data from manual input
 */
export const createManualLocation = (city: string, region?: string): LocationData => {
    const locationData: LocationData = {
        city,
        region: region || '',
        country: 'Sverige',
        source: 'manual',
        lastUpdated: new Date().toISOString()
    };

    cacheLocation(locationData);
    return locationData;
};

/**
 * Get location with automatic fallback chain:
 * 1. Try GPS (if permission granted)
 * 2. Fallback to IP geolocation
 * 3. Return cached location if available
 */
export const getLocationWithFallback = async (): Promise<LocationData | null> => {
    // Check cache first
    const cached = getCachedLocation();
    if (cached && !isLocationStale(cached)) {
        return cached;
    }

    // Try GPS first
    try {
        const gpsLocation = await getLocationFromGPS();
        return gpsLocation;
    } catch (gpsError) {
        console.log('GPS unavailable, falling back to IP location');

        // Fallback to IP
        try {
            const ipLocation = await getLocationFromIP();
            return ipLocation;
        } catch (ipError) {
            console.error('Both GPS and IP location failed');

            // Return stale cache if available
            if (cached) {
                return cached;
            }

            return null;
        }
    }
};

/**
 * Cache location in localStorage
 */
const cacheLocation = (location: LocationData): void => {
    try {
        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
    } catch (error) {
        console.error('Failed to cache location:', error);
    }
};

/**
 * Get cached location from localStorage
 */
export const getCachedLocation = (): LocationData | null => {
    try {
        const cached = localStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached) as LocationData;
        }
    } catch (error) {
        console.error('Failed to get cached location:', error);
    }
    return null;
};

/**
 * Check if cached location is stale (older than 24 hours)
 */
const isLocationStale = (location: LocationData): boolean => {
    const lastUpdated = new Date(location.lastUpdated).getTime();
    const now = Date.now();
    return (now - lastUpdated) > CACHE_DURATION_MS;
};

/**
 * Clear cached location
 */
export const clearLocationCache = (): void => {
    try {
        localStorage.removeItem(LOCATION_CACHE_KEY);
    } catch (error) {
        console.error('Failed to clear location cache:', error);
    }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

/**
 * Format distance as human-readable string
 */
export const formatDistance = (km: number): string => {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    } else if (km < 10) {
        return `${km.toFixed(1)} km`;
    } else {
        return `${Math.round(km)} km`;
    }
};

/**
 * Estimate travel time (assumes 60 km/h average)
 */
export const estimateTravelTime = (km: number): string => {
    const minutes = Math.round((km / 60) * 60);

    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0
            ? `${hours} h ${remainingMinutes} min`
            : `${hours} h`;
    }
};
