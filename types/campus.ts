export type Category = string;

export interface Pin {
  id: string;
  name: string;
  category: string[];
  description: string;
  building: string;
  floors: string[];
  tags: string[];
  photos: (string | { url: string; alt: string })[];
  howToGetThere?: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface CampusData {
  pins: Pin[];
  boundary: [number, number][];
}

// GeoJSON Types for raw data management
export interface GeoJSONFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    name: string;
    category: string[];
    description: string;
    building: string;
    floors: string[];
    tags: string[];
    photos: (string | { url: string; alt: string })[];
    howToGetThere: string;
  };
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}
