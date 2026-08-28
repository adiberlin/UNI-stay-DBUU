// ============================================================
// server/src/routes/properties.js — Property CRUD & Vacancy API
// ============================================================

import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/properties
 * List properties with comprehensive search & filtering
 */
router.get('/', (req, res) => {
  try {
    let list = db.properties.find();

    const {
      query,
      types,
      roomTypes,
      minPrice,
      maxPrice,
      maxDistance,
      furnishing,
      amenities,
      suitableFor,
      availability,
      ownerId,
      sortBy,
    } = req.query;

    if (ownerId) {
      list = list.filter(p => p.ownerId === ownerId);
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        p =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.type && p.type.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (types) {
      const typeArr = Array.isArray(types) ? types : types.split(',');
      list = list.filter(p => typeArr.includes(p.type));
    }

    if (roomTypes) {
      const rtArr = Array.isArray(roomTypes) ? roomTypes : roomTypes.split(',');
      list = list.filter(p => rtArr.includes(p.roomType));
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) list = list.filter(p => p.price >= min);
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) list = list.filter(p => p.price <= max);
    }

    if (maxDistance) {
      const dist = Number(maxDistance);
      if (!isNaN(dist)) list = list.filter(p => p.distanceFromDBUU <= dist);
    }

    if (furnishing) {
      const fArr = Array.isArray(furnishing) ? furnishing : furnishing.split(',');
      list = list.filter(p => fArr.includes(p.furnishing));
    }

    if (amenities) {
      const aArr = Array.isArray(amenities) ? amenities : amenities.split(',');
      list = list.filter(p => aArr.every(a => p.amenities && p.amenities.includes(a)));
    }

    if (suitableFor) {
      const sArr = Array.isArray(suitableFor) ? suitableFor : suitableFor.split(',');
      list = list.filter(p => sArr.includes(p.suitableFor));
    }

    if (availability) {
      list = list.filter(p => (p.availabilityStatus || 'VACANT').toUpperCase() === availability.toUpperCase());
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'distance':
        list.sort((a, b) => a.distanceFromDBUU - b.distanceFromDBUU);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return res.json({
      count: list.length,
      properties: list,
    });
  } catch (err) {
    console.error('Error fetching properties:', err);
    return res.status(500).json({ message: 'Failed to fetch properties.' });
  }
});

/**
 * GET /api/properties/:id
 */
router.get('/:id', (req, res) => {
  try {
    const property = db.properties.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }
    return res.json({ property });
  } catch (err) {
    console.error('Error fetching property:', err);
    return res.status(500).json({ message: 'Failed to fetch property details.' });
  }
});

/**
 * POST /api/properties
 * Create a new property (OWNER or ADMIN only)
 */
