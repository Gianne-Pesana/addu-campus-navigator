'use client';

import { Pin } from '@/types/campus';
import { useEffect, useState } from 'react';

interface BottomSheetProps {
  pin: Pin | null;
  onClose: () => void;
}

/**
 * Formats the floor array into a standardized display string.
 */
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

export default function BottomSheet({ pin, onClose }: BottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsOpen(!!pin);
    }, 50);
    return () => clearTimeout(timeout);
  }, [pin]);

  if (!pin) return null;

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-[1001] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => {
          setIsOpen(false);
          setTimeout(onClose, 500);
        }}
      />
      
      <div className="relative bg-zinc-900 border-t border-white/10 rounded-t-[32px] shadow-2xl max-h-[85vh] overflow-y-auto pb-12 select-none">
        {/* Drag Handle */}
        <div className="sticky top-0 bg-zinc-900/80 backdrop-blur-md pt-4 pb-3 flex justify-center z-10">
          <div className="w-16 h-1.5 bg-white/10 rounded-full" />
        </div>

        <div className="px-8 py-4">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {pin.category.map(cat => (
                  <span key={cat} className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] bg-white/5 text-white/60 border border-white/5">
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase italic">
                {pin.name}
              </h2>
              <div className="flex items-center gap-3 pt-2">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  {pin.building.replace(/_/g, ' ')}
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  {formatFloors(pin.floors)}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsOpen(false);
                setTimeout(onClose, 500);
              }}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Location Intelligence</h3>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-zinc-300 leading-relaxed font-medium">
                  {pin.description}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Discovery Tags</h3>
              <div className="flex flex-wrap gap-2">
                {pin.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-zinc-800 border border-white/5 rounded-xl text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">
                    #{tag.replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 p-6 rounded-2xl border border-indigo-500/20 shadow-inner">
              <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-3 flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Tactical Navigation
              </h3>
              <p className="text-xs text-indigo-100/70 leading-relaxed font-bold uppercase tracking-wide">
                {pin.howToGetThere}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
