// ============================================================
// DistanceBadge — Visual distance-to-DBUU indicator
// ============================================================

import { MapPin, GraduationCap, Navigation } from 'lucide-react';

interface DistanceBadgeProps {
  distance: number; // km
  variant?: 'inline' | 'visual';
}

export function DistanceBadge({ distance, variant = 'inline' }: DistanceBadgeProps) {
  const label =
    distance < 1
      ? 'Walking distance'
      : distance < 2
        ? 'Very close'
        : distance < 4
          ? 'Short auto ride'
          : 'Short drive';

  const color =
    distance < 1
      ? 'bg-green-100 text-green-700 border-green-200'
      : distance < 2
        ? 'bg-blue-100 text-blue-700 border-blue-200'
        : distance < 4
          ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
          : 'bg-gray-100 text-gray-700 border-gray-200';

  if (variant === 'visual') {
    const estMins = distance < 1
      ? `~${Math.round(distance * 12)} min walk`
      : `~${Math.round(distance * 4)} min auto`;

    return (
      <div className="bg-gradient-to-b from-indigo-50 to-green-50 rounded-2xl border border-indigo-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Navigation size={18} className="text-indigo-600" />
          Distance to DBUU
        </h3>
        <div className="flex flex-col items-center gap-1">
          {/* Property */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 w-full justify-center">
            <MapPin size={18} className="text-indigo-600" />
            <span className="font-medium text-gray-800 text-sm">Your Stay</span>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center gap-0.5 py-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-0.5 h-3 bg-indigo-200 rounded-full" />
            ))}
            <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full my-1">
              {distance} km
            </div>
            <div className="text-xs text-gray-500 font-medium">{estMins}</div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-0.5 h-3 bg-indigo-200 rounded-full" />
            ))}
          </div>

          {/* DBUU */}
          <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-sm w-full justify-center">
            <GraduationCap size={18} />
            <span className="font-medium text-sm">Dev Bhoomi Uttarakhand University</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          {label} from campus. Estimated commute time is approximate.
        </p>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${color}`}
    >
      <Navigation size={11} />
      {distance} km from DBUU
    </span>
  );
}
