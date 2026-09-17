import mongoose from 'mongoose';
import { PayrollRun } from '../../models/PayrollRun.js';
import { Employee } from '../../models/Employee.js';
import { Attendance } from '../../models/Attendance.js';
import { logAuditTrail } from '../../middleware/audit.js';
import {
  generatePayrollSchema,
  updatePayrollStatusSchema,
  updatePayoutAdjustmentSchema,
} from './validation.js';
import {
  getMemEmployees,
  getMemAttendance,
} from '../employee/controller.js';
import { seedInitialEmployees } from '../../seeds/employeeSeed.js';

// In-memory fallback stores
let memPayrollRuns = [
  {
    _id: 'pay-2026-08',
    month: 8,
    year: 2026,
    payouts: [
      {
        employeeId: '65f044444444444444440001',
        baseSalary: 38000,
        additions: 2000,
        deductions: 0,
        netSalary: 40000,
        isPaid: true,
        paymentDate: new Date('2026-09-01T10:00:00Z'),
        remarks: 'Coffee master bonus included',
      },
      {
        employeeId: '65f044444444444444440002',
        baseSalary: 45000,
        additions: 0,
        deductions: 0,
        netSalary: 45000,
        isPaid: true,
        paymentDate: new Date('2026-09-01T10:00:00Z'),
        remarks: 'Standard monthly salary',
      },
      {
        employeeId: '65f044444444444444440003',
        baseSalary: 32000,
        additions: 1500,
        deductions: 500,
        netSalary: 33000,
        isPaid: true,
        paymentDate: new Date('2026-09-01T10:00:00Z'),
        remarks: 'Overtime bonus less uniform fee',
      },
    ],
    totalDisbursement: 118000,
    status: 'Paid',
    processedBy: 'usr-admin-001',
    createdAt: new Date('2026-08-31T18:00:00Z'),
    updatedAt: new Date('2026-09-01T10:00:00Z'),
  },
];

export const resetMemPayrollStore = () => {
  memPayrollRuns = [
    {
      _id: 'pay-2026-08',
      month: 8,
      year: 2026,
      payouts: [
        {
          employeeId: '65f044444444444444440001',
          baseSalary: 38000,
          additions: 2000,
          deductions: 0,
          netSalary: 40000,
          isPaid: true,
          paymentDate: new Date('2026-09-01T10:00:00Z'),
          remarks: 'Coffee master bonus included',
        },
        {
          employeeId: '65f044444444444444440002',
          baseSalary: 45000,
          additions: 0,
          deductions: 0,
          netSalary: 45000,
          isPaid: true,
          paymentDate: new Date('2026-09-01T10:00:00Z'),
          remarks: 'Standard monthly salary',
        },
        {
          employeeId: '65f044444444444444440003',
          baseSalary: 32000,
          additions: 1500,
          deductions: 500,
          netSalary: 33000,
          isPaid: true,
          paymentDate: new Date('2026-09-01T10:00:00Z'),
          remarks: 'Overtime bonus less uniform fee',
        },
      ],
      totalDisbursement: 118000,
      status: 'Paid',
      processedBy: 'usr-admin-001',
      createdAt: new Date('2026-08-31T18:00:00Z'),
      updatedAt: new Date('2026-09-01T10:00:00Z'),
    },
  ];
};

export const getMemPayrollRuns = () => memPayrollRuns;

// Helper to enrich payroll run payouts with employee details
const enrichPayrollRun = (run) => {
  const employees = getMemEmployees();
  const enrichedPayouts = run.payouts.map((p) => {
    const emp = employees.find((e) => String(e._id) === String(p.employeeId?._id || p.employeeId));
    return {
      ...p,
      employeeId: emp
        ? {
            _id: emp._id,
            employeeCode: emp.employeeCode,
            firstName: emp.firstName,
            lastName: emp.lastName,
            department: emp.department,
            designation: emp.designation,
          }
        : p.employeeId,
    };
  });

  return {
    ...run,
    payouts: enrichedPayouts,
  };
};

