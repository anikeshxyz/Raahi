import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeCode: z.string().optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Valid contact phone number is required'),
  department: z.enum(['Kitchen', 'Service/Floor', 'Management', 'Inventory', 'Accounts']),
  designation: z.string().min(2, 'Designation is required'),
  baseSalary: z.number().min(0, 'Base salary cannot be negative'),
  dateOfJoining: z.string().or(z.date()).optional(),
  status: z.enum(['Active', 'Inactive', 'On Leave']).optional().default('Active'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const clockInOutSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')
    .optional(),
  checkIn: z.string().or(z.date()).optional(),
  checkOut: z.string().or(z.date()).optional(),
  status: z.enum(['Present', 'Absent', 'Half-Day', 'Leave']).optional(),
  workingHours: z.number().min(0).optional(),
});

export const leaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveType: z.enum(['Casual', 'Sick', 'Earned']),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  totalDays: z.number().min(0.5, 'Total days must be at least 0.5'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

export const leaveApprovalSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  adminNotes: z.string().optional(),
});
