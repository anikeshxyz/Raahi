import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['vacant', 'occupied', 'reserved'],
      default: 'vacant',
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

tableSchema.index({ status: 1 });

export const Table = mongoose.model('Table', tableSchema);
