'use client';

import { useState, useRef } from 'react';
import { GeoJSONFeature } from '@/types/campus';

interface LocationEditorProps {
  feature: GeoJSONFeature | null;
  onClose: () => void;
  onSave: () => void;
}

export default function LocationEditor({ feature, onClose, onSave }: LocationEditorProps) {
  const isNew = !feature;
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
      const updatedFeature = {
        type: 'Feature',
        id: feature?.id || `pin-${Date.now()}`,
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        properties: {
          ...formData,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // We must have an ID to associate the image. If it's a new unsaved location, 
    // we should ideally save it first. But for simplicity in this MVP, we alert.
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
        // Update local form state immediately
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

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'category' | 'floors' | 'tags') => {
    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-panel-bg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-panel-border p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold mb-6">{isNew ? 'Add New Location' : 'Edit Location'}</h2>

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
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Categories (comma sep)</label>
              <input type="text" value={formData.category?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'category')} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Floors (comma sep)</label>
              <input type="text" value={formData.floors?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'floors')} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2">Tags (comma sep)</label>
              <input type="text" value={formData.tags?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'tags')} className="w-full px-4 py-2 bg-foreground/5 border border-panel-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
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
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              )}
            </div>
            
            {isNew && <p className="text-xs text-foreground/50 mb-4 italic">Save location first to upload images.</p>}

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {formData.photos?.filter(p => p !== 'n/a').map((photo, i) => (
                <div key={i} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-panel-border bg-foreground/5">
                  <img src={typeof photo === 'string' ? photo : (photo as any).url} alt="Location" className="w-full h-full object-cover" />
                </div>
              ))}
              {(!formData.photos || formData.photos.length === 0 || (formData.photos.length === 1 && formData.photos[0] === 'n/a')) && (
                <div className="w-24 h-24 rounded-xl border border-dashed border-panel-border flex items-center justify-center bg-foreground/5">
                  <span className="text-[10px] text-foreground/40 font-semibold uppercase">No images</span>
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
