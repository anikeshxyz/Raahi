import { z } from 'zod';

export const ticketStatusSchema = z.object({
  kotStatus: z.enum(['sent', 'preparing', 'ready', 'completed'], {
    errorMap: () => ({ message: 'Status must be sent, preparing, ready, or completed' }),
  }),
});

export const itemStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'served', 'cancelled'], {
    errorMap: () => ({ message: 'Item status must be pending, preparing, ready, served, or cancelled' }),
  }),
});