// GET /api/v1/payroll/runs
export const getPayrollRuns = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { status, year } = req.query;

    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
      if (year) query.year = parseInt(year, 10);

      const runs = await PayrollRun.find(query)
        .populate('payouts.employeeId', 'employeeCode firstName lastName department designation')
        .sort({ year: -1, month: -1 })
        .lean();

      return res.json({ success: true, count: runs.length, data: runs });
    }

    // In-memory fallback
    let runs = memPayrollRuns.map((r) => ({ ...r }));
    if (status) runs = runs.filter((r) => r.status === status);
    if (year) runs = runs.filter((r) => r.year === parseInt(year, 10));

    const enriched = runs.map(enrichPayrollRun);
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/payroll/runs/:id
export const getPayrollRunById = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const run = await PayrollRun.findById(req.params.id)
        .populate('payouts.employeeId', 'employeeCode firstName lastName department designation email phone')
        .lean();

      if (!run) {
        return res.status(404).json({ success: false, message: 'Payroll run not found' });
      }

      return res.json({ success: true, data: run });
    }

    // In-memory fallback
    const run = memPayrollRuns.find((r) => String(r._id) === req.params.id);
    if (!run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found' });
    }

    res.json({ success: true, data: enrichPayrollRun(run) });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/payroll/generate (Calculate monthly payroll from active staff & attendance)
