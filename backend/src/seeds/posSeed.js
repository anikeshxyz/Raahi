import { Table } from '../models/Table.js';
import { User } from '../models/User.js';

export const defaultTablesData = [
  { tableNumber: 'T1', capacity: 2, status: 'vacant' },
  { tableNumber: 'T2', capacity: 2, status: 'vacant' },
  { tableNumber: 'T3', capacity: 2, status: 'vacant' },
  { tableNumber: 'T4', capacity: 2, status: 'vacant' },
  { tableNumber: 'T5', capacity: 4, status: 'vacant' },
  { tableNumber: 'T6', capacity: 4, status: 'vacant' },
  { tableNumber: 'T7', capacity: 4, status: 'vacant' },
  { tableNumber: 'T8', capacity: 4, status: 'vacant' },
  { tableNumber: 'T9', capacity: 6, status: 'vacant' },
  { tableNumber: 'T10', capacity: 6, status: 'vacant' },
  { tableNumber: 'T11', capacity: 8, status: 'vacant' },
  { tableNumber: 'T12', capacity: 8, status: 'vacant' },
];

export const defaultStaffUser = {
  name: 'Ananya (Cashier)',
  email: 'cashier@raahicafe.com',
  passwordHash: 'scrypt$hash$placeholder_for_pos_cashier',
  role: 'Cashier',
  phone: '+919876543210',
  isActive: true,
};

export const seedInitialTables = async () => {
  const count = await Table.countDocuments();
  if (count > 0) {
    return;
  }
  console.log('[Seed] Seeding default café tables (T1-T12)...');
  await Table.insertMany(defaultTablesData);
  console.log('[Seed] Default tables seeded successfully.');
};

export const ensureDefaultStaffUser = async () => {
  let user = await User.findOne({ email: defaultStaffUser.email });
  if (!user) {
    user = await User.create(defaultStaffUser);
  }
  return user;
};
