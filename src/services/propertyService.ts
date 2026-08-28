// ============================================================
// src/services/propertyService.ts — Real Property & Admin API
// ============================================================

import { apiRequest } from './api';
import type { Property, SearchFilters, Enquiry, AdminStats, UserProfile, AvailabilityStatus } from '../types/property';

export const propertyService = {
  /**
   * GET /api/properties
   */
  async getAll(filters?: Partial<SearchFilters> & { ownerId?: string }): Promise<Property[]> {
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
  },

  /**
   * GET /api/properties/:id
   */
  async getById(id: string): Promise<Property | null> {
    try {
      const data = await apiRequest<{ property: Property }>(`/properties/${id}`);
      return data.property || null;
    } catch {
      return null;
    }
  },

  /**
   * POST /api/properties
   */
  async create(propertyData: Partial<Property>): Promise<Property> {
    const data = await apiRequest<{ property: Property; message: string }>('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
    return data.property;
  },

  /**
   * PUT /api/properties/:id
   */
  async update(id: string, updates: Partial<Property>): Promise<Property> {
    const data = await apiRequest<{ property: Property; message: string }>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.property;
  },

  /**
   * PATCH /api/properties/:id/availability
   */
  async updateAvailability(id: string, availabilityStatus: AvailabilityStatus): Promise<Property> {
    const data = await apiRequest<{ property: Property; message: string }>(`/properties/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ availabilityStatus }),
    });
    return data.property;
  },

  /**
   * DELETE /api/properties/:id
   */
  async delete(id: string): Promise<void> {
    await apiRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // ---------------- SAVED PROPERTIES ---------------- //

  /**
   * GET /api/saved
   */
  async getSaved(): Promise<{ savedIds: string[]; properties: Property[] }> {
    return await apiRequest<{ savedIds: string[]; properties: Property[] }>('/saved');
  },

  /**
   * POST /api/saved/:propertyId
   */
  async save(propertyId: string): Promise<string[]> {
    const data = await apiRequest<{ savedIds: string[]; message: string }>(`/saved/${propertyId}`, {
      method: 'POST',
    });
    return data.savedIds;
  },

  /**
   * DELETE /api/saved/:propertyId
   */
  async unsave(propertyId: string): Promise<string[]> {
    const data = await apiRequest<{ savedIds: string[]; message: string }>(`/saved/${propertyId}`, {
      method: 'DELETE',
    });
    return data.savedIds;
  },

  // ---------------- ENQUIRIES ---------------- //

  /**
   * POST /api/enquiries
   */
  async sendEnquiry(propertyId: string, message: string): Promise<Enquiry> {
    const data = await apiRequest<{ enquiry: Enquiry; message: string }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify({ propertyId, message }),
    });
    return data.enquiry;
  },

  /**
   * GET /api/enquiries
   */
  async getEnquiries(): Promise<Enquiry[]> {
    const data = await apiRequest<{ enquiries: Enquiry[] }>('/enquiries');
    return data.enquiries || [];
  },

  /**
   * PATCH /api/enquiries/:id/status
   */
  async updateEnquiryStatus(id: string, status: 'pending' | 'replied' | 'closed'): Promise<Enquiry> {
    const data = await apiRequest<{ enquiry: Enquiry; message: string }>(`/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return data.enquiry;
  },

  // ---------------- ADMIN API ---------------- //

  /**
   * GET /api/admin/stats
   */
  async getAdminStats(): Promise<AdminStats> {
    const data = await apiRequest<{ stats: AdminStats }>('/admin/stats');
    return data.stats;
  },

  /**
   * GET /api/admin/users
   */
  async getAdminUsers(role?: string): Promise<UserProfile[]> {
    const query = role ? `?role=${role}` : '';
    const data = await apiRequest<{ users: UserProfile[] }>(`/admin/users${query}`);
    return data.users || [];
  },

  /**
   * DELETE /api/admin/users/:id
   */
  async deleteAdminUser(id: string): Promise<void> {
    await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /api/admin/properties
   */
  async getAdminProperties(): Promise<Property[]> {
    const data = await apiRequest<{ properties: Property[] }>('/admin/properties');
    return data.properties || [];
  },
};
