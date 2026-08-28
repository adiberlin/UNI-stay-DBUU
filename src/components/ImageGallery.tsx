// ============================================================
// ImageGallery — Full-screen image gallery with thumbnails
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Modal } from './Modal';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const validImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'
  ];

  const prev = () => setActiveIdx(i => (i - 1 + validImages.length) % validImages.length);
  const next = () => setActiveIdx(i => (i + 1) % validImages.length);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="rounded-2xl overflow-hidden shadow-md">
        {/* Main Image */}
        <div className="relative h-72 sm:h-96 bg-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIdx}
              src={validImages[activeIdx]}
              alt={`${title} — photo ${activeIdx + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80';
              }}
            />
          </AnimatePresence>

          {/* Nav arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Zoom button */}
          <button
            onClick={() => openLightbox(activeIdx)}
            className="absolute bottom-3 right-3 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
            aria-label="View full size"
          >
            <ZoomIn size={16} />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 left-3 bg-black/40 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeIdx + 1} / {validImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
            {validImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIdx ? 'border-indigo-500 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                aria-label={`View photo ${i + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} size="lg">
        <div className="relative">
          <img
            src={validImages[lightboxIdx]}
            alt={`${title} — full view`}
            className="w-full rounded-xl object-contain max-h-[60vh]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80';
            }}
          />
          <div className="flex justify-center gap-3 mt-4">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setLightboxIdx(i)}
                className={`w-10 h-2 rounded-full transition-all ${i === lightboxIdx ? 'bg-indigo-600' : 'bg-gray-200'}`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