router.post('/', authenticateToken, requireRole('OWNER', 'ADMIN'), (req, res) => {
  try {
    const {
      title,
      description,
      type,
      price,
      deposit,
      location,
      city = 'Dehradun',
      distanceFromDBUU,
      bhk,
      bathrooms,
      area,
      roomType,
      furnishing,
      amenities = [],
      suitableFor,
      foodAvailable = false,
      images = [],
      availabilityStatus = 'VACANT',
    } = req.body;

    // Field validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Property title/name is required.' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Property type is required.' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ message: 'Location/area is required.' });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ message: 'Please enter a valid positive monthly rent.' });
    }
    if (deposit !== undefined && (isNaN(Number(deposit)) || Number(deposit) < 0)) {
      return res.status(400).json({ message: 'Security deposit must be a valid non-negative number.' });
    }
    if (distanceFromDBUU === undefined || isNaN(Number(distanceFromDBUU)) || Number(distanceFromDBUU) < 0) {
      return res.status(400).json({ message: 'Please enter a valid distance from DBUU in km.' });
    }
    if (!roomType) {
      return res.status(400).json({ message: 'Room type is required.' });
    }
    if (!furnishing) {
      return res.status(400).json({ message: 'Furnishing status is required.' });
    }
    if (!suitableFor) {
      return res.status(400).json({ message: 'Please specify who this property is suitable for.' });
    }

    // Hard Limit: Maximum 8 photos
    if (Array.isArray(images) && images.length > 8) {
      return res.status(400).json({ message: 'Maximum 8 photos are allowed per property.' });
    }

    const ownerUser = db.users.findById(req.user.id);
    const ownerInfo = {
      name: req.user.name,
      phone: req.user.phone || (ownerUser ? ownerUser.phone : ''),
      avatar: (ownerUser && ownerUser.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=4f46e5&color=fff`,
      rating: 5.0,
      memberSince: new Date().getFullYear().toString(),
    };

    const finalImages = Array.isArray(images) ? images : [];

    const newProperty = db.properties.insertOne({
      ownerId: req.user.id,
      title: title.trim(),
      description: description || '',
      type,
      price: Number(price),
      deposit: Number(deposit) || Number(price),
      location: location.trim(),
      city: 'Dehradun',
      distanceFromDBUU: Number(distanceFromDBUU),
      bhk: bhk ? Number(bhk) : undefined,
      bathrooms: Number(bathrooms) || 1,
      area: area ? Number(area) : undefined,
      roomType,
      furnishing,
      amenities: Array.isArray(amenities) ? amenities : [],
      suitableFor,
      foodAvailable: Boolean(foodAvailable),
      images: finalImages,
      availabilityStatus: availabilityStatus === 'OCCUPIED' ? 'OCCUPIED' : 'VACANT',
      availableFrom: new Date().toISOString(),
      verified: true,
      owner: ownerInfo,
      rating: 4.5,
      reviewCount: 0,
    });

    return res.status(201).json({
      message: 'Property created successfully.',
      property: newProperty,
    });
  } catch (err) {
    console.error('Error creating property:', err);
    return res.status(500).json({ message: 'Failed to create property. Please try again.' });
  }
});

/**
 * PUT /api/properties/:id
 * Update property details (Owner of property or Admin only)
 */
router.put('/:id', authenticateToken, requireRole('OWNER', 'ADMIN'), (req, res) => {
  try {
    const property = db.properties.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // Ownership check: only property owner or admin can edit
    if (req.user.role !== 'ADMIN' && property.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to modify this property.' });
    }

    const {
      title,
      description,
      type,
      price,
      deposit,
      location,
      distanceFromDBUU,
      bhk,
      bathrooms,
      area,
      roomType,
      furnishing,
      amenities,
      suitableFor,
      foodAvailable,
      images,
      availabilityStatus,
    } = req.body;

    // Hard Limit: Maximum 8 photos
    if (images && Array.isArray(images) && images.length > 8) {
      return res.status(400).json({ message: 'Maximum 8 photos are allowed per property.' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description;
    if (type !== undefined) updates.type = type;
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) <= 0) {
        return res.status(400).json({ message: 'Monthly rent must be a positive number.' });
      }
      updates.price = Number(price);
    }
    if (deposit !== undefined) updates.deposit = Number(deposit);
    if (location !== undefined) updates.location = location.trim();
    if (distanceFromDBUU !== undefined) updates.distanceFromDBUU = Number(distanceFromDBUU);
    if (bhk !== undefined) updates.bhk = Number(bhk);
    if (bathrooms !== undefined) updates.bathrooms = Number(bathrooms);
    if (area !== undefined) updates.area = Number(area);
    if (roomType !== undefined) updates.roomType = roomType;
    if (furnishing !== undefined) updates.furnishing = furnishing;
    if (amenities !== undefined) updates.amenities = amenities;
    if (suitableFor !== undefined) updates.suitableFor = suitableFor;
    if (foodAvailable !== undefined) updates.foodAvailable = Boolean(foodAvailable);
    if (images !== undefined) updates.images = images;
    if (availabilityStatus !== undefined) {
      updates.availabilityStatus = availabilityStatus === 'OCCUPIED' ? 'OCCUPIED' : 'VACANT';
    }

    const updated = db.properties.updateOne(p => p.id === req.params.id, updates);

    return res.json({
      message: 'Property updated successfully.',
      property: updated,
    });
  } catch (err) {
    console.error('Error updating property:', err);
    return res.status(500).json({ message: 'Failed to update property.' });
  }
});

/**
 * PATCH /api/properties/:id/availability
 * Quick toggle for VACANT / OCCUPIED status
 */
router.patch('/:id/availability', authenticateToken, requireRole('OWNER', 'ADMIN'), (req, res) => {
  try {
    const property = db.properties.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    if (req.user.role !== 'ADMIN' && property.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to change availability for this property.' });
    }

    const { availabilityStatus } = req.body;
    const newStatus = availabilityStatus === 'OCCUPIED' ? 'OCCUPIED' : 'VACANT';

    const updated = db.properties.updateOne(p => p.id === req.params.id, {
      availabilityStatus: newStatus,
    });

    return res.json({
      message: `Property marked as ${newStatus}.`,
      property: updated,
    });
  } catch (err) {
    console.error('Error updating availability:', err);
    return res.status(500).json({ message: 'Failed to update property availability.' });
  }
});

/**
 * DELETE /api/properties/:id
 * Delete property (Owner of property or Admin only)
 */
router.delete('/:id', authenticateToken, requireRole('OWNER', 'ADMIN'), (req, res) => {
  try {
    const property = db.properties.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    if (req.user.role !== 'ADMIN' && property.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this property.' });
    }

    db.properties.deleteOne(p => p.id === req.params.id);
    // Remove saved references as well
    db.savedProperties.deleteMany(s => s.propertyId === req.params.id);

    return res.json({ message: 'Property deleted successfully.' });
  } catch (err) {
    console.error('Error deleting property:', err);
    return res.status(500).json({ message: 'Failed to delete property.' });
  }
});

export default router;
