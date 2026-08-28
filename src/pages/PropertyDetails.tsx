// ============================================================
// src/pages/PropertyDetails.tsx — Details Page with Vacancy
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Heart, Share2, CheckCircle, ArrowLeft,
  Bed, Bath, Maximize2, CalendarCheck, Users, Home, AlertCircle
} from 'lucide-react';
import { ImageGallery } from '../components/ImageGallery';
import { AmenityItem } from '../components/AmenityItem';
import { OwnerCard } from '../components/OwnerCard';
import { DistanceBadge } from '../components/DistanceBadge';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyMap } from '../components/PropertyMap';
import { useToast, Toast } from '../components/Toast';
import type { Property } from '../types/property';

const typeBadgeColor: Record<string, string> = {
  PG: 'bg-purple-100 text-purple-700',
  Hostel: 'bg-blue-100 text-blue-700',
  Room: 'bg-amber-100 text-amber-700',
  Flat: 'bg-green-100 text-green-700',
};

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPropertyData();
  }, [id]);

  const loadPropertyData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const found = await propertyService.getById(id);
      setProperty(found);

      if (found) {
        const allProps = await propertyService.getAll();
        const sim = allProps.filter(p => p.id !== found.id && p.type === found.type).slice(0, 3);
        setSimilar(sim);
      }

      if (user) {
        const savedRes = await propertyService.getSaved().catch(() => ({ savedIds: [] }));
        setSavedIds(savedRes.savedIds || []);
      }
    } catch {
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const isSaved = property ? savedIds.includes(property.id) : false;

  const handleToggleSave = async () => {
    if (!property) return;
    if (!user) {
      addToast('Please login to save properties.', 'info');
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        const updated = await propertyService.unsave(property.id);
        setSavedIds(updated);
        addToast('Removed from saved stays.', 'info');
      } else {
        const updated = await propertyService.save(property.id);
        setSavedIds(updated);
        addToast('Saved to your stays! ❤️', 'success');
      }
    } catch {
      addToast('Failed to update saved properties.', 'error');
    }
  };

  const handleEnquiry = async (msg: string) => {
    if (!property) return;
    if (!user) {
      addToast('Please log in to send an enquiry.', 'info');
      navigate('/login');
      return;
    }

    try {
      await propertyService.sendEnquiry(property.id, msg);
      addToast('Enquiry sent successfully! The owner will contact you.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to send enquiry.', 'error');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'success');
    } catch {
      addToast('Could not copy link.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 max-w-5xl mx-auto px-4">
        <div className="animate-pulse space-y-4 mt-8">
          <div className="h-72 bg-gray-200 rounded-3xl" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          <Home size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found.</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-sm">
          This accommodation listing does not exist or has been unlisted by the owner.
        </p>
        <Link to="/search" className="btn-primary inline-flex items-center gap-2">
          Back to Search
        </Link>
      </div>
    );
  }

  const isOccupied = property.availabilityStatus === 'OCCUPIED';

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <motion.button
            onClick={() => navigate(-1)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to listings
          </motion.button>

          {/* Occupied Warning Banner if Occupied */}
          {isOccupied && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 mb-6 flex items-center gap-3 text-rose-900"
            >
              <AlertCircle size={22} className="text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">This property is currently OCCUPIED.</p>
                <p className="text-xs text-rose-700">All rooms are currently full. You may still contact the owner for upcoming availability dates.</p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Main details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <ImageGallery images={property.images} title={property.title} />
              </motion.div>

              {/* Header Info */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`badge ${typeBadgeColor[property.type]}`}>{property.type}</span>

                      {/* Vacancy Status Badge */}
                      {isOccupied ? (
                        <span className="badge bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                          🔴 OCCUPIED
                        </span>
                      ) : (
                        <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                          🟢 VACANT (Available)
                        </span>
                      )}

                      {property.verified && (
                        <span className="badge bg-green-100 text-green-700 gap-1">
                          <CheckCircle size={11} /> Verified DBUU Partner
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                      <MapPin size={15} className="text-indigo-500 shrink-0" />
                      {property.location}, {property.city}
                    </div>
                    <DistanceBadge distance={property.distanceFromDBUU} />
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={handleToggleSave}
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                        isSaved ? 'bg-red-500 border-red-500 text-white shadow-md' : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                      }`}
                      aria-label={isSaved ? 'Unsave' : 'Save'}
                    >
                      <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                    </motion.button>
                    <button
                      onClick={handleShare}
                      className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
                      aria-label="Share"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Price Bar */}
                <div className="flex items-end gap-6 pt-5 mt-6 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Monthly Rent</p>
                    <p className="text-3xl font-black text-indigo-600">
                      ₹{property.price.toLocaleString('en-IN')}
                      <span className="text-sm font-normal text-gray-400 ml-1">/month</span>
                    </p>
                  </div>
                  <div className="border-l border-gray-200 pl-6">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Security Deposit</p>
                    <p className="text-xl font-bold text-gray-700">₹{property.deposit.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </motion.div>

              {/* Accommodation Overview */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
              >
                <h2 className="font-bold text-gray-900 text-lg mb-4">Accommodation Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Bed size={18} className="text-indigo-500" />, label: 'Room Type', value: property.roomType },
                    { icon: <Bath size={18} className="text-indigo-500" />, label: 'Bathrooms', value: `${property.bathrooms}` },
                    ...(property.area ? [{ icon: <Maximize2 size={18} className="text-indigo-500" />, label: 'Area', value: `${property.area} sq ft` }] : []),
                    { icon: <Home size={18} className="text-indigo-500" />, label: 'Furnishing', value: property.furnishing },
                    { icon: <Users size={18} className="text-indigo-500" />, label: 'Suitable For', value: property.suitableFor },
                    { icon: <CalendarCheck size={18} className="text-indigo-500" />, label: 'Availability', value: isOccupied ? '🔴 Occupied' : '🟢 Vacant' },
                  ].map(s => (
                    <div key={s.label} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl">
                      {s.icon}
                      <div>
                        <p className="text-2xs text-gray-400 font-semibold uppercase">{s.label}</p>
                        <p className="text-sm font-bold text-gray-800">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
              >
                <h2 className="font-bold text-gray-900 text-lg mb-3">About this accommodation</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
              </motion.div>

              {/* Amenities */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
              >
                <h2 className="font-bold text-gray-900 text-lg mb-4">Amenities & Facilities</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {property.amenities.map(a => (
                    <AmenityItem key={a} name={a} variant="icon-grid" />
                  ))}
                </div>
              </motion.div>

              {/* Google Map & DBUU Route */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <PropertyMap property={property} />
              </motion.div>

              {/* Similar stays */}
              {similar.length > 0 && (
                <div className="pt-4">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">Similar Stays Near DBUU</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {similar.map(p => (
                      <PropertyCard
                        key={p.id}
                        property={p}
                        isSaved={savedIds.includes(p.id)}
                        onToggleSave={() => handleToggleSave()}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sticky Owner Card */}
            <div className="space-y-5">
              <div className="sticky top-24 space-y-5">
                <OwnerCard
                  owner={property.owner}
                  propertyTitle={property.title}
                  onEnquiry={handleEnquiry}
                />

                {/* Zero Brokerage Box */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 text-center">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">
                    Student Guarantee
                  </p>
                  <p className="text-sm text-indigo-950 font-medium">
                    Verified properties for DBUU students with direct owner contact and zero brokerage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
