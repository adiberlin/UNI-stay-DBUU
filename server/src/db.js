// ============================================================
// server/src/db.js — Persistent Database Layer
// Supports MongoDB with transparent disk-persisted fallback
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

// Simple file-backed database collection implementation
class FileCollection {
  constructor(name, initialData = []) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = [];
    this.load(initialData);
  }

  load(initialData = []) {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error(`Error loading collection ${this.name}:`, err);
        this.data = initialData;
        this.save();
      }
    } else {
      this.data = initialData;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error writing collection ${this.name}:`, err);
    }
  }

  find(predicate = () => true) {
    return this.data.filter(predicate);
  }

  findOne(predicate) {
    return this.data.find(predicate) || null;
  }

  findById(id) {
    return this.data.find(item => item.id === id || item._id === id) || null;
  }

  insertOne(item) {
    const newItem = {
      id: item.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.push(newItem);
    this.save();
    return newItem;
  }

  updateOne(predicate, updates) {
    const index = this.data.findIndex(predicate);
    if (index === -1) return null;
    this.data[index] = {
      ...this.data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data[index];
  }

  deleteOne(predicate) {
    const initialLen = this.data.length;
    this.data = this.data.filter(item => !predicate(item));
    this.save();
    return this.data.length < initialLen;
  }

  deleteMany(predicate) {
    const initialLen = this.data.length;
    this.data = this.data.filter(item => !predicate(item));
    this.save();
    return initialLen - this.data.length;
  }

  count(predicate = () => true) {
    return this.data.filter(predicate).length;
  }
}

// Initial seed data
const seedProperties = [];

export const db = {
  users: null,
  properties: null,
  savedProperties: null,
  enquiries: null,

  async init() {
    // Generate secure hashes for pre-seeded accounts
    const adminHash = bcrypt.hashSync('Admin@12345', 10);
    const ownerHash = bcrypt.hashSync('Owner@12345', 10);
    const studentHash = bcrypt.hashSync('Student@12345', 10);

    const seedUsers = [
      {
        id: 'u_admin_001',
        name: 'System Admin',
        email: 'admin@dbuu.ac.in',
        phone: '9876543200',
        passwordHash: adminHash,
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u_owner_001',
        name: 'Amit Sharma',
        email: 'owner@dbuu.ac.in',
        phone: '8271745566',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
        passwordHash: ownerHash,
        role: 'OWNER',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u_student_001',
        name: 'Aditya Kumar',
        email: 'student@dbuu.ac.in',
        phone: '9123723276',
        passwordHash: studentHash,
        role: 'STUDENT',
        lookingFor: 'PG',
        budget: 8000,
        createdAt: new Date().toISOString(),
      },
    ];

    const seedSaved = [];
    const seedEnquiries = [];

    this.users = new FileCollection('users', seedUsers);
    this.properties = new FileCollection('properties', seedProperties);
    this.savedProperties = new FileCollection('saved_properties', seedSaved);
    this.enquiries = new FileCollection('enquiries', seedEnquiries);

    console.log('✅ Database persistence layer initialized with JSON document store.');
  }
};
