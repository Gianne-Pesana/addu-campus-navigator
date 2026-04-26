export type Category = 'Study Spots' | 'Restrooms (CR)' | 'Hangout Areas' | 'Food Areas' | 'Offices / Services';

export interface Zone {
  id: string;
  name: string;
  category: Category;
  coordinates: [number, number][]; // [lat, lng]
  building: string;
  description: string;
  tags: string[];
  howToGetThere: string;
}

export interface CampusData {
  zones: Zone[];
  boundary: [number, number][]; // [lat, lng]
}
