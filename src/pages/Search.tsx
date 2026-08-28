// ============================================================
// src/pages/Search.tsx — Search & Filters with Availability
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { PropertyGrid } from '../components/PropertyGrid';
import { FilterSidebar } from '../components/FilterSidebar';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import type { SearchFilters, PropertyType, RoomType, Property } from '../types/property';
import { useToast, Toast } from '../components/Toast';

const DEFAULT_FILTERS: Partial<SearchFilters> = {
  query: '',
  types: [],
  roomTypes: [],
  minPrice: null,
  maxPrice: null,
  maxDistance: null,
  furnishing: [],
  amenities: [],
  suitableFor: [],
  availability: '',
  sortBy: 'newest',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'distance', label: 'Closest to DBUU' },
];

export function Search() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<Partial<SearchFilters>>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes, savedRes] = await Promise.all([
        propertyService.getAll(),
        user ? propertyService.getSaved().catch(() => ({ savedIds: [] })) : Promise.resolve({ savedIds: [] }),
      ]);
      setAllProperties(propsRes || []);
      setSavedIds(savedRes?.savedIds || []);
    } catch {
      addToast('Failed to load listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sync URL query params on mount
  useEffect(() => {
    const initial: Partial<SearchFilters> = { ...DEFAULT_FILTERS };
    const q = searchParams.get('q');
    if (q) initial.query = q;

    const types = searchParams.get('types');
    if (types) initial.types = types.split(',') as PropertyType[];

    const rt = searchParams.get('roomType');
    if (rt) initial.roomTypes = [rt as RoomType];

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) initial.maxPrice = Number(maxPrice);

    const minPrice = searchParams.get('minPrice');
    if (minPrice) initial.minPrice = Number(minPrice);

    const maxDist = searchParams.get('maxDistance');
    if (maxDist) initial.maxDistance = Number(maxDist);

    const amenities = searchParams.get('amenities');
    if (amenities) initial.amenities = [amenities];

    const avail = searchParams.get('availability');
    if (avail === 'VACANT' || avail === 'OCCUPIED') initial.availability = avail;

    setFilters(initial);
  }, [searchParams]);

  const updateFilters = (partial: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Filter application
  const filtered = useMemo(() => {
    let result = [...allProperties];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }

    const loc = searchParams.get('location');
    if (loc) {
      result = result.filter(p => p.location.toLowerCase().includes(loc.toLowerCase()));
    }

    if (filters.types && filters.types.length > 0) {
      result = result.filter(p => filters.types!.includes(p.type));
    }
    if (filters.roomTypes && filters.roomTypes.length > 0) {
      result = result.filter(p => filters.roomTypes!.includes(p.roomType));
    }
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.maxDistance !== null && filters.maxDistance !== undefined) {
      result = result.filter(p => p.distanceFromDBUU <= filters.maxDistance!);
    }
    if (filters.furnishing && filters.furnishing.length > 0) {
      result = result.filter(p => filters.furnishing!.includes(p.furnishing));
    }
    if (filters.amenities && filters.amenities.length > 0) {
      result = result.filter(p => filters.amenities!.every(a => p.amenities.includes(a)));
    }
    if (filters.suitableFor && filters.suitableFor.length > 0) {
      result = result.filter(p => filters.suitableFor!.includes(p.suitableFor));
    }

    // Availability filtering
    if (filters.availability) {
      result = result.filter(p => (p.availabilityStatus || 'VACANT') === filters.availability);
    }

    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'distance':
        result.sort((a, b) => a.distanceFromDBUU - b.distanceFromDBUU);
        break;
    }

    return result;
  }, [allProperties, filters, searchParams]);

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
        addToast('Saved to your stays! ❤️', 'success');
      }
    } catch {
      addToast('Failed to update saved stays.', 'error');
    }
  };

  const isAvailableOnly = filters.availability === 'VACANT';

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-100 shadow-xs mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Accommodations Near DBUU</h1>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Fetching verified listings...' : `${filtered.length} stays available around campus`}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Available Only Toggle */}
                <button
                  onClick={() => updateFilters({ availability: isAvailableOnly ? '' : 'VACANT' })}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isAvailableOnly
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isAvailableOnly ? 'bg-white' : 'bg-emerald-500'}`} />
                  Available Stays Only
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={filters.sortBy ?? 'newest'}
                    onChange={e => updateFilters({ sortBy: e.target.value as any })}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Mobile filters button */}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <FilterSidebar
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
              resultCount={filtered.length}
              mobileOpen={drawerOpen}
              onMobileClose={() => setDrawerOpen(false)}
            />

            {/* Grid */}
            <div className="flex-1 min-w-0">
              <PropertyGrid
                properties={filtered}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                loading={loading}
                emptyVariant={allProperties.length === 0 ? 'no-listings' : 'search'}
                emptyTitle={allProperties.length === 0 ? 'No accommodations available yet.' : 'No properties match your current filters.'}
                emptyDescription={allProperties.length === 0 ? 'Properties listed by owners will appear here.' : 'Try adjusting or clearing your search filters to view more stays.'}
                emptyActionLabel={allProperties.length === 0 ? (user?.role === 'OWNER' ? 'List Your Property' : 'Explore Campus Map') : 'Clear Filters'}
                emptyActionTo={allProperties.length === 0 ? (user?.role === 'OWNER' ? '/post-property' : '/') : undefined}
                onEmptyAction={allProperties.length === 0 ? undefined : resetFilters}
              />
            </div>
          </div>
        </div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
