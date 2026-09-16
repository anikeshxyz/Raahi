import mongoose from 'mongoose';
import { Supplier } from '../models/Supplier.js';

export const defaultSuppliersData = [
  {
    _id: 'sup-chikmagalur-001',
    name: 'Chikmagalur Estate Coffee Co.',
    contactPerson: 'Rohan Gowda',
    phone: '+919845012345',
    email: 'orders@chikmagalurcoffee.in',
    address: 'Estate Road 4, Baba Budangiri, Chikmagalur, Karnataka 577101',
    gstin: '29AAACG1234F1ZV',
    isActive: true,
  },
  {
    _id: 'sup-nilgiri-002',
    name: 'Nilgiri Organic Dairies',
    contactPerson: 'Priya Menon',
    phone: '+919443067890',
    email: 'supply@nilgiridairies.com',
    address: 'Coonoor Road, Nilgiris District, Ooty, Tamil Nadu 643001',
    gstin: '33AABCN5678G1ZP',
    isActive: true,
  },
  {
    _id: 'sup-artisan-003',
    name: 'Artisan Grain & Flour Mills',
    contactPerson: 'Vikram Patel',
    phone: '+919820054321',
    email: 'sales@artisangrains.in',
    address: 'Peenya Industrial Area Phase 2, Bengaluru, Karnataka 560058',
    gstin: '29AABCA9012H1ZQ',
    isActive: true,
  },
  {
    _id: 'sup-ecopack-004',
    name: 'EcoPack Sustainable Solutions',
    contactPerson: 'Ananya Sharma',
    phone: '+919910087654',
    email: 'hello@ecopack.co.in',
    address: 'ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066',
    gstin: '29AABCE3456J1ZR',
    isActive: true,
  },
];

export const seedInitialSuppliers = async () => {
  if (mongoose.connection.readyState !== 1) return;

  try {
    const count = await Supplier.countDocuments();
    if (count === 0) {
      const docs = defaultSuppliersData.map(({ _id, ...rest }) => rest);
      await Supplier.insertMany(docs);
      console.log('✅ Default café suppliers seeded successfully.');
    }
  } catch (error) {
    console.error('⚠️ Failed to seed default suppliers:', error.message);
  }
};
