// ============================================================
// UNI stay DBUU — Property Data & Locations Configuration
// Zero pre-listed properties by default. Real DB listings only.
// ============================================================

import type { Property } from '../types/property';

export const properties: Property[] = [];

export interface AreaLocation {
  id: string;
  name: string;
  label: string;
  image: string;
}

export const locations: AreaLocation[] = [
  { id: 'l1', name: 'Manduwala', label: 'Closest to DBUU', image: 'https://images.unsplash.com/photo-1617178879218-7fcd81c3f5b4?w=400&q=80' },
  { id: 'l2', name: 'Selaqui', label: 'IT Hub Area', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
  { id: 'l3', name: 'Bidholi', label: 'Engineering Zone', image: 'https://images.unsplash.com/photo-1513036191774-b2badb8fcb76?w=400&q=80' },
  { id: 'l4', name: 'Prem Nagar', label: 'Budget Friendly', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80' },
  { id: 'l5', name: 'Sudhowala', label: 'Scenic & Peaceful', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80' },
  { id: 'l6', name: 'University Road', label: 'Walking Distance', image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400&q=80' },
];

export default properties;
