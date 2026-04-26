'use client';

import { Category } from '@/types/campus';

interface FilterBarProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

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
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeCategory === category 
                ? 'bg-zinc-900 text-white shadow-md' 
                : 'hover:bg-zinc-100 text-zinc-600'}
            `}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
