// ============================================================
// src/pages/Home.tsx — Landing Page with Real Backend Data
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Smartphone, Search, GraduationCap, Phone, Mail, Headphones, Building, PlusCircle } from 'lucide-react';
import { HeroSearch } from '../components/HeroSearch';
import { QuickFilters } from '../components/QuickFilters';
import { PropertyCard } from '../components/PropertyCard';
import { LocationCard } from '../components/LocationCard';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import { locations } from '../data/properties';
import { useToast, Toast } from '../components/Toast';
import type { Property } from '../types/property';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

export function Home() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [props, savedRes] = await Promise.all([
        propertyService.getAll(),
        user ? propertyService.getSaved().catch(() => ({ savedIds: [] })) : Promise.resolve({ savedIds: [] }),
      ]);
      setProperties(props || []);
      setSavedIds(savedRes?.savedIds || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const featured = properties.slice(0, 6);

  const handleToggleSave = async (id: string) => {
    if (!user) {
      addToast('Please login to save properties.', 'info');
      return;
    }

    try {
      if (savedIds.includes(id)) {
        const updated = await propertyService.unsave(id);
        setSavedIds(updated);
        addToast('Removed from saved stays.', 'info');
      } else {
        const updated = await propertyService.save(id);
        setSavedIds(updated);
        addToast('Added to saved stays! ❤️', 'success');
      }
    } catch {
      addToast('Failed to update saved properties.', 'error');
    }
  };

  return (
    <>
      <HeroSearch />
      <QuickFilters />

      <main>
        {/* Popular Areas */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-indigo-100 text-indigo-700">📍 Nearby</span>
            </div>
            <h2 className="section-heading">Popular Student Areas Near DBUU</h2>
            <p className="section-subheading">
              Explore neighbourhoods loved by Dev Bhoomi Uttarakhand University students.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {locations.map((loc, i) => {
              const countInArea = properties.filter(p => p.location.toLowerCase().includes(loc.name.toLowerCase())).length;
              return (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <LocationCard location={{ ...loc, count: countInArea }} />
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* Featured Listings */}
        <section className="py-16 bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div {...fadeUp} className="flex items-end justify-between mb-8">
              <div>
                <span className="badge bg-green-100 text-green-700 mb-2">⭐ Top Picks</span>
                <h2 className="section-heading">Popular Stays for DBUU Students</h2>
                <p className="section-subheading">
                  Verified accommodation handpicked for Dev Bhoomi Uttarakhand University students.
                </p>
              </div>
              {properties.length > 0 && (
                <Link
                  to="/search"
                  className="hidden sm:flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold text-sm whitespace-nowrap"
                >
                  View all stays <ArrowRight size={16} />
                </Link>
              )}
            </motion.div>

            {loading ? (
              <div className="py-12 text-center text-gray-400">Loading verified accommodations...</div>
            ) : properties.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Building size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">No properties listed yet.</h3>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Be the first owner to list a property near DBUU.
                </p>
                <p className="text-gray-400 text-xs mb-6">
                  New accommodations will appear here when owners list their properties.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to={user?.role === 'OWNER' ? '/post-property' : '/login'}
                    className="btn-primary inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    <PlusCircle size={16} />
                    {user?.role === 'OWNER' ? 'List Your Property' : 'List Property as Owner'}
                  </Link>
                  <Link
                    to="/search"
                    className="btn-secondary inline-flex items-center justify-center gap-2"
                  >
                    <Search size={16} />
                    Explore Campus Map & Areas
                  </Link>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <PropertyCard
                        property={p}
                        isSaved={savedIds.includes(p.id)}
                        onToggleSave={handleToggleSave}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <Link to="/search" className="btn-primary inline-flex items-center gap-2">
                    Explore All {properties.length} Stays
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Why UNI stay DBUU */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="badge bg-indigo-100 text-indigo-700 mb-3">Why us?</span>
            <h2 className="section-heading">Built for DBUU Students, by Students</h2>
            <p className="section-subheading max-w-xl mx-auto">
              We understand what Dev Bhoomi students need — affordable stays, safe environment, and proximity to campus.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <GraduationCap size={28} className="text-indigo-600" />, title: 'DBUU Focused', desc: 'All listings are near Dev Bhoomi Uttarakhand University campus only.' },
              { icon: <ShieldCheck size={28} className="text-green-600" />, title: 'Verified Listings', desc: 'Every property is checked before listing. Your safety is our priority.' },
              { icon: <Search size={28} className="text-blue-600" />, title: 'Smart Filters', desc: 'Filter by budget, distance, amenities, room type and more.' },
              { icon: <Smartphone size={28} className="text-purple-600" />, title: 'Student-First', desc: 'Designed for mobile. Find a stay during lectures or on the go.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="max-w-4xl mx-auto gradient-hero rounded-3xl p-10 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-16 translate-y-16" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl p-1 shadow-lg mx-auto mb-4 border border-white/30 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="UNI stay DBUU" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-3xl font-extrabold mb-3">Ready to find your stay?</h2>
              <p className="text-indigo-200 mb-6 max-w-md mx-auto">
                Join hundreds of DBUU students who found their perfect accommodation through UNI stay DBUU.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/search" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all">
                  Find a Stay Now
                </Link>
                <Link to="/register" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-all">
                  Create Free Account
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
        {/* DBUU Student Support Helpline */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            {...fadeUp}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Headphones size={28} className="text-indigo-600" />
              </div>
              <div>
                <span className="badge bg-emerald-100 text-emerald-700 mb-2">Student Assistance</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">
                  Need Help Finding a Stay Near DBUU?
                </h3>
                <p className="text-sm text-gray-500 max-w-lg">
                  Reach out to our campus accommodation helpdesk anytime for assistance with visits, bookings, and student guidance.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <a
                href="tel:+918271745566"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm active:scale-95"
              >
                <Phone size={16} />
                +91 8271745566
              </a>
              <a
                href="tel:+919123723276"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-semibold text-sm transition-all shadow-sm active:scale-95"
              >
                <Phone size={16} />
                +91 9123723276
              </a>
              <a
                href="mailto:dbuu.rituraj@gmail.com"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-sm transition-all active:scale-95"
              >
                <Mail size={16} />
                dbuu.rituraj@gmail.com
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
