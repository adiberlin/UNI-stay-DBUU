// ============================================================
// src/components/PropertyMap.tsx — Interactive Google Map for Property
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, School, Footprints, Bike } from 'lucide-react';
import { loadGoogleMaps, DBUU_COORDINATES, getPropertyCoordinates, getGoogleMapsDirectionsUrl } from '../utils/googleMaps';
import type { Property } from '../types/property';

interface PropertyMapProps {
  property: Property;
}

export function PropertyMap({ property }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const coords = property.coordinates || getPropertyCoordinates(property.location, property.distanceFromDBUU);
  const directionsUrl = getGoogleMapsDirectionsUrl(coords);

  const walkingMinutes = Math.max(1, Math.round((property.distanceFromDBUU * 1000) / 80));
  const ridingMinutes = Math.max(1, Math.round((property.distanceFromDBUU * 1000) / 400));

  useEffect(() => {
    let mapInstance: any = null;

    if (!mapRef.current) return;

    loadGoogleMaps()
      .then((maps) => {
        if (!mapRef.current) return;

        // Calculate center between DBUU and Property
        const centerLat = (DBUU_COORDINATES.lat + coords.lat) / 2;
        const centerLng = (DBUU_COORDINATES.lng + coords.lng) / 2;

        mapInstance = new maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: property.distanceFromDBUU <= 1 ? 15 : property.distanceFromDBUU <= 3 ? 14 : 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi.school',
              elementType: 'geometry',
              stylers: [{ color: '#e2d9f3' }],
            },
            {
              featureType: 'poi.school',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'on' }],
            },
          ],
        });

        // 1. DBUU Marker
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
              <p style="margin: 3px 0 0 0; font-size: 11px; color: #6b7280;">Main Campus, Manduwala</p>
            </div>
          `,
        });

        dbuuMarker.addListener('click', () => {
          dbuuInfoWindow.open(mapInstance, dbuuMarker);
        });

        // 2. Property Marker
        const propertyMarker = new maps.Marker({
          position: { lat: coords.lat, lng: coords.lng },
          map: mapInstance,
          title: property.title,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          },
        });

        const propertyInfoWindow = new maps.InfoWindow({
          content: `
            <div style="padding: 6px; font-family: system-ui, sans-serif; max-width: 200px;">
              <strong style="color: #111827; font-size: 13px;">${property.title}</strong>
              <p style="margin: 2px 0; font-size: 11px; color: #4f46e5; font-weight: bold;">₹${property.price.toLocaleString('en-IN')}/mo</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">📍 ${property.distanceFromDBUU} km from DBUU Campus</p>
            </div>
          `,
        });

        propertyInfoWindow.open(mapInstance, propertyMarker);

        propertyMarker.addListener('click', () => {
          propertyInfoWindow.open(mapInstance, propertyMarker);
        });

        // 3. Connect line between DBUU and property
        new maps.Polyline({
          path: [
            { lat: DBUU_COORDINATES.lat, lng: DBUU_COORDINATES.lng },
            { lat: coords.lat, lng: coords.lng },
          ],
          geodesic: true,
          strokeColor: '#4f46e5',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: mapInstance,
        });

        setMapLoaded(true);
      })
      .catch((err) => {
        console.warn('Google Maps loading error:', err);
        setLoadError(true);
      });
  }, [property, coords]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-indigo-100 text-indigo-700">📍 Campus Proximity</span>
          </div>
          <h2 className="font-bold text-gray-900 text-lg mt-1">Location & Route to DBUU</h2>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl transition-all w-fit"
        >
          <Navigation size={13} />
          Get Google Maps Directions
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 mb-4">
        <div ref={mapRef} className="w-full h-full" />

        {!mapLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-xs text-gray-500 text-sm gap-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Loading Google Map...
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <MapPin size={32} className="text-indigo-400 mb-2" />
            <p className="font-bold text-gray-800 text-sm">{property.location}</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">📍 {property.distanceFromDBUU} km from Dev Bhoomi University</p>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <Navigation size={13} /> View on Google Maps
            </a>
          </div>
        )}
      </div>

      {/* Proximity & Travel Times breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <School size={18} />
          </div>
          <div>
            <p className="text-2xs text-gray-400 font-semibold uppercase">DBUU Distance</p>
            <p className="text-sm font-bold text-gray-800">{property.distanceFromDBUU} km away</p>
          </div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Footprints size={18} />
          </div>
          <div>
            <p className="text-2xs text-gray-400 font-semibold uppercase">Walking Time</p>
            <p className="text-sm font-bold text-gray-800">~{walkingMinutes} mins walk</p>
          </div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Bike size={18} />
          </div>
          <div>
            <p className="text-2xs text-gray-400 font-semibold uppercase">Scooty / Bike</p>
            <p className="text-sm font-bold text-gray-800">~{ridingMinutes} mins ride</p>
          </div>
        </div>
      </div>
    </div>
  );
}
