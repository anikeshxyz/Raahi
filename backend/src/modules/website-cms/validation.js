import { z } from 'zod';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const reservationSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters long' }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,15}$/, { message: 'Please enter a valid phone number (8-15 digits)' }),
  email: z.string().trim().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
    .refine((date) => date >= getTodayDateString(), {
      message: 'Reservation date cannot be in the past',
    }),
  time: z.string().trim().min(1, { message: 'Time slot is required' }),
  guestCount: z.coerce
    .number()
    .int()
    .min(1, { message: 'Guest count must be at least 1' })
    .max(50, { message: 'Guest count cannot exceed 50 for table reservation' }),
  specialRequests: z
    .string()
    .max(500, { message: 'Special requests cannot exceed 500 characters' })
    .optional()
    .default(''),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().trim().email({ message: 'Valid email is required' }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,15}$/, { message: 'Please enter a valid phone number' }),
  inquiryType: z.enum(['General', 'Event', 'Party', 'Corporate', 'Feedback']).default('General'),
  message: z.string().trim().min(10, { message: 'Message must be at least 10 characters long' }),
});
