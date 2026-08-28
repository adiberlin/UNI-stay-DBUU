// ============================================================
// FilterSidebar — Full filter panel for search page
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { SearchFilters, PropertyType, RoomType, Furnishing, SuitableFor } from '../types/property';

const PROPERTY_TYPES: PropertyType[] = ['PG', 'Hostel', 'Room', 'Flat'];
const ROOM_TYPES: RoomType[] = ['Single', 'Double Sharing', 'Triple Sharing', '1 BHK', '2 BHK', '3 BHK'];
const FURNISHINGS: Furnishing[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const SUITABLE_FOR: SuitableFor[] = ['Boys', 'Girls', 'Co-living', 'Family'];
const AMENITIES = ['Wi-Fi', 'Food/Mess', 'Parking', 'Laundry', 'AC', 'Power Backup', 'CCTV', 'Hot Water', 'Attached Bathroom', 'Balcony', 'Study Table'];
const DISTANCE_OPTIONS = [
  { label: 'Under 1 km', value: 1 },
  { label: 'Under 2 km', value: 2 },
  { label: 'Under 5 km', value: 5 },
  { label: 'Any distance', value: 999 },
];
const BUDGET_PRESETS = [
  { label: 'Under ₹5,000', max: 5000 },
  { label: '₹5,000 – ₹8,000', min: 5000, max: 8000 },
  { label: '₹8,000 – ₹12,000', min: 8000, max: 12000 },
  { label: '₹12,000+', min: 12000 },
];

interface FilterSidebarProps {
  filters: Partial<SearchFilters>;
  onChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
  resultCount: number;
  // Mobile drawer
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-2"
      >
        {title}
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-all ${checked ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-indigo-600 w-4 h-4" />
      {label}
    </label>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  resultCount,
  mobileOpen = false,
  onMobileClose,
}: FilterSidebarProps) {
  const toggle = <T,>(key: keyof SearchFilters, value: T, arr?: T[]) => {
    const current = (arr ?? (filters[key] as T[])) ?? [];
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onChange({ [key]: next });
  };

  const content = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-indigo-600" />
          <span className="font-bold text-gray-900">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <RotateCcw size={12} /> Reset
          </button>
          {onMobileClose && (
            <button onClick={onMobileClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {/* Budget Presets */}
        <Section title="Budget">
          <div className="space-y-1 mb-3">
            {BUDGET_PRESETS.map(p => {
              const active =
                (p.min === undefined || filters.minPrice === p.min) &&
                (p.max === undefined || filters.maxPrice === p.max) &&
                ((p.min !== undefined || p.max !== undefined));
              return (
                <button
                  key={p.label}
                  onClick={() => onChange({ minPrice: p.min ?? null, maxPrice: p.max ?? null })}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ''}
                onChange={e => onChange({ minPrice: e.target.value ? Number(e.target.value) : null })}
                className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={e => onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
                className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </Section>

        {/* Accommodation Type */}
        <Section title="Accommodation Type">
          <div className="space-y-1">
            {PROPERTY_TYPES.map(type => (
              <CheckChip
                key={type}
                label={type}
                checked={(filters.types ?? []).includes(type)}
                onChange={() => toggle('types', type, filters.types)}
              />
            ))}
          </div>
        </Section>

        {/* Room Type */}
        <Section title="Room Type">
          <div className="space-y-1">
            {ROOM_TYPES.map(rt => (
              <CheckChip
                key={rt}
                label={rt}
                checked={(filters.roomTypes ?? []).includes(rt)}
                onChange={() => toggle('roomTypes', rt, filters.roomTypes)}
              />
            ))}
          </div>
        </Section>

        {/* Distance */}
        <Section title="Distance from DBUU">
          <div className="space-y-1">
            {DISTANCE_OPTIONS.map(d => (
              <button
                key={d.label}
                onClick={() => onChange({ maxDistance: d.value === 999 ? null : d.value })}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                  (filters.maxDistance === d.value || (d.value === 999 && !filters.maxDistance))
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Furnishing */}
        <Section title="Furnishing">
          <div className="space-y-1">
            {FURNISHINGS.map(f => (
              <CheckChip
                key={f}
                label={f}
                checked={(filters.furnishing ?? []).includes(f)}
                onChange={() => toggle('furnishing', f, filters.furnishing)}
              />
            ))}
          </div>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <div className="space-y-1">
            {AMENITIES.map(a => (
              <CheckChip
                key={a}
                label={a}
                checked={(filters.amenities ?? []).includes(a)}
                onChange={() => toggle('amenities', a, filters.amenities)}
              />
            ))}
          </div>
        </Section>

        {/* Suitable For */}
        <Section title="Suitable For">
          <div className="space-y-1">
            {SUITABLE_FOR.map(s => (
              <CheckChip
                key={s}
                label={s}
                checked={(filters.suitableFor ?? []).includes(s)}
                onChange={() => toggle('suitableFor', s, filters.suitableFor)}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* Apply */}
      {onMobileClose && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onMobileClose}
            className="btn-primary w-full"
          >
            Show {resultCount} Stays
          </button>
        </div>
      )}
    </div>
  );

  // Mobile: render as slide-in drawer
  if (onMobileClose !== undefined) {
    return (
      <>
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onMobileClose}
              />
              <motion.div
                className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {content}
              </motion.div>
            </>
          )}
        </AnimatePresence>
        {/* Desktop static sidebar */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-h-[calc(100vh-8rem)] sticky top-28">
          {content}
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {content}
    </div>
  );
}
