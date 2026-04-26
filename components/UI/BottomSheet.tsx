'use client';

import { Zone } from '@/types/campus';
import { useEffect, useState } from 'react';

interface BottomSheetProps {
  zone: Zone | null;
  onClose: () => void;
}

export default function BottomSheet({ zone, onClose }: BottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsOpen(!!zone);
    }, 50);
    return () => clearTimeout(timeout);
  }, [zone]);

  if (!zone) return null;

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-[1001] transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      {/* Overlay for closing when clicking outside */}
      <div 
        className={`fixed inset-0 bg-black/10 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => {
          setIsOpen(false);
          setTimeout(onClose, 300);
        }}
      />
      
      <div className="relative bg-white rounded-t-[24px] shadow-2xl max-h-[80vh] overflow-y-auto pb-10">
        {/* Drag Handle */}
        <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center z-10">
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
        </div>

        <div className="px-6 py-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 mb-2">
                {zone.category}
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 leading-tight">
                {zone.name}
              </h2>
              <p className="text-sm text-zinc-500 font-medium">
                {zone.building}
              </p>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                setTimeout(onClose, 300);
              }}
              className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">About this spot</h3>
              <p className="text-zinc-600 leading-relaxed">
                {zone.description}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {zone.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-full text-xs font-medium text-zinc-600">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                How to get there
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {zone.howToGetThere}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
