// ============================================================
// PropertyGrid — Responsive grid of PropertyCard components
// ============================================================

import { motion } from 'framer-motion';
import type { Property } from '../types/property';
import { PropertyCard } from './PropertyCard';
import { EmptyState } from './EmptyState';

interface PropertyGridProps {
  properties: Property[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  loading?: boolean;
  emptyVariant?: 'search' | 'saved' | 'no-listings' | 'general';
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionTo?: string;
  onEmptyAction?: () => void;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export function PropertyGrid({
  properties,
  savedIds,
  onToggleSave,
  loading = false,
  emptyVariant = 'search',
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionTo,
  onEmptyAction,
}: PropertyGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        variant={emptyVariant}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionTo={emptyActionTo}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {properties.map(p => (
        <PropertyCard
          key={p.id}
          property={p}
          isSaved={savedIds.includes(p.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 rounded-full w-20" />
          <div className="h-6 bg-gray-100 rounded-full w-16" />
        </div>
        <div className="h-10 bg-gray-100 rounded-xl mt-4" />
      </div>
    </div>
  );
}
