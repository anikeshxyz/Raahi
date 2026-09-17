import mongoose from 'mongoose';
import { Employee } from '../../models/Employee.js';
import { Attendance } from '../../models/Attendance.js';
import { LeaveRequest } from '../../models/LeaveRequest.js';
import { logAuditTrail } from '../../middleware/audit.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  clockInOutSchema,
  leaveRequestSchema,
  leaveApprovalSchema,
} from './validation.js';
import {
  defaultEmployeesData,
  seedInitialEmployees,
} from '../../seeds/employeeSeed.js';

// In-memory fallback stores
let memEmployees = defaultEmployeesData.map((e) => ({ ...e }));
let memAttendance = [
  {
    _id: 'att-001',
    employeeId: '65f044444444444444440001',
    date: new Date().toISOString().split('T')[0],
    checkIn: new Date(new Date().setHours(8, 0, 0, 0)),
    checkOut: null,
    status: 'Present',
    workingHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'att-002',
    employeeId: '65f044444444444444440002',
    date: new Date().toISOString().split('T')[0],
    checkIn: new Date(new Date().setHours(7, 30, 0, 0)),
    checkOut: null,
    status: 'Present',
    workingHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let memLeaves = [
  {
    _id: 'leave-001',
    employeeId: '65f044444444444444440004',
    leaveType: 'Casual',
    startDate: new Date('2026-09-20'),
    endDate: new Date('2026-09-21'),
    totalDays: 2,
    reason: 'Family wedding event',
    status: 'Pending',
    approvedBy: null,
    adminNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const resetMemEmployeeStore = () => {
  memEmployees = defaultEmployeesData.map((e) => ({ ...e }));
  memAttendance = [
    {
      _id: 'att-001',
      employeeId: '65f044444444444444440001',
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date(new Date().setHours(8, 0, 0, 0)),
      checkOut: null,
      status: 'Present',
      workingHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'att-002',
      employeeId: '65f044444444444444440002',
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date(new Date().setHours(7, 30, 0, 0)),
      checkOut: null,
      status: 'Present',
      workingHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  memLeaves = [
    {
      _id: 'leave-001',
      employeeId: '65f044444444444444440004',
      leaveType: 'Casual',
      startDate: new Date('2026-09-20'),
      endDate: new Date('2026-09-21'),
      totalDays: 2,
      reason: 'Family wedding event',
      status: 'Pending',
      approvedBy: null,
      adminNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

export const getMemEmployees = () => memEmployees;
export const getMemAttendance = () => memAttendance;
export const getMemLeaves = () => memLeaves;

// ==========================================
// 1. STAFF DIRECTORY ENDPOINTS
// ==========================================

// GET /api/v1/employee/list
export const getEmployees = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { department, status, search } = req.query;

    let employees = [];

    if (isDbConnected) {
      await seedInitialEmployees();
      const query = {};
      if (department) query.department = department;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { employeeCode: { $regex: search, $options: 'i' } },
          { designation: { $regex: search, $options: 'i' } },
        ];
      }
      employees = await Employee.find(query).sort({ employeeCode: 1 }).lean();
    } else {
      employees = memEmployees.map((e) => ({ ...e }));
      if (department) employees = employees.filter((e) => e.department === department);
      if (status) employees = employees.filter((e) => e.status === status);
      if (search) {
        const q = search.toLowerCase();
        employees = employees.filter(
          (e) =>
            e.firstName.toLowerCase().includes(q) ||
            e.lastName.toLowerCase().includes(q) ||
            e.employeeCode.toLowerCase().includes(q) ||
            e.designation.toLowerCase().includes(q)
        );
      }
    }

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/employee/:id
export const getEmployeeById = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const employee = await Employee.findById(req.params.id).lean();
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const attendance = await Attendance.find({ employeeId: employee._id })
        .sort({ date: -1 })
        .limit(30)
        .lean();
      const leaves = await LeaveRequest.find({ employeeId: employee._id })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: {
          ...employee,
          recentAttendance: attendance,
          leaves,
        },
      });
    }

    // In-memory fallback
    const employee = memEmployees.find((e) => String(e._id) === req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const recentAttendance = memAttendance
      .filter((a) => String(a.employeeId) === req.params.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const leaves = memLeaves.filter((l) => String(l.employeeId) === req.params.id);

    res.json({
      success: true,
      data: {
        ...employee,
        recentAttendance,
        leaves,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/employee
export const createEmployee = async (req, res, next) => {
  try {
    const validated = createEmployeeSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    let employeeCode = validated.employeeCode;
    if (!employeeCode) {
      const count = isDbConnected ? await Employee.countDocuments() : memEmployees.length;
      employeeCode = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    const payload = {
      ...validated,
      employeeCode,
      dateOfJoining: validated.dateOfJoining ? new Date(validated.dateOfJoining) : new Date(),
    };

    if (isDbConnected) {
      const existing = await Employee.findOne({
        $or: [{ employeeCode: payload.employeeCode }, { email: payload.email }],
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this employeeCode or email already exists',
        });
      }

      const employee = await Employee.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
      });
    }

    // In-memory fallback
    const existing = memEmployees.find(
      (e) => e.employeeCode === payload.employeeCode || e.email === payload.email
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this employeeCode or email already exists',
      });
    }

    const newEmp = {
      _id: `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memEmployees.push(newEmp);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmp,
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

// PUT /api/v1/employee/:id (SENSITIVE ACTION: Writes to AuditLog on baseSalary change)
export const updateEmployee = async (req, res, next) => {
  try {
    const validated = updateEmployeeSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const prevSalary = employee.baseSalary;
      const salaryChanged = validated.baseSalary !== undefined && validated.baseSalary !== prevSalary;

      Object.assign(employee, validated);
      await employee.save();

      // Mandatory Audit Log per AGENTS.md on sensitive salary change
      if (salaryChanged) {
        await logAuditTrail({
          actorId: req.user?._id || null,
          actorRole: req.user?.role || 'HR',
          action: 'SALARY_CHANGE',
          entityName: 'Employee',
          entityId: String(employee._id),
          beforeState: { baseSalary: prevSalary },
          afterState: { baseSalary: employee.baseSalary },
          notes: `Base monthly salary updated from ₹${prevSalary} to ₹${employee.baseSalary} for ${employee.firstName} ${employee.lastName} (${employee.employeeCode})`,
        });
      }

      return res.json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
        salaryAuditLogged: salaryChanged,
      });
    }

    // In-memory fallback
    const index = memEmployees.findIndex((e) => String(e._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const employee = memEmployees[index];
    const prevSalary = employee.baseSalary;
    const salaryChanged = validated.baseSalary !== undefined && validated.baseSalary !== prevSalary;

    memEmployees[index] = {
      ...employee,
      ...validated,
      updatedAt: new Date(),
    };

    if (salaryChanged) {
      await logAuditTrail({
        actorId: req.user?._id || 'usr-admin-001',
        actorRole: req.user?.role || 'HR',
        action: 'SALARY_CHANGE',
        entityName: 'Employee',
        entityId: String(employee._id),
        beforeState: { baseSalary: prevSalary },
        afterState: { baseSalary: validated.baseSalary },
        notes: `Base monthly salary updated from ₹${prevSalary} to ₹${validated.baseSalary} for ${employee.firstName} ${employee.lastName} (${employee.employeeCode})`,
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: memEmployees[index],
      salaryAuditLogged: salaryChanged,
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

// DELETE /api/v1/employee/:id (Soft delete: set status to Inactive)
export const deleteEmployee = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        { status: 'Inactive' },
        { new: true }
      );
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      await logAuditTrail({
        actorId: req.user?._id || null,
        actorRole: req.user?.role || 'Manager',
        action: 'EMPLOYEE_DEACTIVATED',
        entityName: 'Employee',
        entityId: String(employee._id),
        beforeState: { status: 'Active' },
        afterState: { status: 'Inactive' },
        notes: `Employee ${employee.firstName} ${employee.lastName} deactivated`,
      });

      return res.json({
        success: true,
        message: 'Employee deactivated successfully',
        data: employee,
      });
    }

    // In-memory fallback
    const index = memEmployees.findIndex((e) => String(e._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    memEmployees[index].status = 'Inactive';
    memEmployees[index].updatedAt = new Date();

    await logAuditTrail({
      actorId: req.user?._id || 'usr-admin-001',
      actorRole: req.user?.role || 'Manager',
      action: 'EMPLOYEE_DEACTIVATED',
      entityName: 'Employee',
      entityId: String(memEmployees[index]._id),
      beforeState: { status: 'Active' },
      afterState: { status: 'Inactive' },
      notes: `Employee ${memEmployees[index].firstName} ${memEmployees[index].lastName} deactivated`,
    });

    res.json({
      success: true,
      message: 'Employee deactivated successfully',
      data: memEmployees[index],
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. ATTENDANCE & SHIFT ENDPOINTS
// ==========================================

// Helper to enrich attendance with employee details
const enrichAttendance = (att) => {
  const emp = memEmployees.find((e) => String(e._id) === String(att.employeeId?._id || att.employeeId));
  return {
    ...att,
    employeeId: emp
      ? {
          _id: emp._id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          department: emp.department,
          designation: emp.designation,
        }
      : att.employeeId,
  };
};

// GET /api/v1/employee/attendance
export const getAttendance = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { date, employeeId, month, year } = req.query;

    if (isDbConnected) {
      const query = {};
      if (date) query.date = date;
      if (employeeId) query.employeeId = employeeId;
      if (month && year) {
        const m = String(month).padStart(2, '0');
        query.date = { $regex: `^${year}-${m}` };
      }

      const records = await Attendance.find(query)
        .populate('employeeId', 'employeeCode firstName lastName department designation')
        .sort({ date: -1, createdAt: -1 })
        .lean();

      return res.json({ success: true, count: records.length, data: records });
    }

    // In-memory fallback
    let records = memAttendance.map((a) => ({ ...a }));
    if (date) records = records.filter((a) => a.date === date);
    if (employeeId) records = records.filter((a) => String(a.employeeId?._id || a.employeeId) === employeeId);
    if (month && year) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      records = records.filter((a) => a.date.startsWith(prefix));
    }

    const enriched = records.map(enrichAttendance);
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/employee/attendance/clock-in
export const clockIn = async (req, res, next) => {
  try {
    const validated = clockInOutSchema.parse(req.body);
    const date = validated.date || new Date().toISOString().split('T')[0];
    const checkInTime = validated.checkIn ? new Date(validated.checkIn) : new Date();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let record = await Attendance.findOne({ employeeId: validated.employeeId, date });
      if (record && record.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Employee has already clocked in for today',
          data: record,
        });
      }

      if (!record) {
        record = new Attendance({
          employeeId: validated.employeeId,
          date,
          checkIn: checkInTime,
          status: 'Present',
        });
      } else {
        record.checkIn = checkInTime;
        record.status = 'Present';
      }

      await record.save();
      const populated = await Attendance.findById(record._id).populate(
        'employeeId',
        'employeeCode firstName lastName department designation'
      );

      return res.status(200).json({
        success: true,
        message: 'Clocked in successfully',
        data: populated,
      });
    }

    // In-memory fallback
    let record = memAttendance.find(
      (a) => String(a.employeeId?._id || a.employeeId) === validated.employeeId && a.date === date
    );

    if (record && record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Employee has already clocked in for today',
        data: enrichAttendance(record),
      });
    }

    if (!record) {
      record = {
        _id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        employeeId: validated.employeeId,
        date,
        checkIn: checkInTime,
        checkOut: null,
        status: 'Present',
        workingHours: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memAttendance.push(record);
    } else {
      record.checkIn = checkInTime;
      record.status = 'Present';
      record.updatedAt = new Date();
    }

    res.status(200).json({
      success: true,
      message: 'Clocked in successfully',
      data: enrichAttendance(record),
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

// POST /api/v1/employee/attendance/clock-out
export const clockOut = async (req, res, next) => {
  try {
    const validated = clockInOutSchema.parse(req.body);
    const date = validated.date || new Date().toISOString().split('T')[0];
    const checkOutTime = validated.checkOut ? new Date(validated.checkOut) : new Date();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const record = await Attendance.findOne({ employeeId: validated.employeeId, date });
      if (!record || !record.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Cannot clock out without prior clock-in record for today',
        });
      }

      record.checkOut = checkOutTime;
      const diffMs = record.checkOut.getTime() - record.checkIn.getTime();
      const hours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
      record.workingHours = hours;

      if (hours >= 7) {
        record.status = 'Present';
      } else if (hours >= 4) {
        record.status = 'Half-Day';
      } else {
        record.status = 'Present';
      }

      await record.save();
      const populated = await Attendance.findById(record._id).populate(
        'employeeId',
        'employeeCode firstName lastName department designation'
      );

      return res.status(200).json({
        success: true,
        message: `Clocked out successfully. Total shift: ${hours} hours.`,
        data: populated,
      });
    }

    // In-memory fallback
    const record = memAttendance.find(
      (a) => String(a.employeeId?._id || a.employeeId) === validated.employeeId && a.date === date
    );

    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Cannot clock out without prior clock-in record for today',
      });
    }

    record.checkOut = checkOutTime;
    const diffMs = record.checkOut.getTime() - new Date(record.checkIn).getTime();
    const hours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
    record.workingHours = hours;

    if (hours >= 7) {
      record.status = 'Present';
    } else if (hours >= 4) {
      record.status = 'Half-Day';
    } else {
      record.status = 'Present';
    }
    record.updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: `Clocked out successfully. Total shift: ${hours} hours.`,
      data: enrichAttendance(record),
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

// ==========================================
// 3. LEAVE REQUESTS ENDPOINTS
// ==========================================

// Helper to enrich leaves
const enrichLeave = (leave) => {
  const emp = memEmployees.find((e) => String(e._id) === String(leave.employeeId?._id || leave.employeeId));
  return {
    ...leave,
    employeeId: emp
      ? {
          _id: emp._id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          department: emp.department,
          designation: emp.designation,
        }
      : leave.employeeId,
  };
};

// GET /api/v1/employee/leaves
export const getLeaves = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { status, employeeId } = req.query;

    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
      if (employeeId) query.employeeId = employeeId;

      const leaves = await LeaveRequest.find(query)
        .populate('employeeId', 'employeeCode firstName lastName department designation')
        .sort({ createdAt: -1 })
        .lean();

      return res.json({ success: true, count: leaves.length, data: leaves });
    }

    // In-memory fallback
    let leaves = memLeaves.map((l) => ({ ...l }));
    if (status) leaves = leaves.filter((l) => l.status === status);
    if (employeeId) leaves = leaves.filter((l) => String(l.employeeId?._id || l.employeeId) === employeeId);

    const enriched = leaves.map(enrichLeave);
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/employee/leaves
export const createLeaveRequest = async (req, res, next) => {
  try {
    const validated = leaveRequestSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    const payload = {
      ...validated,
      startDate: new Date(validated.startDate),
      endDate: new Date(validated.endDate),
      status: 'Pending',
    };

    if (isDbConnected) {
      const leave = await LeaveRequest.create(payload);
      const populated = await LeaveRequest.findById(leave._id).populate(
        'employeeId',
        'employeeCode firstName lastName department designation'
      );

      return res.status(201).json({
        success: true,
        message: 'Leave request submitted successfully',
        data: populated,
      });
    }

    // In-memory fallback
    const newLeave = {
      _id: `leave-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...payload,
      approvedBy: null,
      adminNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memLeaves.push(newLeave);

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: enrichLeave(newLeave),
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

// PUT /api/v1/employee/leaves/:id/status (Approve/Reject)
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = leaveApprovalSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const leave = await LeaveRequest.findById(req.params.id);
      if (!leave) {
        return res.status(404).json({ success: false, message: 'Leave request not found' });
      }

      leave.status = status;
      if (adminNotes) leave.adminNotes = adminNotes;
      leave.approvedBy = req.user?._id || null;
      await leave.save();

      // If approved, update employee status to 'On Leave' if current
      if (status === 'Approved') {
        const today = new Date();
        if (today >= leave.startDate && today <= leave.endDate) {
          await Employee.findByIdAndUpdate(leave.employeeId, { status: 'On Leave' });
        }
      }

      const populated = await LeaveRequest.findById(leave._id).populate(
        'employeeId',
        'employeeCode firstName lastName department designation'
      );

      return res.json({
        success: true,
        message: `Leave request has been ${status.toLowerCase()}`,
        data: populated,
      });
    }

    // In-memory fallback
    const index = memLeaves.findIndex((l) => String(l._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    memLeaves[index].status = status;
    if (adminNotes) memLeaves[index].adminNotes = adminNotes;
    memLeaves[index].updatedAt = new Date();

    if (status === 'Approved') {
      const today = new Date();
      const s = new Date(memLeaves[index].startDate);
      const e = new Date(memLeaves[index].endDate);
      if (today >= s && today <= e) {
        const empIdx = memEmployees.findIndex(
          (emp) => String(emp._id) === String(memLeaves[index].employeeId)
        );
        if (empIdx !== -1) memEmployees[empIdx].status = 'On Leave';
      }
    }

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: enrichLeave(memLeaves[index]),
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

// GET /api/v1/employee/summary
export const getEmployeeSummary = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const today = new Date().toISOString().split('T')[0];

    let totalStaff = 0;
    let activeStaff = 0;
    let presentToday = 0;
    let onLeaveToday = 0;
    let monthlySalaryTotal = 0;

    if (isDbConnected) {
      await seedInitialEmployees();
      totalStaff = await Employee.countDocuments();
      activeStaff = await Employee.countDocuments({ status: 'Active' });
      onLeaveToday = await Employee.countDocuments({ status: 'On Leave' });
      presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['Present', 'Half-Day'] } });

      const salAgg = await Employee.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: null, total: { $sum: '$baseSalary' } } },
      ]);
      monthlySalaryTotal = salAgg[0]?.total || 0;
    } else {
      totalStaff = memEmployees.length;
      activeStaff = memEmployees.filter((e) => e.status === 'Active').length;
      onLeaveToday = memEmployees.filter((e) => e.status === 'On Leave').length;
      presentToday = memAttendance.filter(
        (a) => a.date === today && ['Present', 'Half-Day'].includes(a.status)
      ).length;
      monthlySalaryTotal = memEmployees
        .filter((e) => e.status === 'Active')
        .reduce((sum, e) => sum + (e.baseSalary || 0), 0);
    }

    res.json({
      success: true,
      data: {
        totalStaff,
        activeStaff,
        presentToday,
        onLeaveToday,
        monthlySalaryTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};
