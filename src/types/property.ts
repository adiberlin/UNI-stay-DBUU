// ============================================================
// UNI stay DBUU — TypeScript Interfaces & Types
// ============================================================

export type UserRole = 'STUDENT' | 'OWNER' | 'ADMIN';

export type AvailabilityStatus = 'VACANT' | 'OCCUPIED';

export type PropertyType = 'PG' | 'Hostel' | 'Room' | 'Flat';

export type RoomType =
  | 'Single'
  | 'Double Sharing'
  | 'Triple Sharing'
  | '1 BHK'
  | '2 BHK'
  | '3 BHK';

export type Furnishing = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type SuitableFor = 'Boys' | 'Girls' | 'Co-living' | 'Family';

export interface PropertyOwner {
  name: string;
  avatar: string;
  phone?: string;
  rating?: number;
  memberSince?: string;
}

export interface Property {
  id: string;
  ownerId?: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  deposit: number;
  location: string;
  city: 'Dehradun';
  distanceFromDBUU: number; // in km
  roomType: RoomType;
  bhk?: number;
  bathrooms: number;
  area?: number; // sq ft
  furnishing: Furnishing;
  amenities: string[];
  suitableFor: SuitableFor;
  foodAvailable: boolean;
  images: string[];
  availabilityStatus?: AvailabilityStatus;
  availableFrom: string;
  verified: boolean;
  owner: PropertyOwner;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchFilters {
  query: string;
  types: PropertyType[];
  roomTypes: RoomType[];
  minPrice: number | null;
  maxPrice: number | null;
  maxDistance: number | null;
  furnishing: Furnishing[];
  amenities: string[];
  suitableFor: SuitableFor[];
  availability?: AvailabilityStatus | '';
  sortBy: 'price_asc' | 'price_desc' | 'distance' | 'newest';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  lookingFor?: string;
  budget?: number;
  createdAt?: string;
}

export interface Enquiry {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  propertyId: string;
  propertyTitle: string;
  ownerId?: string;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  createdAt: string;
}

export interface AdminStats {
  totalStudents: number;
  totalOwners: number;
  totalProperties: number;
  vacantProperties: number;
  occupiedProperties: number;
  totalEnquiries: number;
  pendingEnquiries: number;
}
