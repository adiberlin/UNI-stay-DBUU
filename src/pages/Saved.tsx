// ============================================================
// src/pages/Saved.tsx — Student Saved Properties
// ============================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { PropertyGrid } from '../components/PropertyGrid';
import { EmptyState } from '../components/EmptyState';
import { propertyService } from '../services/propertyService';
import { useToast, Toast } from '../components/Toast';
import type { Property } from '../types/property';

export function Saved() {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getSaved();
      setSavedIds(res.savedIds || []);
      setSavedProperties(res.properties || []);
    } catch {
      addToast('Failed to load saved stays.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (id: string) => {
    try {
      const updated = await propertyService.unsave(id);
      setSavedIds(updated);
      setSavedProperties(prev => prev.filter(p => p.id !== id));
      addToast('Removed from saved stays.', 'info');
    } catch {
      addToast('Failed to remove saved property.', 'error');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shadow-xs">
              <Heart size={24} className="text-red-500" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Saved Stays</h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {savedProperties.length > 0
                  ? `${savedProperties.length} accommodation${savedProperties.length !== 1 ? 's' : ''} saved`
                  : 'No saved stays yet'}
              </p>
            </div>
          </motion.div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading your saved stays...</div>
          ) : savedProperties.length > 0 ? (
            <PropertyGrid
              properties={savedProperties}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
            />
          ) : (
            <EmptyState variant="saved" />
          )}
        </div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
