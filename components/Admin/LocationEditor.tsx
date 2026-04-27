'use client';

import { useState, useRef } from 'react';
import { GeoJSONFeature } from '@/types/campus';
import { X, Trash2, Upload } from 'lucide-react';

interface LocationEditorProps {
  feature: GeoJSONFeature | null;
  onClose: () => void;
  onSave: () => void;
}

export default function LocationEditor({ feature, onClose, onSave }: LocationEditorProps) {
  const isNew = !feature;
  
  // Local string states for array fields to support smooth typing with commas
  const [categoriesStr, setCategoriesStr] = useState(feature?.properties.category.join(', ') || 'office');
  const [floorsStr, setFloorsStr] = useState(feature?.properties.floors.join(', ') || '1st');
  const [tagsStr, setTagsStr] = useState(feature?.properties.tags.join(', ') || '');

  const [formData, setFormData] = useState<Partial<GeoJSONFeature['properties']>>(
    feature ? feature.properties : {
      name: '',
      category: ['office'],
      description: '',
      building: '',
      floors: ['1st'],
      tags: [],
      photos: ['n/a'],
      howToGetThere: ''
    }
  );
  
  const [lng, setLng] = useState<string>(feature ? feature.geometry.coordinates[0].toString() : '125.61312');
  const [lat, setLat] = useState<string>(feature ? feature.geometry.coordinates[1].toString() : '7.07215');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Parse the string states into arrays just before saving
      const category = categoriesStr.split(',').map(s => s.trim()).filter(Boolean);
      const floors = floorsStr.split(',').map(s => s.trim()).filter(Boolean);
      const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);

      const updatedFeature = {
        type: 'Feature',
        id: feature?.id || `pin-${Date.now()}`,
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        properties: {
          ...formData,
          category,
          floors,
          tags,
          id: feature?.properties.id || `pin-${Date.now()}`
        }
      };

      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFeature)
      });

      if (res.ok) {
        onSave();
      } else {
        alert('Failed to save location');
      }
    } catch (err) {
      alert('Error saving location');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => {
      const updatedPhotos = (prev.photos || []).filter((_, i) => i !== index);
      return {
        ...prev,
        photos: updatedPhotos.length === 0 ? ['n/a'] : updatedPhotos
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (isNew) {
      alert('Please save the location first before uploading images.');
      return;
    }

    setUploadingImage(true);
    const payload = new FormData();
    payload.append('image', file);
    payload.append('locationId', feature.id);

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: payload
      });
      
      const result = await res.json();
      
      if (res.ok && result.photoUrl) {
        setFormData(prev => {
          const currentPhotos = prev.photos || [];
          const updatedPhotos = currentPhotos.includes('n/a') && currentPhotos.length === 1 
            ? [result.photoUrl] 
            : [...currentPhotos, result.photoUrl];
          
          return { ...prev, photos: updatedPhotos };
        });
      } else {
        alert(result.error || 'Failed to upload image');
      }
    } catch (err) {
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-panel-bg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-panel-border p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isNew ? 'Add New Location' : 'Edit Location'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-foreground/40" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Building</label>
              <input type="text" name="building" value={formData.building || ''} onChange={handleChange} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Longitude</label>
              <input type="text" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Latitude</label>
              <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">How To Get There</label>
            <input type="text" name="howToGetThere" value={formData.howToGetThere || ''} onChange={handleChange} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Categories</label>
              <input 
                type="text" 
                value={categoriesStr} 
                onChange={(e) => setCategoriesStr(e.target.value)} 
                placeholder="office, study, etc"
                className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Floors</label>
              <input 
                type="text" 
                value={floorsStr} 
                onChange={(e) => setFloorsStr(e.target.value)} 
                placeholder="1st, 2nd, etc"
                className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Tags</label>
              <input 
                type="text" 
                value={tagsStr} 
                onChange={(e) => setTagsStr(e.target.value)} 
                placeholder="quiet, elevator, etc"
                className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="pt-4 border-t border-panel-border">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider">Location Photos</label>
              {!isNew && (
                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? 'Uploading...' : <><Upload className="w-3.5 h-3.5" /> Upload Image</>}
                  </button>
                </div>
              )}
            </div>
            
            {isNew && <p className="text-xs text-foreground/50 mb-4 italic">Save location first to upload images.</p>}

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 pt-2 px-1">
              {formData.photos?.filter(p => p !== 'n/a').map((photo, i) => (
                <div key={i} className="group relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden border border-panel-border bg-foreground/5 shadow-sm">
                  <img src={typeof photo === 'string' ? photo : (photo as any).url} alt="Location" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleRemovePhoto(i)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform active:scale-90"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(!formData.photos || formData.photos.length === 0 || (formData.photos.length === 1 && formData.photos[0] === 'n/a')) && (
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-panel-border flex flex-col items-center justify-center bg-foreground/5 text-foreground/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider">No photos</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-panel-border">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
