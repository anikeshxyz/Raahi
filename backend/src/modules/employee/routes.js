import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAttendance,
  clockIn,
  clockOut,
  getLeaves,
  createLeaveRequest,
  updateLeaveStatus,
  getEmployeeSummary,
} from './controller.js';

const router = Router();

// Module info & status
router.get('/', (req, res) => {
  res.json({
    module: 'employee',
    status: 'ready',
    endpoints: [
      '/summary',
      '/list',
      '/list/:id',
      '/attendance',
      '/attendance/clock-in',
      '/attendance/clock-out',
      '/leaves',
      '/leaves/:id/status',
    ],
  });
});

// Summary KPI metrics
router.get('/summary', getEmployeeSummary);

// Staff Directory
router.get('/list', getEmployees);
router.get('/list/:id', getEmployeeById);
router.post('/list', createEmployee);
router.put('/list/:id', updateEmployee);
router.delete('/list/:id', deleteEmployee);

// Attendance & Shifts
router.get('/attendance', getAttendance);
router.post('/attendance/clock-in', clockIn);
router.post('/attendance/clock-out', clockOut);

// Leaves
router.get('/leaves', getLeaves);
router.post('/leaves', createLeaveRequest);
router.put('/leaves/:id/status', updateLeaveStatus);

export default router;
