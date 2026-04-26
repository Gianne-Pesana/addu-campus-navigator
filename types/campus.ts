export type Category = 'study' | 'hangout' | 'food' | 'library' | 'restroom' | 'office' | 'all';

export interface Pin {
  id: string;
  name: string;
  category: Category[]; // Mandatory array
  description: string;
  building: string;
  floors: string[]; // Standardized floor array
  tags: string[]; // Mandatory array
  howToGetThere?: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface CampusData {
  pins: Pin[];
  boundary: [number, number][]; // [lat, lng]
}
