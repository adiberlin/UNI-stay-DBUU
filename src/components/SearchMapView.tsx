// ============================================================
// src/components/SearchMapView.tsx — Interactive Search Map View
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadGoogleMaps, DBUU_COORDINATES, getPropertyCoordinates } from '../utils/googleMaps';
import type { Property } from '../types/property';

interface SearchMapViewProps {
  properties: Property[];
  onSelectProperty?: (property: Property | null) => void;
}

export function SearchMapView({ properties, onSelectProperty }: SearchMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    let mapInstance: any = null;
    let markers: any[] = [];
    let activeInfoWindow: any = null;

    if (!mapRef.current) return;

    loadGoogleMaps()
      .then((maps) => {
        if (!mapRef.current) return;

        mapInstance = new maps.Map(mapRef.current, {
          center: { lat: DBUU_COORDINATES.lat, lng: DBUU_COORDINATES.lng },
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // 1. Add DBUU Campus Landmark
        const dbuuMarker = new maps.Marker({
          position: { lat: DBUU_COORDINATES.lat, lng: DBUU_COORDINATES.lng },
          map: mapInstance,
          title: DBUU_COORDINATES.title,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
        });

        const dbuuInfoWindow = new maps.InfoWindow({
          content: `
            <div style="padding: 6px; font-family: system-ui, sans-serif;">
              <strong style="color: #4f46e5; font-size: 13px;">🎓 Dev Bhoomi Uttarakhand University</strong>
              <p style="margin: 3px 0 0 0; font-size: 11px; color: #6b7280;">Manduwala, Dehradun</p>
            </div>
          `,
        });

        dbuuMarker.addListener('click', () => {
          if (activeInfoWindow) activeInfoWindow.close();
          dbuuInfoWindow.open(mapInstance, dbuuMarker);
          activeInfoWindow = dbuuInfoWindow;
        });

        // 2. Add Property Markers
        const bounds = new maps.LatLngBounds();
        bounds.extend(new maps.LatLng(DBUU_COORDINATES.lat, DBUU_COORDINATES.lng));

        properties.forEach((prop) => {
          const coords = prop.coordinates || getPropertyCoordinates(prop.location, prop.distanceFromDBUU);
          const latLng = new maps.LatLng(coords.lat, coords.lng);
          bounds.extend(latLng);

          const isOccupied = prop.availabilityStatus === 'OCCUPIED';

          const marker = new maps.Marker({
            position: coords,
            map: mapInstance,
            title: prop.title,
            icon: {
              url: isOccupied
                ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            },
          });

          const infoContent = `
            <div style="padding: 4px; max-width: 220px; font-family: system-ui, sans-serif;">
              <img 
                src="${prop.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&q=80'}" 
                alt="${prop.title}" 
                style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;"
              />
              <strong style="font-size: 13px; color: #111827; display: block; line-height: 1.2;">${prop.title}</strong>
              <div style="margin: 4px 0; font-size: 12px; font-weight: bold; color: #4f46e5;">
                ₹${prop.price.toLocaleString('en-IN')}<span style="font-size: 10px; font-weight: normal; color: #6b7280;">/month</span>
              </div>
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #4b5563;">
                📍 ${prop.distanceFromDBUU} km from DBUU • ${prop.type}
              </p>
              <a 
                href="/property/${prop.id}" 
                style="display: block; text-align: center; background: #4f46e5; color: #ffffff; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;"
              >
                View Details ➔
              </a>
            </div>
          `;

          const infoWindow = new maps.InfoWindow({
            content: infoContent,
          });

          marker.addListener('click', () => {
            if (activeInfoWindow) activeInfoWindow.close();
            infoWindow.open(mapInstance, marker);
            activeInfoWindow = infoWindow;
            setSelectedProperty(prop);
            if (onSelectProperty) onSelectProperty(prop);
          });

          markers.push(marker);
        });

        if (properties.length > 0) {
          mapInstance.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
        }

        setMapLoaded(true);
      })
      .catch((err) => {
        console.warn('Google Maps loading error on Search:', err);
      });
  }, [properties]);

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      <div ref={mapRef} className="w-full h-full" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-xs text-gray-500 text-sm gap-2">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading Google Map with {properties.length} stays near DBUU...
        </div>
      )}

      {/* Floating Property Card preview if selected */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-xl z-10">
          <div className="flex gap-3">
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.title}
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="badge bg-indigo-100 text-indigo-700 text-2xs py-0.5 px-2">
                {selectedProperty.type} • {selectedProperty.distanceFromDBUU} km from DBUU
              </span>
              <h4 className="font-bold text-gray-900 text-sm truncate mt-1">{selectedProperty.title}</h4>
              <p className="text-xs font-black text-indigo-600 mt-0.5">
                ₹{selectedProperty.price.toLocaleString('en-IN')}/mo
              </p>
              <Link
                to={`/property/${selectedProperty.id}`}
                className="mt-2 block text-center text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 rounded-lg transition-colors"
              >
                View Full Details ➔
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
