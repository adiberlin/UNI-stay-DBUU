// ============================================================
// src/services/clientStorage.ts — Client-Side Fallback Engine
// Provides full persistence & demo data when backend API is offline
// (e.g. static hosting on Netlify)
// ============================================================

import type { Property, SearchFilters, Enquiry, AdminStats, UserProfile, AvailabilityStatus } from '../types/property';
import type { LoginCredentials, RegisterData } from './authService';

const STORAGE_KEY_PROPERTIES = 'dbuu_properties_v2';
const STORAGE_KEY_USERS = 'dbuu_users_v2';
const STORAGE_KEY_SAVED = 'dbuu_saved_v2';
const STORAGE_KEY_ENQUIRIES = 'dbuu_enquiries_v2';
const STORAGE_KEY_CURRENT_USER = 'dbuu_current_user_v2';

const initialProperties: Property[] = [
  {
    id: 'prop_dbuu_001',
    ownerId: 'u_owner_001',
    title: 'Shree Sai Girls PG & Hostel',
    description: 'Safe, premium girls accommodation right near Dev Bhoomi Uttarakhand University campus. Includes 3 nutritious home-cooked meals, high-speed Wi-Fi, CCTV security, study table, power backup, and laundry facility.',
    type: 'PG',
    price: 6500,
    deposit: 2000,
    location: 'Manduwala, Near Gate 2 DBUU, Dehradun',
    city: 'Dehradun',
    distanceFromDBUU: 0.4,
    roomType: 'Double Sharing',
    bathrooms: 2,
    area: 280,
    furnishing: 'Furnished',
    amenities: ['Wi-Fi', 'Food Included', 'Power Backup', 'Attached Bathroom', 'Geyser', 'CCTV', 'Washing Machine', 'Study Table'],
    suitableFor: 'Girls',
    foodAvailable: true,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
    ],
    availabilityStatus: 'VACANT',
    availableFrom: 'Immediately',
    verified: true,
    owner: {
      name: 'Amit Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      phone: '9876543210',
      rating: 4.9,
      memberSince: '2023',
    },
    rating: 4.8,
    reviewCount: 24,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'prop_dbuu_002',
    ownerId: 'u_owner_001',
    title: 'Dev Bhoomi Boys Residency',
    description: 'Comfortable and spacious boys PG located on University Road. Walkable distance to lecture halls, clean rooms with attached balconies, gym access, 24/7 water and electricity.',
    type: 'Hostel',
    price: 7000,
    deposit: 3000,
    location: 'University Road, Manduwala, Dehradun',
    city: 'Dehradun',
    distanceFromDBUU: 0.2,
    roomType: 'Single',
    bathrooms: 1,
    area: 220,
    furnishing: 'Furnished',
    amenities: ['Wi-Fi', 'Food Included', 'Power Backup', 'Attached Bathroom', 'Balcony', 'Gym Access', 'Parking'],
    suitableFor: 'Boys',
    foodAvailable: true,
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80'
    ],
    availabilityStatus: 'VACANT',
    availableFrom: 'Immediately',
    verified: true,
    owner: {
      name: 'Amit Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      phone: '9876543210',
      rating: 4.7,
      memberSince: '2023',
    },
    rating: 4.7,
    reviewCount: 19,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'prop_dbuu_003',
    ownerId: 'u_owner_001',
    title: 'Pine View 2 BHK Student Apartment',
    description: 'Modern 2 BHK furnished flat in Selaqui with scenic mountain view. Ideal for 3-4 friends wanting independent living with modular kitchen, RO purifier, and reserved bike parking.',
    type: 'Flat',
    price: 13000,
    deposit: 10000,
    location: 'Main Bazar, Selaqui, Dehradun',
    city: 'Dehradun',
    distanceFromDBUU: 2.5,
    roomType: '2 BHK',
    bhk: 2,
    bathrooms: 2,
    area: 850,
    furnishing: 'Furnished',
    amenities: ['Wi-Fi', 'Power Backup', 'Balcony', 'Parking', 'Refrigerator', 'Geyser', 'CCTV'],
    suitableFor: 'Co-living',
    foodAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80'
    ],
    availabilityStatus: 'VACANT',
    availableFrom: 'Immediately',
    verified: true,
    owner: {
      name: 'Amit Sharma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      phone: '9876543210',
      rating: 4.9,
      memberSince: '2023',
    },
    rating: 4.9,
    reviewCount: 15,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'prop_dbuu_004',
    ownerId: 'u_owner_001',
    title: 'Greenwood Student Rooms & PG',
    description: 'Budget-friendly student rooms near Bidholi Chowk. Quiet study atmosphere, high-speed fiber internet, and daily housekeeping.',
    type: 'Room',
    price: 5200,
    deposit: 1500,
    location: 'Bidholi Road, Near DBUU, Dehradun',
    city: 'Dehradun',
    distanceFromDBUU: 1.8,
    roomType: 'Single',
    bathrooms: 1,
    area: 190,
    furnishing: 'Semi-Furnished',
    amenities: ['Wi-Fi', 'Attached Bathroom', 'Power Backup', 'Study Table', 'Parking'],
    suitableFor: 'Boys',
    foodAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80'
    ],
    availabilityStatus: 'VACANT',
    availableFrom: 'Immediately',
    verified: true,
    owner: {
      name: 'Amit Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
      phone: '9876543210',
      rating: 4.6,
      memberSince: '2023',
    },
    rating: 4.5,
    reviewCount: 11,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'prop_dbuu_005',
    ownerId: 'u_owner_001',
    title: 'Doon Valley Executive Stay',
    description: 'Executive student stay in Prem Nagar with transport connectivity to DBUU. Air conditioning, fully furnished rooms, gaming room, and cafeteria.',
    type: 'PG',
    price: 8500,
    deposit: 3000,
    location: 'Prem Nagar Main Market, Dehradun',
    city: 'Dehradun',
    distanceFromDBUU: 3.6,
    roomType: 'Double Sharing',
    bathrooms: 2,
    area: 320,
    furnishing: 'Furnished',
    amenities: ['Wi-Fi', 'AC', 'Food Included', 'Power Backup', 'Attached Bathroom', 'CCTV', 'Geyser', 'Washing Machine'],
    suitableFor: 'Co-living',
    foodAvailable: true,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'
    ],
    availabilityStatus: 'VACANT',
    availableFrom: 'Immediately',
    verified: true,
    owner: {
      name: 'Amit Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      phone: '9876543210',
      rating: 4.9,
      memberSince: '2023',
    },
    rating: 4.9,
    reviewCount: 31,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'doc_1787948676105_d8eyua',
    ownerId: 'u_owner_001',
    title: 'Ritu Residency 2BHK Room',
    description: 'Spacious furnished room in 2BHK setting near Peepal Chowk. Wi-Fi, balcony, and power backup.',
    type: 'Room',
    price: 6000,
    deposit: 500,
    location: 'Peepal Chawak, Manduwala, Dehradun',
    city: 'Dehradun',
    distanceFromDBUU: 1.0,
    roomType: 'Double Sharing',
    bathrooms: 1,
    area: 250,
    furnishing: 'Furnished',
    amenities: ['Wi-Fi', 'Parking', 'Power Backup', 'Attached Bathroom', 'Study Table', 'Balcony', 'CCTV'],
    suitableFor: 'Co-living',
    foodAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80'
    ],
    availabilityStatus: 'VACANT',
    availableFrom: 'Immediately',
    verified: true,
    owner: {
      name: 'Amit Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      phone: '9876543210',
      rating: 4.7,
      memberSince: '2024',
    },
    rating: 4.6,
    reviewCount: 8,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

