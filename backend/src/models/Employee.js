import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['Kitchen', 'Service/Floor', 'Management', 'Inventory', 'Accounts'],
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });

export const Employee = mongoose.model('Employee', employeeSchema);
