'use client';

import { Pin } from '@/types/campus';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  pin: Pin | null;
  onClose: () => void;
}

const formatFloors = (floors: string[]): string => {
  if (!floors || floors.length === 0) return '';
  if (floors.length === 1) return `${floors[0]} Floor`;

  const includesMezzanine = floors.includes('Mezzanine');
  const numericFloors = floors.filter(f => f !== 'Mezzanine');
  
  if (numericFloors.length === 0) return 'Mezzanine Floor';

  const first = numericFloors[0];
  const last = numericFloors[numericFloors.length - 1];

  let display = `${first} to ${last} Floor`;
  if (includesMezzanine) {
    display += ' (includes Mezzanine)';
  }
  
  return display;
};

const Lightbox = ({ 
  photos, 
  initialIndex, 
  onClose 
}: { 
  photos: { url: string; alt: string }[]; 
  initialIndex: number; 
  onClose: () => void 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % photos.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[2001]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full h-full flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full max-w-5xl aspect-[4/3] md:aspect-video flex items-center justify-center">
          <img
            src={photos[currentIndex].url}
            alt={photos[currentIndex].alt}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
          />
        </div>

        {photos.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
        <p className="text-white/90 text-sm font-medium">{photos[currentIndex].alt}</p>
        <p className="text-white/40 text-xs">{currentIndex + 1} / {photos.length}</p>
      </div>
    </motion.div>
  );
};

const PhotoSection = ({ 
  photos, 
  onPhotoClick 
}: { 
  photos: (string | { url: string; alt: string })[],
  onPhotoClick: (index: number) => void
}) => {
  const validPhotos = photos
    .map(p => {
      if (typeof p === 'string') {
        if (p === 'n/a') return null;
        return { url: p, alt: 'Location photo' };
      }
      return p;
    })
    .filter((p): p is { url: string; alt: string } => p !== null);

  const isEmpty = validPhotos.length === 0;

  return (
    <section className="mt-8 pt-8 border-t border-panel-border">
      <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mb-4">Photos</h3>
      
      {isEmpty ? (
        <div className="w-full h-40 bg-foreground/5 rounded-2xl flex flex-col items-center justify-center border border-panel-border border-dashed">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/20 mb-2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs font-semibold text-foreground/40">No images available</span>
        </div>
      ) : (
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
          {validPhotos.map((photo, index) => (
            <div 
              key={`photo-${index}`} 
              onClick={() => onPhotoClick(index)}
              className="relative shrink-0 rounded-xl overflow-hidden bg-foreground/5 border border-panel-border w-48 h-36 cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all active:scale-[0.98]"
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default function BottomSheet({ pin, onClose }: BottomSheetProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll when pin changes
  useEffect(() => {
    if (pin && scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [pin]);

  const validPhotos = pin?.photos
    .map(p => {
      if (typeof p === 'string') {
        if (p === 'n/a') return null;
        return { url: p, alt: 'Location photo' };
      }
      return p;
    })
    .filter((p): p is { url: string; alt: string } => p !== null) || [];

  return (
    <>
      <AnimatePresence>
        {pin && (
          <div key="bottom-sheet-container" className="fixed inset-0 z-[1001] flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 bg-background/20 dark:bg-black/40 backdrop-blur-[1px]"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 38, 
                stiffness: 500, 
                mass: 0.5
              }}
              ref={scrollRef}
              className="relative bg-background border-t border-panel-border rounded-t-[32px] shadow-[0_-12px_64px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_-12px_64px_-12px_rgba(0,0,0,0.5)] max-h-[65vh] md:max-h-[50vh] overflow-y-auto pb-12 select-none"
            >
              {/* Drag Handle */}
              <div className="sticky top-0 bg-background pt-4 pb-3 flex justify-center z-10">
                <div className="w-12 h-1 bg-foreground/10 rounded-full" />
              </div>

              <div className="px-6 md:px-10 py-2">
                <header className="flex justify-between items-start mb-8">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {pin.category.map((cat, idx) => (
                        <span key={`cat-${cat}-${idx}`} className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-foreground/5 text-foreground/50 border border-panel-border">
                          {cat.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight">
                      {pin.name}
                    </h2>
                    <div className="flex items-center gap-2 pt-1 text-foreground/50">
                      <span className="text-xs font-semibold uppercase tracking-wider">{pin.building.replace(/_/g, ' ')}</span>
                      <div className="w-1 h-1 rounded-full bg-foreground/20" />
                      <span className="text-xs font-medium uppercase tracking-wider">{formatFloors(pin.floors)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={onClose}
                    className="p-2 bg-foreground/5 rounded-xl text-foreground/40 hover:text-foreground transition-colors active:scale-90"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </header>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mb-3">About this location</h3>
                    <p className="text-foreground/80 leading-relaxed text-base font-medium bg-foreground/5 p-5 rounded-2xl border border-panel-border">
                      {pin.description}
                    </p>
                  </section>

                  {pin.howToGetThere && (
                    <section>
                      <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mb-3">How to get here</h3>
                      <div className="flex gap-4 items-start p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                        <div className="mt-0.5 p-1.5 bg-indigo-600 rounded-lg text-white">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                          {pin.howToGetThere}
                        </p>
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mb-3">Features & Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {pin.tags.map((tag, idx) => (
                        <span key={`tag-${tag}-${idx}`} className="px-3 py-1.5 bg-background border border-panel-border rounded-lg text-[11px] font-semibold text-foreground/70 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Photos */}
                  <PhotoSection 
                    photos={pin.photos} 
                    onPhotoClick={(index) => setLightboxIndex(index)}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxIndex !== null && validPhotos.length > 0 && (
          <Lightbox 
            key="lightbox-component"
            photos={validPhotos} 
            initialIndex={lightboxIndex} 
            onClose={() => setLightboxIndex(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
