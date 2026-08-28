// ============================================================
// QuickFilters — Quick search chips below hero
// ============================================================

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface QuickFilter {
  label: string;
  params: Record<string, string>;
}

const quickFilters: QuickFilter[] = [
  { label: '🎓 Near DBUU', params: { maxDistance: '1' } },
  { label: '💰 Under ₹5,000', params: { maxPrice: '5000' } },
  { label: '💸 Under ₹8,000', params: { maxPrice: '8000' } },
  { label: '🛏 Single Room', params: { roomType: 'Single' } },
  { label: '👥 Shared Room', params: { roomType: 'Double Sharing' } },
  { label: '🏠 PG', params: { types: 'PG' } },
  { label: '🏢 1 BHK', params: { roomType: '1 BHK' } },
  { label: '🏗 2 BHK', params: { roomType: '2 BHK' } },
  { label: '🏨 Hostel', params: { types: 'Hostel' } },
  { label: '🍽 Food Included', params: { amenities: 'Food/Mess' } },
];

interface QuickFiltersProps {
  activeFilter?: string;
}

export function QuickFilters({ activeFilter }: QuickFiltersProps) {
  const navigate = useNavigate();

  const handleClick = (filter: QuickFilter) => {
    const params = new URLSearchParams(filter.params);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex items-center gap-1.5 shrink-0 text-gray-400 border-r border-gray-200 pr-3 mr-0">
            <Zap size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Quick</span>
          </div>
          {quickFilters.map(f => (
            <motion.button
              key={f.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(f)}
              className={`shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all whitespace-nowrap ${
                activeFilter === f.label
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
