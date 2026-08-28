// ============================================================
// src/utils/googleMaps.ts — Google Maps API Loader & Helpers
// ============================================================

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyD8lUNMgFhHWoIUibfL1jem6NSa8wWKHYk';

// DBUU (Dev Bhoomi Uttarakhand University, Manduwala, Dehradun) coordinates
export const DBUU_COORDINATES = {
  lat: 30.395642,
  lng: 77.874136,
  title: 'Dev Bhoomi Uttarakhand University (DBUU)',
  address: 'Navgaon, Manduwala, Dehradun, Uttarakhand 248007',
};

// Known coordinates for areas around DBUU
export const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Manduwala: { lat: 30.398, lng: 77.872 },
  'University Road': { lat: 30.3965, lng: 77.8755 },
  Selaqui: { lat: 30.3685, lng: 77.859 },
  Bidholi: { lat: 30.415, lng: 77.882 },
  'Prem Nagar': { lat: 30.342, lng: 77.948 },
  Sudhowala: { lat: 30.36, lng: 77.91 },
  Navgaon: { lat: 30.395, lng: 77.873 },
  'Chakrata Road': { lat: 30.375, lng: 77.885 },
};

export function getPropertyCoordinates(locationStr: string, distanceFromDBUU: number = 1): { lat: number; lng: number } {
  for (const [area, coords] of Object.entries(AREA_COORDINATES)) {
    if (locationStr.toLowerCase().includes(area.toLowerCase())) {
      return coords;
    }
  }

  // Offset slightly based on distance if exact area not in dictionary
  const latOffset = (distanceFromDBUU * 0.008) * (Math.sin(distanceFromDBUU));
  const lngOffset = (distanceFromDBUU * 0.008) * (Math.cos(distanceFromDBUU));

  return {
    lat: DBUU_COORDINATES.lat + (latOffset || 0.004),
    lng: DBUU_COORDINATES.lng + (lngOffset || 0.004),
  };
}

let googleMapsPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('Window not defined'));
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve((window as any).google.maps));
        existingScript.addEventListener('error', (e) => reject(e));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if ((window as any).google?.maps) {
          resolve((window as any).google.maps);
        } else {
          reject(new Error('Google Maps SDK loaded but google.maps is undefined'));
        }
      };

      script.onerror = (err) => {
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
}

export function getGoogleMapsDirectionsUrl(destination: { lat: number; lng: number } | string): string {
  const origin = `${DBUU_COORDINATES.lat},${DBUU_COORDINATES.lng}`;
  const dest = typeof destination === 'string'
    ? encodeURIComponent(destination)
    : `${destination.lat},${destination.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
}
