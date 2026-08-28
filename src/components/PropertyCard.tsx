// ============================================================
// src/components/PropertyCard.tsx — Listing Card with Vacancy Status
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, CheckCircle, ArrowRight, Users, Maximize2, Wifi, Utensils } from 'lucide-react';
import type { Property } from '../types/property';
import { DistanceBadge } from './DistanceBadge';

const typeBadgeColor: Record<string, string> = {
  PG: 'bg-purple-100 text-purple-700',
  Hostel: 'bg-blue-100 text-blue-700',
  Room: 'bg-amber-100 text-amber-700',
  Flat: 'bg-green-100 text-green-700',
};

const furnishColor: Record<string, string> = {
  Furnished: 'text-green-600',
  'Semi-Furnished': 'text-amber-600',
  Unfurnished: 'text-gray-500',
};

interface PropertyCardProps {
  property: Property;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

export function PropertyCard({ property, isSaved, onToggleSave }: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);
  const isOccupied = property.availabilityStatus === 'OCCUPIED';

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleSave(property.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col ${
        isOccupied ? 'border-rose-200/80 bg-rose-50/10' : 'border-gray-100'
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={imgError || !property.images?.length ? `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80` : property.images[0]}
          alt={property.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isOccupied ? 'grayscale-25' : ''
          }`}
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[70%]">
          {/* Type badge */}
          <span className={`badge ${typeBadgeColor[property.type] ?? 'bg-gray-100 text-gray-700'} shadow-sm`}>
            {property.type}
          </span>

          {/* Prominent Vacancy Badge */}
          {isOccupied ? (
            <span className="badge bg-rose-600 text-white font-bold shadow-md animate-pulse">
              🔴 OCCUPIED
            </span>
          ) : (
            <span className="badge bg-emerald-600 text-white font-bold shadow-md">
              🟢 VACANT
            </span>
          )}
        </div>

        {/* Save button */}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.85 }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            isSaved
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:text-red-500'
          }`}
          aria-label={isSaved ? 'Unsave property' : 'Save property'}
        >
          <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Price tag on image */}
        <div className="absolute bottom-3 left-3 bg-indigo-600 text-white px-2.5 py-1 rounded-xl text-sm font-bold shadow-md">
          ₹{property.price.toLocaleString('en-IN')}<span className="text-indigo-200 font-normal text-xs">/mo</span>
        </div>

        {property.verified && (
          <div className="absolute bottom-3 right-3 bg-white/90 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
            <CheckCircle size={11} /> Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-700 transition-colors">
            {property.title}
          </h3>
          {property.rating && (
            <span className="shrink-0 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-100">
              ★ {property.rating}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin size={13} className="shrink-0 text-indigo-400" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <DistanceBadge distance={property.distanceFromDBUU} />
          <span className={`text-xs font-semibold ${furnishColor[property.furnishing]}`}>
            {property.furnishing}
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-600 text-xs mb-3">
          <span className="flex items-center gap-1">
            <Users size={13} className="text-indigo-500" />
            {property.roomType}
          </span>
          {property.area && (
            <span className="flex items-center gap-1">
              <Maximize2 size={13} className="text-indigo-500" />
              {property.area} sq ft
            </span>
          )}
        </div>

        {/* Top amenities */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {property.amenities.slice(0, 3).map(a => (
            <span key={a} className="flex items-center gap-1 text-2xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
              {a === 'Wi-Fi' && <Wifi size={10} className="text-indigo-500" />}
              {a === 'Food/Mess' && <Utensils size={10} className="text-indigo-500" />}
              {a}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-2xs text-gray-400 font-semibold">+{property.amenities.length - 3}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-2xs text-gray-400 uppercase font-semibold">Rent</p>
            <p className="text-base font-extrabold text-indigo-600">₹{property.price.toLocaleString('en-IN')}</p>
          </div>
          <Link
            to={`/property/${property.id}`}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-xs"
          >
            View Details
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