export const generatePayroll = async (req, res, next) => {
  try {
    const { month, year } = generatePayrollSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    // Check if payroll run already exists for this period
    if (isDbConnected) {
      await seedInitialEmployees();
      const existing = await PayrollRun.findOne({ month, year });
      if (existing && existing.status !== 'Draft') {
        return res.status(400).json({
          success: false,
          message: `Payroll for ${month}/${year} has already been ${existing.status.toLowerCase()} and cannot be regenerated`,
        });
      }

      const activeEmployees = await Employee.find({ status: 'Active' }).lean();
      const payouts = [];
      let totalDisbursement = 0;

      const workingDaysInMonth = 30; // Standard commercial payroll base
      const mStr = String(month).padStart(2, '0');
      const dateRegex = new RegExp(`^${year}-${mStr}`);

      for (const emp of activeEmployees) {
        // Find attendance records for the month
        const attendanceRecords = await Attendance.find({
          employeeId: emp._id,
          date: { $regex: dateRegex },
        }).lean();

        let absentDays = 0;
        if (attendanceRecords.length > 0) {
          absentDays = attendanceRecords.filter((a) => a.status === 'Absent').length;
          const halfDays = attendanceRecords.filter((a) => a.status === 'Half-Day').length;
          absentDays += halfDays * 0.5;
        }

        const additions = 0;
        const deductions = Math.round((absentDays / workingDaysInMonth) * emp.baseSalary);
        const netSalary = Math.max(0, emp.baseSalary + additions - deductions);

        payouts.push({
          employeeId: emp._id,
          baseSalary: emp.baseSalary,
          additions,
          deductions,
          netSalary,
          isPaid: false,
          paymentDate: null,
          remarks: absentDays > 0 ? `LOP deduction for ${absentDays} day(s) absence` : 'Standard full attendance computed',
        });

        totalDisbursement += netSalary;
      }

      let run;
      if (existing && existing.status === 'Draft') {
        existing.payouts = payouts;
        existing.totalDisbursement = totalDisbursement;
        await existing.save();
        run = existing;
      } else {
        run = await PayrollRun.create({
          month,
          year,
          payouts,
          totalDisbursement,
          status: 'Draft',
          processedBy: req.user?._id || new mongoose.Types.ObjectId(),
        });
      }

      const populated = await PayrollRun.findById(run._id).populate(
        'payouts.employeeId',
        'employeeCode firstName lastName department designation'
      );

      return res.status(201).json({
        success: true,
        message: `Payroll run for ${month}/${year} generated successfully`,
        data: populated,
      });
    }

    // In-memory fallback
    const existing = memPayrollRuns.find((r) => r.month === month && r.year === year);
    if (existing && existing.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Payroll for ${month}/${year} has already been ${existing.status.toLowerCase()} and cannot be regenerated`,
      });
    }

    const activeEmployees = getMemEmployees().filter((e) => e.status === 'Active');
    const attendanceStore = getMemAttendance();
    const payouts = [];
    let totalDisbursement = 0;

    const workingDaysInMonth = 30;
    const mStr = String(month).padStart(2, '0');
    const prefix = `${year}-${mStr}`;

    for (const emp of activeEmployees) {
      const attendanceRecords = attendanceStore.filter(
        (a) => String(a.employeeId?._id || a.employeeId) === String(emp._id) && a.date.startsWith(prefix)
      );

      let absentDays = 0;
      if (attendanceRecords.length > 0) {
        absentDays = attendanceRecords.filter((a) => a.status === 'Absent').length;
        const halfDays = attendanceRecords.filter((a) => a.status === 'Half-Day').length;
        absentDays += halfDays * 0.5;
      }

      const additions = 0;
      const deductions = Math.round((absentDays / workingDaysInMonth) * emp.baseSalary);
      const netSalary = Math.max(0, emp.baseSalary + additions - deductions);

      payouts.push({
        employeeId: emp._id,
        baseSalary: emp.baseSalary,
        additions,
        deductions,
        netSalary,
        isPaid: false,
        paymentDate: null,
        remarks: absentDays > 0 ? `LOP deduction for ${absentDays} day(s) absence` : 'Standard full attendance computed',
      });

      totalDisbursement += netSalary;
    }

    let run = {
      _id: `pay-${year}-${mStr}`,
      month,
      year,
      payouts,
      totalDisbursement,
      status: 'Draft',
      processedBy: req.user?._id || 'usr-admin-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (existing && existing.status === 'Draft') {
      const idx = memPayrollRuns.findIndex((r) => r._id === existing._id);
      memPayrollRuns[idx] = run;
    } else {
      memPayrollRuns.push(run);
    }

    res.status(201).json({
      success: true,
      message: `Payroll run for ${month}/${year} generated successfully`,
      data: enrichPayrollRun(run),
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: error.errors.map((e) => e.message),
      });
    }
    next(error);
  }
};

// PUT /api/v1/payroll/runs/:id/payouts/:employeeId (Adjust bonus/deduction on draft payroll)
export const updatePayoutAdjustment = async (req, res, next) => {
  try {
    const validated = updatePayoutAdjustmentSchema.parse(req.body);
    const { id, employeeId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const run = await PayrollRun.findById(id);
      if (!run) return res.status(404).json({ success: false, message: 'Payroll run not found' });
      if (run.status !== 'Draft') {
        return res.status(400).json({ success: false, message: 'Can only adjust payouts on Draft payroll runs' });
      }

      const payout = run.payouts.find((p) => String(p.employeeId) === employeeId);
      if (!payout) return res.status(404).json({ success: false, message: 'Employee payout record not found' });

      if (validated.additions !== undefined) payout.additions = validated.additions;
      if (validated.deductions !== undefined) payout.deductions = validated.deductions;
      if (validated.remarks !== undefined) payout.remarks = validated.remarks;

      payout.netSalary = Math.max(0, payout.baseSalary + payout.additions - payout.deductions);
      run.totalDisbursement = run.payouts.reduce((sum, p) => sum + p.netSalary, 0);
      await run.save();

      const populated = await PayrollRun.findById(run._id).populate(
        'payouts.employeeId',
        'employeeCode firstName lastName department designation'
      );
      return res.json({ success: true, message: 'Payout adjustment saved', data: populated });
    }

    // In-memory fallback
    const run = memPayrollRuns.find((r) => String(r._id) === id);
    if (!run) return res.status(404).json({ success: false, message: 'Payroll run not found' });
    if (run.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Can only adjust payouts on Draft payroll runs' });
    }

    const payout = run.payouts.find((p) => String(p.employeeId?._id || p.employeeId) === employeeId);
    if (!payout) return res.status(404).json({ success: false, message: 'Employee payout record not found' });

    if (validated.additions !== undefined) payout.additions = validated.additions;
    if (validated.deductions !== undefined) payout.deductions = validated.deductions;
    if (validated.remarks !== undefined) payout.remarks = validated.remarks;

    payout.netSalary = Math.max(0, payout.baseSalary + payout.additions - payout.deductions);
    run.totalDisbursement = run.payouts.reduce((sum, p) => sum + p.netSalary, 0);
    run.updatedAt = new Date();

    res.json({ success: true, message: 'Payout adjustment saved', data: enrichPayrollRun(run) });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: error.errors.map((e) => e.message),
      });
    }
    next(error);
  }
};

// PUT /api/v1/payroll/runs/:id/status (Approve & Disburse Payroll — Money-Touching Non-Negotiable)
export const updatePayrollStatus = async (req, res, next) => {
  try {
    const { status } = updatePayrollStatusSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const run = await PayrollRun.findById(req.params.id);
      if (!run) return res.status(404).json({ success: false, message: 'Payroll run not found' });

      if (run.status === 'Paid') {
        return res.status(400).json({ success: false, message: 'Payroll has already been disbursed' });
      }

      const prevStatus = run.status;
      run.status = status;

      if (status === 'Paid') {
        const now = new Date();
        run.payouts.forEach((p) => {
          p.isPaid = true;
          p.paymentDate = now;
        });

        // Mandatory Audit Log for sensitive financial disbursement
        await logAuditTrail({
          actorId: req.user?._id || null,
          actorRole: req.user?.role || 'Accountant',
          action: 'PAYROLL_DISBURSED',
          entityName: 'PayrollRun',
          entityId: String(run._id),
          beforeState: { status: prevStatus },
          afterState: { status: 'Paid', totalDisbursement: run.totalDisbursement },
          notes: `Payroll for ${run.month}/${run.year} disbursed to ${run.payouts.length} staff. Total ₹${run.totalDisbursement}`,
        });
      } else if (status === 'Approved') {
        await logAuditTrail({
          actorId: req.user?._id || null,
          actorRole: req.user?.role || 'Manager',
          action: 'PAYROLL_APPROVED',
          entityName: 'PayrollRun',
          entityId: String(run._id),
          beforeState: { status: prevStatus },
          afterState: { status: 'Approved' },
          notes: `Payroll for ${run.month}/${run.year} approved. Net payout ₹${run.totalDisbursement}`,
        });
      }

      await run.save();
      const populated = await PayrollRun.findById(run._id).populate(
        'payouts.employeeId',
        'employeeCode firstName lastName department designation'
      );

      return res.json({
        success: true,
        message: `Payroll status updated to ${status}`,
        data: populated,
      });
    }

    // In-memory fallback
    const index = memPayrollRuns.findIndex((r) => String(r._id) === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Payroll run not found' });

    const run = memPayrollRuns[index];
    if (run.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Payroll has already been disbursed' });
    }

    const prevStatus = run.status;
    run.status = status;
    run.updatedAt = new Date();

    if (status === 'Paid') {
      const now = new Date();
      run.payouts.forEach((p) => {
        p.isPaid = true;
        p.paymentDate = now;
      });

      await logAuditTrail({
        actorId: req.user?._id || 'usr-admin-001',
        actorRole: req.user?.role || 'Accountant',
        action: 'PAYROLL_DISBURSED',
        entityName: 'PayrollRun',
        entityId: String(run._id),
        beforeState: { status: prevStatus },
        afterState: { status: 'Paid', totalDisbursement: run.totalDisbursement },
        notes: `Payroll for ${run.month}/${run.year} disbursed to ${run.payouts.length} staff. Total ₹${run.totalDisbursement}`,
      });
    } else if (status === 'Approved') {
      await logAuditTrail({
        actorId: req.user?._id || 'usr-admin-001',
        actorRole: req.user?.role || 'Manager',
        action: 'PAYROLL_APPROVED',
        entityName: 'PayrollRun',
        entityId: String(run._id),
        beforeState: { status: prevStatus },
        afterState: { status: 'Approved' },
        notes: `Payroll for ${run.month}/${run.year} approved. Net payout ₹${run.totalDisbursement}`,
      });
    }

    res.json({
      success: true,
      message: `Payroll status updated to ${status}`,
      data: enrichPayrollRun(run),
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: error.errors.map((e) => e.message),
      });
    }
    next(error);
  }
};
