// ============================================================
// server/src/routes/enquiries.js — Enquiries API
// ============================================================

import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/enquiries
 * Student sends enquiry for a property
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { propertyId, message } = req.body;

    if (!propertyId || !message || !message.trim()) {
      return res.status(400).json({ message: 'Property ID and enquiry message are required.' });
    }

    const property = db.properties.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const enquiry = db.enquiries.insertOne({
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      studentPhone: req.user.phone,
      propertyId: property.id,
      propertyTitle: property.title,
      ownerId: property.ownerId,
      message: message.trim(),
      status: 'pending',
    });

    return res.status(201).json({
      message: 'Enquiry sent successfully! The owner will contact you.',
      enquiry,
    });
  } catch (err) {
    console.error('Error sending enquiry:', err);
    return res.status(500).json({ message: 'Failed to send enquiry.' });
  }
});

/**
 * GET /api/enquiries
 * Role-based enquiries listing
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    let list = [];

    if (req.user.role === 'ADMIN') {
      list = db.enquiries.find();
    } else if (req.user.role === 'OWNER') {
      list = db.enquiries.find(e => e.ownerId === req.user.id);
    } else {
      // STUDENT
      list = db.enquiries.find(e => e.studentId === req.user.id);
    }

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.json({
      count: list.length,
      enquiries: list,
    });
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    return res.status(500).json({ message: 'Failed to fetch enquiries.' });
  }
});

/**
 * PATCH /api/enquiries/:id/status
 * Update enquiry status
 */
router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const enquiry = db.enquiries.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    if (req.user.role !== 'ADMIN' && enquiry.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this enquiry.' });
    }

    const { status } = req.body;
    if (!['pending', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updated = db.enquiries.updateOne(e => e.id === req.params.id, { status });
    return res.json({
      message: 'Enquiry status updated.',
      enquiry: updated,
    });
  } catch (err) {
    console.error('Error updating enquiry status:', err);
    return res.status(500).json({ message: 'Failed to update enquiry status.' });
  }
});

export default router;
