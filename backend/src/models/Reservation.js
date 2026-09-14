import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
      match: [/^[0-9+\s-]{8,15}$/, 'Please enter a valid phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Reservation date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'],
    },
    time: {
      type: String, // e.g. "19:30" or "7:30 PM"
      required: [true, 'Reservation time is required'],
      trim: true,
    },
    guestCount: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Guest count must be at least 1'],
      max: [50, 'For parties larger than 50, please contact us for private booking'],
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
    },
  },
  { timestamps: true }
);

reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ phone: 1 });

export const Reservation = mongoose.model('Reservation', reservationSchema);
