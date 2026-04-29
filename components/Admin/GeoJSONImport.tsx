'use client';

import { useState } from 'react';

interface GeoJSONImportProps {
  onImportSuccess: () => void;
}

export default function GeoJSONImport({ onImportSuccess }: GeoJSONImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: `Import complete: ${data.count} new locations added, ${data.skipped} skipped as duplicates.` 
        });
        setFile(null);
        onImportSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Import failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error during import.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-panel-bg border border-panel-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Import GeoJSON Data</h2>
        <p className="text-sm text-foreground/60 mb-8 leading-relaxed">
          Upload a <code>.geojson</code> file containing locations. The system will automatically standardize the data format. Existing locations (matched by ID, name, or exact coordinates) will be skipped to prevent overriding current data.
        </p>

        <div className="border-2 border-dashed border-panel-border rounded-2xl p-10 text-center hover:bg-foreground/5 transition-colors mb-6">
          <input 
            type="file" 
            accept=".geojson,application/geo+json"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-foreground/50
              file:mr-4 file:py-2.5 file:px-6
              file:rounded-full file:border-0
              file:text-sm file:font-bold
              file:bg-indigo-50 file:text-indigo-600
              hover:file:bg-indigo-100 file:cursor-pointer file:transition-colors
              cursor-pointer"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Run Import Process'}
        </button>
      </div>
    </div>
  );
}
