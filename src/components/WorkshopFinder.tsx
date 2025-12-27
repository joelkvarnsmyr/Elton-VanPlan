import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Star, ExternalLink, Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Contact } from '@/types/types';
import { calculateDistance, formatDistance, estimateTravelTime } from '@/services/location';

interface Workshop {
    place_id: string;
    name: string;
    vicinity: string; // Address
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: {
        open_now?: boolean;
    };
    formatted_phone_number?: string;
    types?: string[];
    distance?: number; // Computed runtime based on user location
}

interface WorkshopFinderProps {
    userLocation?: { lat: number; lng: number; city: string };
    vehicleMake?: string; // e.g., "Volvo" to prioritize brand workshops
    onAddContact: (contact: Contact) => void;
    onRequestLocation: () => void;
}

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

export const WorkshopFinder: React.FC<WorkshopFinderProps> = ({
    userLocation,
    vehicleMake,
    onAddContact,
    onRequestLocation
}) => {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchRadius, setSearchRadius] = useState(20000); // 20 km default
    const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

    useEffect(() => {
        if (userLocation) {
            searchNearbyWorkshops();
        }
    }, [userLocation, searchRadius]);

    const searchNearbyWorkshops = async () => {
        if (!userLocation) return;
        if (!GOOGLE_PLACES_API_KEY) {
            setError('Google Places API-nyckel saknas. Lägg till VITE_GOOGLE_PLACES_API_KEY i .env');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Use Google Places API Nearby Search
            const proxyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
            const params = new URLSearchParams({
                location: `${userLocation.lat},${userLocation.lng}`,
                radius: searchRadius.toString(),
                type: 'car_repair',
                keyword: vehicleMake || 'bilverkstad',
                key: GOOGLE_PLACES_API_KEY
            });

            // Note: This requires a backend proxy due to CORS restrictions
            // For now, we'll use a mock response or implement a backend proxy
            const response = await fetch(`${proxyUrl}?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch workshops');
            }

            const data = await response.json();

            if (data.status === 'OK') {
                // Sort by rating and distance
                const sortedWorkshops = data.results
                    .map((w: Workshop) => ({
                        ...w,
                        distance: calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            w.geometry.location.lat,
                            w.geometry.location.lng
                        )
                    }))
                    .sort((a: any, b: any) => {
                        // Prioritize brand workshops if vehicleMake is set
                        if (vehicleMake) {
                            const aIsBrand = a.name.toLowerCase().includes(vehicleMake.toLowerCase());
                            const bIsBrand = b.name.toLowerCase().includes(vehicleMake.toLowerCase());
                            if (aIsBrand && !bIsBrand) return -1;
                            if (!aIsBrand && bIsBrand) return 1;
                        }
                        // Then sort by distance
                        return a.distance - b.distance;
                    });

                setWorkshops(sortedWorkshops);
            } else {
                throw new Error(data.error_message || 'Kunde inte hitta verkstäder');
            }
        } catch (err) {
            console.error('Workshop search error:', err);
            setError('Kunde inte hämta verkstäder. Kontrollera API-konfiguration.');

            // Use mock data for development
            setWorkshops(getMockWorkshops(userLocation));
        } finally {
            setIsLoading(false);
        }
    };

    const getMockWorkshops = (location: { lat: number; lng: number }): any[] => {
        // Mock data for development/testing
        return [
            {
                place_id: 'mock_1',
                name: vehicleMake ? `${vehicleMake} Auktoriserad Verkstad` : 'Bilverkstad AB',
                vicinity: 'Industrivägen 12, ' + (userLocation?.city || 'Falun'),
                geometry: {
                    location: {
                        lat: location.lat + 0.01,
                        lng: location.lng + 0.01
                    }
                },
                rating: 4.5,
                user_ratings_total: 127,
                opening_hours: { open_now: true },
                formatted_phone_number: '023-123 45',
                distance: 2.3
            },
            {
                place_id: 'mock_2',
                name: 'Mekonomen MeisterService',
                vicinity: 'Garagevägen 5, ' + (userLocation?.city || 'Falun'),
                geometry: {
                    location: {
                        lat: location.lat - 0.015,
                        lng: location.lng + 0.02
                    }
                },
                rating: 4.2,
                user_ratings_total: 83,
                opening_hours: { open_now: true },
                formatted_phone_number: '023-456 78',
                distance: 3.7
            },
            {
                place_id: 'mock_3',
                name: 'Veteran Bil & Motor',
                vicinity: 'Hantverkaregatan 8, ' + (userLocation?.city || 'Falun'),
                geometry: {
                    location: {
                        lat: location.lat + 0.03,
                        lng: location.lng - 0.01
                    }
                },
                rating: 4.8,
                user_ratings_total: 45,
                opening_hours: { open_now: false },
                formatted_phone_number: '023-789 12',
                distance: 5.1
            }
        ];
    };

    const handleAddToContacts = (workshop: any) => {
        const category = determineCategory(workshop.name, workshop.types);
        const contact: Contact = {
            name: workshop.name,
            phone: workshop.formatted_phone_number || 'Ej tillgänglig',
            location: workshop.vicinity,
            category,
            specialty: vehicleMake ? `${vehicleMake}-specialist` : 'Bilverkstad',
            note: workshop.rating
                ? `Betyg: ${workshop.rating}⭐ (${workshop.user_ratings_total} recensioner). Avstånd: ${formatDistance(workshop.distance)}`
                : `Avstånd: ${formatDistance(workshop.distance)}`
        };

        onAddContact(contact);
        setSelectedWorkshop(null);
    };

    const determineCategory = (name: string, types?: string[]): Contact['category'] => {
        const nameLower = name.toLowerCase();

        if (vehicleMake && nameLower.includes(vehicleMake.toLowerCase())) {
            return 'Märkesverkstad';
        }
        if (nameLower.includes('veteran') || nameLower.includes('klassiker') || nameLower.includes('kaross')) {
            return 'Veteran & Kaross';
        }
        if (nameLower.includes('akut') || nameLower.includes('service')) {
            return 'Service & Akut';
        }

        return 'Service & Akut';
    };

    if (!userLocation) {
        return (
            <div className="bg-white dark:bg-nordic-dark-surface p-8 rounded-3xl shadow-sm text-center">
                <MapPin size={48} className="mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-bold mb-2 dark:text-white">Aktivera platstjänster</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                    För att hitta verkstäder i ditt område behöver vi din plats.
                </p>
                <button
                    onClick={onRequestLocation}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                    <Navigation size={20} />
                    Aktivera platstjänster
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with search controls */}
            <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold dark:text-white">Verkstäder nära dig</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Visar verkstäder inom {searchRadius / 1000} km från {userLocation.city}
                        </p>
                    </div>
                    <button
                        onClick={searchNearbyWorkshops}
                        disabled={isLoading}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-nordic-dark-bg rounded-xl transition-colors"
                        title="Uppdatera sökning"
                    >
                        <RefreshCw size={20} className={`${isLoading ? 'animate-spin' : ''} dark:text-white`} />
                    </button>
                </div>

                {/* Radius selector */}
                <div className="flex gap-2">
                    {[10, 20, 40].map((radius) => (
                        <button
                            key={radius}
                            onClick={() => setSearchRadius(radius * 1000)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${searchRadius === radius * 1000
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 dark:bg-nordic-dark-bg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {radius} km
                        </button>
                    ))}
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-900 dark:text-red-200 font-medium">Kunde inte hämta verkstäder</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-teal-600" />
                </div>
            )}

            {/* Workshop list */}
            {!isLoading && workshops.length > 0 && (
                <div className="space-y-3">
                    {workshops.map((workshop) => (
                        <div
                            key={workshop.place_id}
                            className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-lg dark:text-white">{workshop.name}</h4>
                                        {vehicleMake && workshop.name.toLowerCase().includes(vehicleMake.toLowerCase()) && (
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg">
                                                {vehicleMake}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        {workshop.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{workshop.rating}</span>
                                                <span>({workshop.user_ratings_total})</span>
                                            </div>
                                        )}
                                        {workshop.opening_hours?.open_now !== undefined && (
                                            <span className={workshop.opening_hours.open_now ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                {workshop.opening_hours.open_now ? 'Öppet nu' : 'Stängt'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2 text-sm mb-2">
                                        <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700 dark:text-slate-300">{workshop.vicinity}</span>
                                    </div>

                                    {workshop.distance && (
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-teal-600 dark:text-teal-400 font-medium">
                                                {formatDistance(workshop.distance)} bort
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400">
                                                ca {estimateTravelTime(workshop.distance)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleAddToContacts(workshop)}
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Lägg till
                                    </button>

                                    {workshop.formatted_phone_number && (
                                        <a
                                            href={`tel:${workshop.formatted_phone_number}`}
                                            className="px-4 py-2 bg-slate-100 dark:bg-nordic-dark-bg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Phone size={16} />
                                            Ring
                                        </a>
                                    )}

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(workshop.name + ' ' + workshop.vicinity)}&query_place_id=${workshop.place_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-slate-100 dark:bg-nordic-dark-bg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <ExternalLink size={16} />
                                        Karta
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && workshops.length === 0 && !error && (
                <div className="text-center py-12">
                    <MapPin size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-300">
                        Inga verkstäder hittades inom {searchRadius / 1000} km.
                    </p>
                    <button
                        onClick={() => setSearchRadius(searchRadius * 2)}
                        className="mt-4 text-teal-600 dark:text-teal-400 hover:underline"
                    >
                        Sök inom {(searchRadius * 2) / 1000} km istället
                    </button>
                </div>
            )}
        </div>
    );
};
