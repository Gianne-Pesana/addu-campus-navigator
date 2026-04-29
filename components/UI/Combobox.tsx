'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

interface ComboboxProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  multiSelect?: boolean;
}

export default function Combobox({ label, value, options, onChange, placeholder, multiSelect }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (multiSelect) {
      const currentValues = value.split(',').map(v => v.trim()).filter(Boolean);
      if (currentValues.includes(option)) {
        onChange(currentValues.filter(v => v !== option).join(', '));
      } else {
        onChange([...currentValues, option].join(', '));
      }
    } else {
      onChange(option);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const handleCustomAdd = () => {
    if (!searchTerm) return;
    
    if (multiSelect) {
      const currentValues = value.split(',').map(v => v.trim()).filter(Boolean);
      if (!currentValues.includes(searchTerm)) {
        onChange([...currentValues, searchTerm].join(', '));
      }
    } else {
      onChange(searchTerm);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const isSelected = (option: string) => {
    if (multiSelect) {
      return value.split(',').map(v => v.trim()).includes(option);
    }
    return value === option;
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">{label}</label>
      <div 
        className="relative flex items-center w-full bg-foreground/5 border border-panel-border rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen ? "Search or type new..." : (value || placeholder || `Select ${label}...`)}
          className="w-full px-4 py-2 bg-transparent outline-none text-sm placeholder:text-foreground/30"
        />
        <div className="pr-3 flex items-center">
          <ChevronDown className={`w-4 h-4 text-foreground/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[2100] mt-2 w-full bg-panel-bg border border-panel-border rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-indigo-500/10 rounded-lg transition-colors group"
                >
                  <span className={isSelected(option) ? 'text-indigo-500 font-semibold' : 'text-foreground/80'}>
                    {option}
                  </span>
                  {isSelected(option) && <Check className="w-4 h-4 text-indigo-500" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-foreground/40 italic">
                No matches found
              </div>
            )}
            
            {searchTerm && !options.includes(searchTerm) && (
              <button
                onClick={handleCustomAdd}
                className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-left text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors font-semibold border-t border-panel-border"
              >
                <Plus className="w-4 h-4" />
                <span>Add "{searchTerm}"</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
