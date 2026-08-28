// ============================================================
// EmptyState — Empty search/saved results
// ============================================================

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';

interface EmptyStateProps {
  variant?: 'search' | 'saved' | 'no-listings' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyState({
  variant = 'general',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) {
  const defaults = {
    'no-listings': {
      icon: <Search size={40} className="text-indigo-300" />,
      title: 'No accommodations available yet.',
      description: 'Properties listed by owners will appear here.',
      actionLabel: 'Refresh Listings',
      actionTo: '/search',
    },
    search: {
      icon: <Search size={40} className="text-indigo-300" />,
      title: 'No properties match your current filters.',
      description: 'Try adjusting or clearing your search filters to view more stays.',
      actionLabel: 'Clear Filters',
      actionTo: '/search',
    },
    saved: {
      icon: <Heart size={40} className="text-indigo-300" />,
      title: 'No saved properties yet.',
      description: 'Explore accommodation near DBUU and save your favourites.',
      actionLabel: 'Find a Stay',
      actionTo: '/search',
    },
    general: {
      icon: <Search size={40} className="text-indigo-300" />,
      title: 'Nothing here yet.',
      description: 'Check back later.',
      actionLabel: 'Go Home',
      actionTo: '/',
    },
  };

  const d = defaults[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-5">
        {d.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title ?? d.title}</h3>
      <p className="text-gray-500 text-sm max-w-sm mb-6">{description ?? d.description}</p>
      {onAction ? (
        <button
          onClick={onAction}
          className="btn-primary text-sm shadow-sm"
        >
          {actionLabel ?? d.actionLabel}
        </button>
      ) : (
        <Link
          to={actionTo ?? d.actionTo}
          className="btn-primary text-sm shadow-sm"
        >
          {actionLabel ?? d.actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
