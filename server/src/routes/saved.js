// ============================================================
// server/src/routes/saved.js — Student Saved Properties API
// ============================================================

import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/saved
 * Get saved property IDs and populated property objects for logged-in student
 */
router.get('/', authenticateToken, requireRole('STUDENT', 'ADMIN'), (req, res) => {
  try {
    const studentId = req.user.id;
    const userSaved = db.savedProperties.find(s => s.studentId === studentId);
    const propertyIds = userSaved.map(s => s.propertyId);

    const properties = db.properties.find(p => propertyIds.includes(p.id));

    return res.json({
      savedIds: propertyIds,
      properties,
    });
  } catch (err) {
    console.error('Error fetching saved properties:', err);
    return res.status(500).json({ message: 'Failed to fetch saved properties.' });
  }
});

/**
 * POST /api/saved/:propertyId
 * Save a property for the student
 */
router.post('/:propertyId', authenticateToken, requireRole('STUDENT', 'ADMIN'), (req, res) => {
  try {
    const studentId = req.user.id;
    const { propertyId } = req.params;

    const property = db.properties.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const existing = db.savedProperties.findOne(
      s => s.studentId === studentId && s.propertyId === propertyId
    );

    if (!existing) {
      db.savedProperties.insertOne({
        studentId,
        propertyId,
      });
    }

    const userSaved = db.savedProperties.find(s => s.studentId === studentId);
    return res.json({
      message: 'Property saved successfully ❤️',
      savedIds: userSaved.map(s => s.propertyId),
    });
  } catch (err) {
    console.error('Error saving property:', err);
    return res.status(500).json({ message: 'Failed to save property.' });
  }
});

/**
 * DELETE /api/saved/:propertyId
 * Remove property from saved list
 */
router.delete('/:propertyId', authenticateToken, requireRole('STUDENT', 'ADMIN'), (req, res) => {
  try {
    const studentId = req.user.id;
    const { propertyId } = req.params;

    db.savedProperties.deleteOne(
      s => s.studentId === studentId && s.propertyId === propertyId
    );

    const userSaved = db.savedProperties.find(s => s.studentId === studentId);
    return res.json({
      message: 'Property removed from saved stays.',
      savedIds: userSaved.map(s => s.propertyId),
    });
  } catch (err) {
    console.error('Error removing saved property:', err);
    return res.status(500).json({ message: 'Failed to remove saved property.' });
  }
});

export default router;
