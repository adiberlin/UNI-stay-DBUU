// ============================================================
// HeroSearch — Premium landing hero with search form
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, GraduationCap, Star, ChevronDown } from 'lucide-react';

const propertyTypes = ['PG', 'Room', 'Flat', 'Hostel'] as const;

export function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedTypes.length) params.set('types', selectedTypes.join(','));
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background image overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1513036191774-b2badb8fcb76?w=1600&q=80"
          alt="Dehradun hills"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-indigo-900/40 to-indigo-950/80" />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-28 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-medium px-4 py-2 rounded-full mb-6"
        >
          <GraduationCap size={16} className="text-indigo-300" />
          Made exclusively for DBUU students, Dehradun
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5"
        >
          Find your perfect stay
          <span className="block text-indigo-300">near DBUU.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-indigo-200 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Discover affordable PGs, rooms, flats and hostels made for
          Dev Bhoomi Uttarakhand University students.
        </motion.p>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl shadow-2xl p-5 text-left"
        >
          <form onSubmit={handleSearch}>
            {/* Search input */}
            <div className="mb-4">
              <label htmlFor="hero-search" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Where do you want to stay?
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  id="hero-search"
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search near DBUU — area, type, keyword..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Min Price */}
              <div>
                <label htmlFor="min-price" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Min Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">₹</span>
                  <input
                    id="min-price"
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="3,000"
                    min="0"
                    className="w-full pl-7 pr-3 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {/* Max Price */}
              <div>
                <label htmlFor="max-price" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Max Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">₹</span>
                  <input
                    id="max-price"
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="15,000"
                    min="0"
                    className="w-full pl-7 pr-3 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {/* Stay Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Stay Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {propertyTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                        selectedTypes.includes(type)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-98 shadow-lg shadow-indigo-200 text-base"
            >
              <Search size={18} />
              Find Accommodation Near DBUU
            </button>
          </form>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8 text-indigo-200"
        >
          {[
            { value: 'Verified', label: 'Owner Listings' },
            { value: 'Direct', label: 'Student Contact' },
            { value: '100%', label: 'DBUU Focused' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <Star size={14} fill="currentColor" className="text-amber-400" />
              <span className="font-bold text-white">{s.value}</span>
              <span className="text-sm">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-1"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-xs">Scroll to explore</span>
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
