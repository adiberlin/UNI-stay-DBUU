// ============================================================
// LocationCard — Popular student areas near DBUU
// ============================================================

import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Location {
  id: string;
  name: string;
  count?: number;
  label: string;
  image: string;
}

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md"
    >
      <Link to={`/search?location=${encodeURIComponent(location.name)}`} aria-label={`Explore ${location.name}`}>
        {/* Background image */}
        <div className="h-52 relative overflow-hidden">
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80';
            }}
          />
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-bold text-lg leading-tight">{location.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-indigo-300" />
                  <span className="text-indigo-200 text-xs">Near DBUU</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">
                  {location.count !== undefined ? `${location.count} ${location.count === 1 ? 'stay' : 'stays'}` : 'Campus Area'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="flex items-center gap-1.5 bg-green-500/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                <Users size={11} />
                {location.label}
              </span>
              <motion.div
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-indigo-600 transition-all"
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRight size={14} />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
