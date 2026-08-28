// ============================================================
// src/services/propertyService.ts — Real Property & Admin API + Fallback
// ============================================================

import { apiRequest } from './api';
import { clientStorage } from './clientStorage';
import type { Property, SearchFilters, Enquiry, AdminStats, UserProfile, AvailabilityStatus } from '../types/property';

export const propertyService = {
  /**
   * GET /api/properties
   */
  async getAll(filters?: Partial<SearchFilters> & { ownerId?: string }): Promise<Property[]> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        if (filters.query) params.append('query', filters.query);
        if (filters.ownerId) params.append('ownerId', filters.ownerId);
        if (filters.types && filters.types.length > 0) params.append('types', filters.types.join(','));
        if (filters.roomTypes && filters.roomTypes.length > 0) params.append('roomTypes', filters.roomTypes.join(','));
        if (filters.minPrice !== null && filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
        if (filters.maxPrice !== null && filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
        if (filters.maxDistance !== null && filters.maxDistance !== undefined) params.append('maxDistance', String(filters.maxDistance));
        if (filters.furnishing && filters.furnishing.length > 0) params.append('furnishing', filters.furnishing.join(','));
        if (filters.amenities && filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
        if (filters.suitableFor && filters.suitableFor.length > 0) params.append('suitableFor', filters.suitableFor.join(','));
        if (filters.availability) params.append('availability', filters.availability);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
      }

      const queryStr = params.toString();
      const endpoint = queryStr ? `/properties?${queryStr}` : '/properties';
      const data = await apiRequest<{ properties: Property[] }>(endpoint);
      return data.properties || [];
    } catch {
      return clientStorage.getProperties(filters);
    }
  },

  /**
   * GET /api/properties/:id
   */
  async getById(id: string): Promise<Property | null> {
    try {
      const data = await apiRequest<{ property: Property }>(`/properties/${id}`);
      return data.property || null;
    } catch {
      return clientStorage.getPropertyById(id);
    }
  },

  /**
   * POST /api/properties
   */
  async create(propertyData: Partial<Property>): Promise<Property> {
    try {
      const data = await apiRequest<{ property: Property; message: string }>('/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
      });
      return data.property;
    } catch {
      const currentUser = clientStorage.getCurrentUser();
      return clientStorage.createProperty(propertyData, currentUser);
    }
  },

  /**
   * PUT /api/properties/:id
   */
  async update(id: string, updates: Partial<Property>): Promise<Property> {
    try {
      const data = await apiRequest<{ property: Property; message: string }>(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return data.property;
    } catch {
      return clientStorage.updateProperty(id, updates);
    }
  },

  /**
   * PATCH /api/properties/:id/availability
   */
  async updateAvailability(id: string, availabilityStatus: AvailabilityStatus): Promise<Property> {
    try {
      const data = await apiRequest<{ property: Property; message: string }>(`/properties/${id}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ availabilityStatus }),
      });
      return data.property;
    } catch {
      return clientStorage.updateAvailability(id, availabilityStatus);
    }
  },

  /**
   * DELETE /api/properties/:id
   */
  async delete(id: string): Promise<void> {
    try {
      await apiRequest(`/properties/${id}`, {
        method: 'DELETE',
      });
    } catch {
      clientStorage.deleteProperty(id);
    }
  },

  // ---------------- SAVED PROPERTIES ---------------- //

  /**
   * GET /api/saved
   */
  async getSaved(): Promise<{ savedIds: string[]; properties: Property[] }> {
    try {
      return await apiRequest<{ savedIds: string[]; properties: Property[] }>('/saved');
    } catch {
      const currentUser = clientStorage.getCurrentUser();
      return clientStorage.getSaved(currentUser?.id);
    }
  },

  /**
   * POST /api/saved/:propertyId
   */
  async save(propertyId: string): Promise<string[]> {
    try {
      const data = await apiRequest<{ savedIds: string[]; message: string }>(`/saved/${propertyId}`, {
        method: 'POST',
      });
      return data.savedIds;
    } catch {
      const currentUser = clientStorage.getCurrentUser();
      return clientStorage.saveProperty(currentUser?.id || 'u_student_001', propertyId);
    }
  },

  /**
   * DELETE /api/saved/:propertyId
   */
  async unsave(propertyId: string): Promise<string[]> {
    try {
      const data = await apiRequest<{ savedIds: string[]; message: string }>(`/saved/${propertyId}`, {
        method: 'DELETE',
      });
      return data.savedIds;
    } catch {
      const currentUser = clientStorage.getCurrentUser();
      return clientStorage.unsaveProperty(currentUser?.id || 'u_student_001', propertyId);
    }
  },

  // ---------------- ENQUIRIES ---------------- //

  /**
   * POST /api/enquiries
   */
  async sendEnquiry(propertyId: string, message: string): Promise<Enquiry> {
    try {
      const data = await apiRequest<{ enquiry: Enquiry; message: string }>('/enquiries', {
        method: 'POST',
        body: JSON.stringify({ propertyId, message }),
      });
      return data.enquiry;
    } catch {
      const currentUser = clientStorage.getCurrentUser();
      return clientStorage.sendEnquiry(propertyId, message, currentUser);
    }
  },

  /**
   * GET /api/enquiries
   */
  async getEnquiries(): Promise<Enquiry[]> {
    try {
      const data = await apiRequest<{ enquiries: Enquiry[] }>('/enquiries');
      return data.enquiries || [];
    } catch {
      const currentUser = clientStorage.getCurrentUser();
      return clientStorage.getEnquiries(currentUser?.id, currentUser?.role);
    }
  },

  /**
   * PATCH /api/enquiries/:id/status
   */
  async updateEnquiryStatus(id: string, status: 'pending' | 'replied' | 'closed'): Promise<Enquiry> {
    try {
      const data = await apiRequest<{ enquiry: Enquiry; message: string }>(`/enquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return data.enquiry;
    } catch {
      return clientStorage.updateEnquiryStatus(id, status);
    }
  },

  // ---------------- ADMIN API ---------------- //

  /**
   * GET /api/admin/stats
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      const data = await apiRequest<{ stats: AdminStats }>('/admin/stats');
      return data.stats;
    } catch {
      return clientStorage.getAdminStats();
    }
  },

  /**
   * GET /api/admin/users
   */
  async getAdminUsers(role?: string): Promise<UserProfile[]> {
    try {
      const query = role ? `?role=${role}` : '';
      const data = await apiRequest<{ users: UserProfile[] }>(`/admin/users${query}`);
      return data.users || [];
    } catch {
      return clientStorage.getAdminUsers(role);
    }
  },

  /**
   * DELETE /api/admin/users/:id
   */
  async deleteAdminUser(id: string): Promise<void> {
    try {
      await apiRequest(`/admin/users/${id}`, {
        method: 'DELETE',
      });
    } catch {
      clientStorage.deleteAdminUser(id);
    }
  },

  /**
   * GET /api/admin/properties
   */
  async getAdminProperties(): Promise<Property[]> {
    try {
      const data = await apiRequest<{ properties: Property[] }>('/admin/properties');
      return data.properties || [];
    } catch {
      return clientStorage.getProperties();
    }
  },
};
