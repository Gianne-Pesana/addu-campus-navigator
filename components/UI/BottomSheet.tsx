'use client';

import { Pin } from '@/types/campus';
import { useEffect, useState } from 'react';

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
      {/* Semi-transparent Overlay - reduced blur to keep map context */}
      <div 
        className={`fixed inset-0 bg-zinc-900/10 backdrop-blur-[1px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => {
          setIsOpen(false);
          setTimeout(onClose, 500);
        }}
      />
      
      {/* The Sheet - max height limited to 65% to keep map visible */}
      <div className="relative bg-white border-t border-zinc-200 rounded-t-[32px] shadow-[0_-12px_64px_-12px_rgba(0,0,0,0.1)] max-h-[65vh] md:max-h-[50vh] overflow-y-auto pb-12 select-none">
        
        {/* Drag Handle */}
        <div className="sticky top-0 bg-white pt-4 pb-3 flex justify-center z-10">
          <div className="w-12 h-1 bg-zinc-200 rounded-full" />
        </div>

        <div className="px-6 md:px-10 py-2">
          <header className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {pin.category.map(cat => (
                  <span key={cat} className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 border border-zinc-200">
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight leading-tight">
                {pin.name}
              </h2>
              <div className="flex items-center gap-2 pt-1 text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">{pin.building.replace(/_/g, ' ')}</span>
                <div className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="text-xs font-medium uppercase tracking-wider">{formatFloors(pin.floors)}</span>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsOpen(false);
                setTimeout(onClose, 500);
              }}
              className="p-2 bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors active:scale-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="space-y-8">
            <section>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">About this location</h3>
              <p className="text-zinc-700 leading-relaxed text-base font-medium bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                {pin.description}
              </p>
            </section>

            {pin.howToGetThere && (
              <section>
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">How to get here</h3>
                <div className="flex gap-4 items-start p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="mt-0.5 p-1.5 bg-blue-600 rounded-lg text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                    {pin.howToGetThere}
                  </p>
                </div>
              </section>
            )}

            <section>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Features & Tags</h3>
              <div className="flex flex-wrap gap-2">
                {pin.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[11px] font-semibold text-zinc-600 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
