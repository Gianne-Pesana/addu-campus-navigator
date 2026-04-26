'use client';

import { useRef, useState, useEffect } from 'react';

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
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-4xl px-2">
      <div className="relative group flex items-center">
        
        {/* Left Arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-1 z-10 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all hidden md:flex"
            aria-label="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        {/* Main Filter Container - Light Professional Theme */}
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
                  ? 'bg-zinc-900 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80'}
              `}
            >
              {formatLabel(category)}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-1 z-10 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all hidden md:flex"
            aria-label="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
