'use client';

import dynamic from 'next/dynamic';

export const MapView = dynamic(
  () => import('./MapView'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-background animate-pulse flex items-center justify-center">
        <p className="text-foreground/40 font-medium italic">Preparing Map Surface...</p>
      </div>
    )
  }
);
