'use client';

import dynamic from 'next/dynamic';

export const MapView = dynamic(
  () => import('./MapView'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-100 animate-pulse flex items-center justify-center">
        <p className="text-zinc-400 font-medium">Loading Map...</p>
      </div>
    )
  }
);