const initialUsers: (UserProfile & { password: string })[] = [
  {
    id: 'u_admin_001',
    name: 'System Admin',
    email: 'admin@dbuu.ac.in',
    phone: '9876543200',
    role: 'ADMIN',
    password: 'Admin@12345',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u_owner_001',
    name: 'Amit Sharma',
    email: 'owner@dbuu.ac.in',
    phone: '9876543210',
    role: 'OWNER',
    password: 'Owner@12345',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u_student_001',
    name: 'Aditya Kumar',
    email: 'student@dbuu.ac.in',
    phone: '9876501234',
    role: 'STUDENT',
    lookingFor: 'PG',
    budget: 8000,
    password: 'Student@12345',
    createdAt: new Date().toISOString(),
  },
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

export const clientStorage = {
  // Properties
  getProperties(filters?: Partial<SearchFilters> & { ownerId?: string }): Property[] {
    let list = getStored<Property[]>(STORAGE_KEY_PROPERTIES, initialProperties);

    if (filters) {
      if (filters.ownerId) {
        list = list.filter(p => p.ownerId === filters.ownerId);
      }
      if (filters.query) {
        const q = filters.query.toLowerCase();
        list = list.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
        );
      }
      if (filters.types && filters.types.length > 0) {
        list = list.filter(p => filters.types!.includes(p.type));
      }
      if (filters.roomTypes && filters.roomTypes.length > 0) {
        list = list.filter(p => filters.roomTypes!.includes(p.roomType));
      }
      if (filters.minPrice !== null && filters.minPrice !== undefined) {
        list = list.filter(p => p.price >= Number(filters.minPrice));
      }
      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        list = list.filter(p => p.price <= Number(filters.maxPrice));
      }
      if (filters.maxDistance !== null && filters.maxDistance !== undefined) {
        list = list.filter(p => p.distanceFromDBUU <= Number(filters.maxDistance));
      }
      if (filters.furnishing && filters.furnishing.length > 0) {
        list = list.filter(p => filters.furnishing!.includes(p.furnishing));
      }
      if (filters.amenities && filters.amenities.length > 0) {
        list = list.filter(p => filters.amenities!.every(a => p.amenities.includes(a)));
      }
      if (filters.suitableFor && filters.suitableFor.length > 0) {
        list = list.filter(p => filters.suitableFor!.includes(p.suitableFor));
      }
      if (filters.availability) {
        list = list.filter(p => (p.availabilityStatus || 'VACANT') === filters.availability);
      }

      if (filters.sortBy) {
        if (filters.sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
        if (filters.sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
        if (filters.sortBy === 'distance') list.sort((a, b) => a.distanceFromDBUU - b.distanceFromDBUU);
        if (filters.sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }
    }

    return list;
  },

  getPropertyById(id: string): Property | null {
    const list = getStored<Property[]>(STORAGE_KEY_PROPERTIES, initialProperties);
    return list.find(p => p.id === id) || null;
  },

  createProperty(data: Partial<Property>, currentUser?: UserProfile | null): Property {
    const list = getStored<Property[]>(STORAGE_KEY_PROPERTIES, initialProperties);
    const newProp: Property = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ownerId: currentUser?.id || 'u_owner_001',
      title: data.title || 'Untitled Stay',
      description: data.description || '',
      type: data.type || 'PG',
      price: Number(data.price) || 5000,
      deposit: Number(data.deposit) || 1000,
      location: data.location || 'Manduwala, Dehradun',
      city: 'Dehradun',
      distanceFromDBUU: Number(data.distanceFromDBUU) || 1,
      roomType: data.roomType || 'Single',
      bathrooms: Number(data.bathrooms) || 1,
      area: Number(data.area) || 200,
      furnishing: data.furnishing || 'Furnished',
      amenities: data.amenities || ['Wi-Fi', 'Power Backup'],
      suitableFor: data.suitableFor || 'Co-living',
      foodAvailable: !!data.foodAvailable,
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
      availabilityStatus: data.availabilityStatus || 'VACANT',
      availableFrom: data.availableFrom || 'Immediately',
      verified: true,
      owner: {
        name: currentUser?.name || 'Verified Owner',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        phone: currentUser?.phone || '9876543210',
        rating: 5.0,
        memberSince: '2024',
      },
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProp, ...list];
    setStored(STORAGE_KEY_PROPERTIES, updated);
    return newProp;
  },

  updateProperty(id: string, updates: Partial<Property>): Property {
    const list = getStored<Property[]>(STORAGE_KEY_PROPERTIES, initialProperties);
    const index = list.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Property not found');

    const updatedProp = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updatedProp;
    setStored(STORAGE_KEY_PROPERTIES, list);
    return updatedProp;
  },

  updateAvailability(id: string, status: AvailabilityStatus): Property {
    return this.updateProperty(id, { availabilityStatus: status });
  },

  deleteProperty(id: string): void {
    const list = getStored<Property[]>(STORAGE_KEY_PROPERTIES, initialProperties);
    const filtered = list.filter(p => p.id !== id);
    setStored(STORAGE_KEY_PROPERTIES, filtered);
  },

  // Saved Properties
  getSaved(userId: string = 'u_student_001'): { savedIds: string[]; properties: Property[] } {
    const savedMap = getStored<Record<string, string[]>>(STORAGE_KEY_SAVED, {
      u_student_001: ['prop_dbuu_001', 'prop_dbuu_002'],
    });
    const savedIds = savedMap[userId] || [];
    const allProps = this.getProperties();
    const props = allProps.filter(p => savedIds.includes(p.id));
    return { savedIds, properties: props };
  },

  saveProperty(userId: string, propertyId: string): string[] {
    const savedMap = getStored<Record<string, string[]>>(STORAGE_KEY_SAVED, {});
    const current = savedMap[userId] || [];
    if (!current.includes(propertyId)) {
      current.push(propertyId);
      savedMap[userId] = current;
      setStored(STORAGE_KEY_SAVED, savedMap);
    }
    return current;
  },

  unsaveProperty(userId: string, propertyId: string): string[] {
    const savedMap = getStored<Record<string, string[]>>(STORAGE_KEY_SAVED, {});
    const current = savedMap[userId] || [];
    savedMap[userId] = current.filter(id => id !== propertyId);
    setStored(STORAGE_KEY_SAVED, savedMap);
    return savedMap[userId];
  },

  // Auth & Users
  login(credentials: LoginCredentials): UserProfile {
    const users = getStored(STORAGE_KEY_USERS, initialUsers);
    const emailLower = credentials.email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === emailLower);

    if (!user) {
      throw new Error('Invalid email or password. For demo: student@dbuu.ac.in / Student@12345');
    }

    // Return user profile
    const profile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      lookingFor: user.lookingFor,
      budget: user.budget,
      createdAt: user.createdAt,
    };
    setStored(STORAGE_KEY_CURRENT_USER, profile);
    return profile;
  },

  register(data: RegisterData): UserProfile {
    const users = getStored(STORAGE_KEY_USERS, initialUsers);
    const emailLower = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === emailLower)) {
      throw new Error('Email is already registered. Please log in.');
    }

    const newUser = {
      id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      lookingFor: data.lookingFor,
      budget: data.budget,
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStored(STORAGE_KEY_USERS, users);

    const profile: UserProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      lookingFor: newUser.lookingFor,
      budget: newUser.budget,
      createdAt: newUser.createdAt,
    };
    setStored(STORAGE_KEY_CURRENT_USER, profile);
    return profile;
  },

  getCurrentUser(): UserProfile | null {
    return getStored<UserProfile | null>(STORAGE_KEY_CURRENT_USER, null);
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const users = getStored(STORAGE_KEY_USERS, initialUsers);
    const index = users.findIndex(u => u.id === currentUser.id);

    const updated = {
      ...currentUser,
      ...updates,
    };

    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      setStored(STORAGE_KEY_USERS, users);
    }

    setStored(STORAGE_KEY_CURRENT_USER, updated);
    return updated;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  },

  // Enquiries
  sendEnquiry(propertyId: string, message: string, currentUser?: UserProfile | null): Enquiry {
    const prop = this.getPropertyById(propertyId);
    const enquiries = getStored<Enquiry[]>(STORAGE_KEY_ENQUIRIES, []);

    const newEnquiry: Enquiry = {
      id: `enq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: currentUser?.id || 'u_student_001',
      studentName: currentUser?.name || 'Aditya Kumar',
      studentEmail: currentUser?.email || 'student@dbuu.ac.in',
      studentPhone: currentUser?.phone || '9876501234',
      propertyId,
      propertyTitle: prop?.title || 'Student Stay',
      ownerId: prop?.ownerId || 'u_owner_001',
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    enquiries.unshift(newEnquiry);
    setStored(STORAGE_KEY_ENQUIRIES, enquiries);
    return newEnquiry;
  },

  getEnquiries(userId?: string, role?: string): Enquiry[] {
    const enquiries = getStored<Enquiry[]>(STORAGE_KEY_ENQUIRIES, []);
    if (!userId) return enquiries;
    if (role === 'OWNER') return enquiries.filter(e => e.ownerId === userId);
    if (role === 'STUDENT') return enquiries.filter(e => e.studentId === userId);
    return enquiries;
  },

  updateEnquiryStatus(id: string, status: 'pending' | 'replied' | 'closed'): Enquiry {
    const enquiries = getStored<Enquiry[]>(STORAGE_KEY_ENQUIRIES, []);
    const item = enquiries.find(e => e.id === id);
    if (!item) throw new Error('Enquiry not found');
    item.status = status;
    setStored(STORAGE_KEY_ENQUIRIES, enquiries);
    return item;
  },

  // Admin
  getAdminStats(): AdminStats {
    const users = getStored(STORAGE_KEY_USERS, initialUsers);
    const properties = this.getProperties();
    const enquiries = getStored<Enquiry[]>(STORAGE_KEY_ENQUIRIES, []);

    return {
      totalStudents: users.filter(u => u.role === 'STUDENT').length,
      totalOwners: users.filter(u => u.role === 'OWNER').length,
      totalProperties: properties.length,
      vacantProperties: properties.filter(p => (p.availabilityStatus || 'VACANT') === 'VACANT').length,
      occupiedProperties: properties.filter(p => p.availabilityStatus === 'OCCUPIED').length,
      totalEnquiries: enquiries.length,
      pendingEnquiries: enquiries.filter(e => e.status === 'pending').length,
    };
  },

  getAdminUsers(role?: string): UserProfile[] {
    const users = getStored(STORAGE_KEY_USERS, initialUsers);
    if (role) return users.filter(u => u.role === role);
    return users;
  },

  deleteAdminUser(id: string): void {
    const users = getStored(STORAGE_KEY_USERS, initialUsers);
    const filtered = users.filter(u => u.id !== id);
    setStored(STORAGE_KEY_USERS, filtered);
  },
};
