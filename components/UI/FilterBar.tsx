'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const formatLabel = (key: string): string => {
  if (key === 'all') return 'All';
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function FilterBar({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: FilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-6xl px-2 flex items-center gap-3">
      
      {/* Home Button */}
      <Link 
        href="/"
        className="flex-shrink-0 p-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 border border-white text-zinc-600 hover:text-zinc-950 transition-all active:scale-95"
        aria-label="Back to home"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </Link>

      {/* Categories Wrapper */}
      <div className="relative group flex flex-1 items-center min-w-0">
        
        {showLeftArrow && (
          <button 
            onClick={() => handleScroll('left')}
            className="absolute -left-2 md:-left-4 z-20 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all flex active:scale-90"
            aria-label="Scroll categories left"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 overflow-x-auto border border-white no-scrollbar select-none w-full"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0
                ${activeCategory === category 
                  ? 'bg-zinc-900 text-white shadow-lg scale-105' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80'}
              `}
            >
              {formatLabel(category)}
            </button>
          ))}
        </div>

        {showRightArrow && (
          <button 
            onClick={() => handleScroll('right')}
            className="absolute -right-2 md:-right-4 z-20 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all flex active:scale-90"
            aria-label="Scroll categories right"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}

        <div className={`absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/80 to-transparent pointer-events-none rounded-l-2xl transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/80 to-transparent pointer-events-none rounded-r-2xl transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* About Button */}
      <Link 
        href="/about"
        className="flex-shrink-0 p-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 border border-white text-zinc-600 hover:text-zinc-950 transition-all active:scale-95"
        aria-label="About project"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </Link>
    </div>
  );
}
