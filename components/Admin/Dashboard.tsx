'use client';

import { useState, useEffect, useMemo } from 'react';
import { GeoJSONData, GeoJSONFeature } from '@/types/campus';
import LocationEditor from './LocationEditor';
import GeoJSONImport from './GeoJSONImport';
import { ThemeToggle } from '../UI/ThemeToggle';
import { Search, Filter, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function Dashboard() {
  const [data, setData] = useState<GeoJSONData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'locations' | 'import'>('locations');
  const [editingFeature, setEditingFeature] = useState<GeoJSONFeature | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState('all');

  const supabase = createClient();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/locations');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'locations' },
        () => fetchLocations()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'photos' },
        () => fetchLocations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        alert('Failed to delete location');
      }
      // Real-time subscription will handle the UI update
    } catch (err) {
      alert('Error deleting location');
    }
  };

  // Derived Filter Options
  const categories = useMemo(() => {
    if (!data) return ['all'];
    const cats = new Set<string>();
    data.features.forEach(f => {
      f.properties.category.forEach(c => cats.add(c));
    });
    return ['all', ...Array.from(cats).sort()];
  }, [data]);

  const buildings = useMemo(() => {
    if (!data) return ['all'];
    const bldgs = new Set<string>();
    data.features.forEach(f => {
      if (f.properties.building) bldgs.add(f.properties.building);
    });
    return ['all', ...Array.from(bldgs).sort()];
  }, [data]);

  const availableBuildings = useMemo(() => buildings.filter(b => b !== 'all'), [buildings]);
  const availableCategories = useMemo(() => categories.filter(c => c !== 'all'), [categories]);
  const availableFloors = useMemo(() => {
    if (!data) return [];
    const floors = new Set<string>();
    data.features.forEach(f => f.properties.floors.forEach(fl => floors.add(fl)));
    return Array.from(floors).sort();
  }, [data]);

  // Filtering Logic
  const filteredFeatures = useMemo(() => {
    if (!data) return [];
    return data.features.filter(f => {
      const matchesSearch = f.properties.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || f.properties.category.includes(selectedCategory);
      const matchesBuilding = selectedBuilding === 'all' || f.properties.building === selectedBuilding;
      return matchesSearch && matchesCategory && matchesBuilding;
    });
  }, [data, searchQuery, selectedCategory, selectedBuilding]);

  // Helper to condense floors
  const formatFloorsCompact = (floors: string[]) => {
    if (!floors || floors.length === 0) return 'None';
    if (floors.length <= 2) return floors.join(', ');
    
    // Check if they are mostly numeric to allow range display
    const isSequential = floors.every(f => !isNaN(parseInt(f)));
    if (isSequential && floors.length > 2) {
      return `${floors[0]} - ${floors[floors.length - 1]}`;
    }
    
    return `${floors[0]}, ${floors[1]} +${floors.length - 2} more`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBuilding('all');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <header className="pt-20 pb-10 px-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          Admin Dashboard
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Campus Management</h1>
        <p className="text-foreground/60 font-medium">Update map data, upload images, and manage campus locations.</p>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-panel-border pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'locations' ? 'bg-foreground text-background shadow-md' : 'text-foreground/60 hover:bg-foreground/5'}`}
          >
            Manage Locations
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'import' ? 'bg-foreground text-background shadow-md' : 'text-foreground/60 hover:bg-foreground/5'}`}
          >
            GeoJSON Import
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold">Existing Locations ({filteredFeatures.length})</h2>
              <button 
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                + Add Location
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-panel-bg p-4 rounded-2xl border border-panel-border">
              {/* Search */}
              <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input 
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-foreground/5 border border-panel-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-foreground/5 border border-panel-border rounded-xl text-sm outline-none appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Building Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <select 
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-foreground/5 border border-panel-border rounded-xl text-sm outline-none appearance-none cursor-pointer"
                >
                  {buildings.map(b => (
                    <option key={b} value={b}>{b === 'all' ? 'All Buildings' : b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters / Reset */}
            {(searchQuery || selectedCategory !== 'all' || selectedBuilding !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground/40 uppercase">Active Filters:</span>
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-[10px] font-bold hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              </div>
            )}

            {loading ? (
              <div className="py-20 text-center text-foreground/40 font-medium italic">Loading locations...</div>
            ) : filteredFeatures.length > 0 ? (
              <div className="bg-panel-bg border border-panel-border rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-foreground/5 text-foreground/60 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Category</th>
                      <th className="px-6 py-4 font-bold">Building</th>
                      <th className="px-6 py-4 font-bold">Floors</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-panel-border">
                    {filteredFeatures.map(feature => (
                      <tr key={feature.id} className="hover:bg-foreground/5 transition-colors">
                        <td className="px-6 py-4 font-semibold">{feature.properties.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {feature.properties.category.map(c => (
                              <span key={c} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground/70">{feature.properties.building}</td>
                        <td className="px-6 py-4 text-foreground/70">{formatFloorsCompact(feature.properties.floors)}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setEditingFeature(feature)}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold mr-4 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(feature.id)}
                            className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-foreground/40 font-medium bg-panel-bg border border-panel-border rounded-2xl border-dashed">
                {data?.features.length === 0 ? 'No locations found. Add one to get started.' : 'No results match your current filters.'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <GeoJSONImport onImportSuccess={fetchLocations} />
        )}
      </main>

      {/* Editor Modal */}
      {(editingFeature || isCreating) && (
        <LocationEditor 
          feature={editingFeature} 
          availableBuildings={availableBuildings}
          availableCategories={availableCategories}
          availableFloors={availableFloors}
          onClose={() => {
            setEditingFeature(null);
            setIsCreating(false);
          }}
          onSave={() => {
            setEditingFeature(null);
            setIsCreating(false);
            fetchLocations();
          }}
        />
      )}
    </div>
  );
}
