// ============================================================
// server/src/routes/admin.js — Admin Management & Statistics API
// ============================================================

import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply Admin-only middleware to all admin routes
router.use(authenticateToken, requireRole('ADMIN'));

/**
 * GET /api/admin/stats
 * Platform overview statistics
 */
router.get('/stats', (req, res) => {
  try {
    const users = db.users.find();
    const properties = db.properties.find();
    const enquiries = db.enquiries.find();

    const totalStudents = users.filter(u => u.role === 'STUDENT').length;
    const totalOwners = users.filter(u => u.role === 'OWNER').length;
    const totalProperties = properties.length;
    const vacantProperties = properties.filter(p => (p.availabilityStatus || 'VACANT').toUpperCase() === 'VACANT').length;
    const occupiedProperties = properties.filter(p => (p.availabilityStatus || 'VACANT').toUpperCase() === 'OCCUPIED').length;
    const pendingEnquiries = enquiries.filter(e => e.status === 'pending').length;

    return res.json({
      stats: {
        totalStudents,
        totalOwners,
        totalProperties,
        vacantProperties,
        occupiedProperties,
        totalEnquiries: enquiries.length,
        pendingEnquiries,
      },
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ message: 'Failed to fetch platform statistics.' });
  }
});

/**
 * GET /api/admin/users
 * List all registered users
 */
router.get('/users', (req, res) => {
  try {
    const { role } = req.query;
    let list = db.users.find();

    if (role) {
      list = list.filter(u => u.role === role.toUpperCase());
    }

    const sanitized = list.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      lookingFor: u.lookingFor,
      budget: u.budget,
      createdAt: u.createdAt,
    }));

    return res.json({
      count: sanitized.length,
      users: sanitized,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ message: 'Failed to fetch users list.' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete('/users/:id', (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account.' });
    }

    const user = db.users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    db.users.deleteOne(u => u.id === req.params.id);
    // Cleanup user's properties or saved items if needed
    db.savedProperties.deleteMany(s => s.studentId === req.params.id);

    return res.json({ message: `User "${user.name}" (${user.email}) deleted successfully.` });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
});

/**
 * GET /api/admin/properties
 * List all properties with management metadata
 */
router.get('/properties', (req, res) => {
  try {
    const properties = db.properties.find();
    properties.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.json({
      count: properties.length,
      properties,
    });
  } catch (err) {
    console.error('Error fetching admin properties:', err);
    return res.status(500).json({ message: 'Failed to fetch properties.' });
  }
});

/**
 * DELETE /api/admin/properties/:id
 * Admin removal of inappropriate listings
 */
router.delete('/properties/:id', (req, res) => {
  try {
    const property = db.properties.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    db.properties.deleteOne(p => p.id === req.params.id);
    db.savedProperties.deleteMany(s => s.propertyId === req.params.id);

    return res.json({ message: `Property "${property.title}" removed successfully by Admin.` });
  } catch (err) {
    console.error('Error deleting property:', err);
    return res.status(500).json({ message: 'Failed to delete property.' });
  }
});

export default router;
