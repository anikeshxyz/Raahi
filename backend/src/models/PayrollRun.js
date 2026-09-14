import mongoose from 'mongoose';

const employeeSalaryPayoutSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    additions: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const payrollRunSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
    payouts: [employeeSalaryPayoutSchema],
    totalDisbursement: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Paid'],
      default: 'Draft',
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

payrollRunSchema.index({ month: 1, year: 1 }, { unique: true });
payrollRunSchema.index({ status: 1 });

export const PayrollRun = mongoose.model('PayrollRun', payrollRunSchema);
