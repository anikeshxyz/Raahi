import mongoose from 'mongoose';
import { Employee } from '../models/Employee.js';
import { Attendance } from '../models/Attendance.js';
import { LeaveRequest } from '../models/LeaveRequest.js';

export const defaultEmployeesData = [
  {
    _id: '65f044444444444444440001',
    employeeCode: 'EMP-001',
    firstName: 'Rajiv',
    lastName: 'Menon',
    email: 'rajiv.menon@raahicafe.com',
    phone: '+919845011111',
    department: 'Kitchen',
    designation: 'Head Barista & Coffee Lead',
    baseSalary: 38000,
    dateOfJoining: new Date('2024-01-15'),
    status: 'Active',
  },
  {
    _id: '65f044444444444444440002',
    employeeCode: 'EMP-002',
    firstName: 'Sunita',
    lastName: 'Rao',
    email: 'sunita.rao@raahicafe.com',
    phone: '+919845022222',
    department: 'Kitchen',
    designation: 'Executive Café Chef',
    baseSalary: 45000,
    dateOfJoining: new Date('2023-11-01'),
    status: 'Active',
  },
  {
    _id: '65f044444444444444440003',
    employeeCode: 'EMP-003',
    firstName: 'Arjun',
    lastName: 'Das',
    email: 'arjun.das@raahicafe.com',
    phone: '+919845033333',
    department: 'Management',
    designation: 'Floor Manager & Cashier',
    baseSalary: 32000,
    dateOfJoining: new Date('2024-03-01'),
    status: 'Active',
  },
  {
    _id: '65f044444444444444440004',
    employeeCode: 'EMP-004',
    firstName: 'Meera',
    lastName: 'Pillai',
    email: 'meera.pillai@raahicafe.com',
    phone: '+919845044444',
    department: 'Kitchen',
    designation: 'Senior Barista',
    baseSalary: 28000,
    dateOfJoining: new Date('2024-06-10'),
    status: 'Active',
  },
  {
    _id: '65f044444444444444440005',
    employeeCode: 'EMP-005',
    firstName: 'Karthik',
    lastName: 'Nair',
    email: 'karthik.nair@raahicafe.com',
    phone: '+919845055555',
    department: 'Service/Floor',
    designation: 'Service Captain',
    baseSalary: 24000,
    dateOfJoining: new Date('2024-08-01'),
    status: 'Active',
  },
  {
    _id: '65f044444444444444440006',
    employeeCode: 'EMP-006',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@raahicafe.com',
    phone: '+919845066666',
    department: 'Inventory',
    designation: 'Store & Kitchen Steward',
    baseSalary: 20000,
    dateOfJoining: new Date('2024-02-15'),
    status: 'Active',
  },
];

export const seedInitialEmployees = async () => {
  if (mongoose.connection.readyState !== 1) return;

  try {
    const count = await Employee.countDocuments();
    if (count === 0) {
      const docs = defaultEmployeesData.map(({ _id, ...rest }) => ({
        _id: new mongoose.Types.ObjectId(_id),
        ...rest,
      }));
      await Employee.insertMany(docs);
      console.log('✅ Default café employees seeded successfully.');
    }
  } catch (error) {
    console.error('⚠️ Failed to seed default employees:', error.message);
  }
};
