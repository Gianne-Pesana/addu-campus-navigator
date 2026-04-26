'use client';

import { Category } from '@/types/campus';

interface FilterBarProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  study: 'Study Spots',
  hangout: 'Common Areas',
  food: 'Food Areas',
  library: 'Libraries',
  restroom: 'Restrooms',
  office: 'Offices',
};

export default function FilterBar({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: FilterBarProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-2xl">
      <div className="flex items-center gap-2 p-2 bg-[var(--panel-bg)] backdrop-blur-md rounded-full shadow-[var(--panel-shadow)] overflow-x-auto no-scrollbar border border-white/20">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all
              ${activeCategory === category 
                ? 'bg-zinc-900 text-white shadow-lg scale-105' 
                : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'}
            `}
          >
            {CATEGORY_LABELS[category] || category}
          </button>
        ))}
      </div>
    </div>
  );
}
