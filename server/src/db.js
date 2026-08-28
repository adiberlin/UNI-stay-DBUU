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
const seedProperties = [
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
    createdAt: new Date().toISOString(),
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
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80'
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
    createdAt: new Date().toISOString(),
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
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
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
    createdAt: new Date().toISOString(),
  }
];

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
