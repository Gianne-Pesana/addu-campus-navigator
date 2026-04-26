export type Category = string; // Using string for dynamic categories, standardizing 'all'

export interface Pin {
  id: string;
  name: string;
  category: string[]; // Standardized lowercase keys (e.g. 'sports_and_recreation')
  description: string;
  building: string;
  floors: string[];
  tags: string[];
  howToGetThere?: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface CampusData {
  pins: Pin[];
  boundary: [number, number][]; // [lat, lng]
}
