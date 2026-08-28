// ============================================================
// server/src/routes/auth.js — Authentication Routes
// ============================================================

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Validation helpers
function validateName(name) {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  // Characters and spaces only
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return 'Name can only contain letters and spaces.';
  }
  return null;
}

function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return 'Phone number is required.';
  const cleaned = phone.replace(/[\s-]/g, '');
  // Indian mobile number: 10 digits starting with 6, 7, 8, 9
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
  }
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return null;
}

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role, lookingFor, budget } = req.body;

    const nameErr = validateName(name);
    if (nameErr) return res.status(400).json({ message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ message: emailErr });

    const phoneErr = validatePhone(phone);
    if (phoneErr) return res.status(400).json({ message: phoneErr });

    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ message: passErr });

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = db.users.findOne(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Role verification (Admin can only be created internally)
    let assignedRole = 'STUDENT';
    if (role === 'OWNER') assignedRole = 'OWNER';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = db.users.insertOne({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim().replace(/[\s-]/g, ''),
      passwordHash,
      role: assignedRole,
      lookingFor: lookingFor || '',
      budget: Number(budget) || 0,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=4f46e5&color=fff`,
        role: newUser.role,
        lookingFor: newUser.lookingFor,
        budget: newUser.budget,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.users.findOne(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`,
        role: user.role,
        lookingFor: user.lookingFor,
        budget: user.budget,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, (req, res) => {
  const user = db.users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`,
      role: user.role,
      lookingFor: user.lookingFor,
      budget: user.budget,
      createdAt: user.createdAt,
    },
  });
});

/**
 * PUT /api/auth/profile
 * Update user profile (avatar / profile picture, name, phone, lookingFor, budget)
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, avatar, lookingFor, budget } = req.body;
    const user = db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (phone && phone.trim()) updates.phone = phone.trim().replace(/[\s-]/g, '');
    if (avatar !== undefined) updates.avatar = avatar;
    if (lookingFor !== undefined) updates.lookingFor = lookingFor;
    if (budget !== undefined && !isNaN(Number(budget))) updates.budget = Number(budget);

    const updatedUser = db.users.updateOne(u => u.id === req.user.id, updates);

    // If owner updates avatar or phone, sync across all their properties
    if (user.role === 'OWNER') {
      const ownerProperties = db.properties.find(p => p.ownerId === req.user.id);
      ownerProperties.forEach(prop => {
        db.properties.updateOne(p => p.id === prop.id, {
          owner: {
            ...prop.owner,
            name: updatedUser.name || prop.owner?.name,
            phone: updatedUser.phone || prop.owner?.phone,
            avatar: updatedUser.avatar || prop.owner?.avatar,
          },
        });
      });
    }

    return res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        lookingFor: updatedUser.lookingFor,
        budget: updatedUser.budget,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
