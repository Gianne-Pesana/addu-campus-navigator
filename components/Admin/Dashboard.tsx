'use client';

import { useState, useEffect } from 'react';
import { GeoJSONData, GeoJSONFeature } from '@/types/campus';
import LocationEditor from './LocationEditor';
import GeoJSONImport from './GeoJSONImport';
import { ThemeToggle } from '../UI/ThemeToggle';

export default function Dashboard() {
  const [data, setData] = useState<GeoJSONData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'locations' | 'import'>('locations');
  const [editingFeature, setEditingFeature] = useState<GeoJSONFeature | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchLocations();
      } else {
        alert('Failed to delete location');
      }
    } catch (err) {
      alert('Error deleting location');
    }
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Existing Locations</h2>
              <button 
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                + Add Location
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-foreground/40 font-medium italic">Loading locations...</div>
            ) : data && data.features.length > 0 ? (
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
                    {data.features.map(feature => (
                      <tr key={feature.id} className="hover:bg-foreground/5 transition-colors">
                        <td className="px-6 py-4 font-semibold">{feature.properties.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-foreground/10 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            {feature.properties.category[0] || 'none'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-foreground/70">{feature.properties.building}</td>
                        <td className="px-6 py-4 text-foreground/70">{feature.properties.floors.join(', ')}</td>
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
                No locations found. Start by adding one or importing a GeoJSON file.
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
