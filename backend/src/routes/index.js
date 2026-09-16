import { Router } from 'express';
import healthRoutes from './health.js';
import posRoutes from '../modules/pos/routes.js';
import inventoryRoutes from '../modules/inventory/routes.js';
import kotRoutes from '../modules/kot/routes.js';
import employeeRoutes from '../modules/employee/routes.js';
import payrollRoutes from '../modules/payroll/routes.js';
import reportsRoutes from '../modules/reports/routes.js';
import websiteCmsRoutes from '../modules/website-cms/routes.js';
import purchaseRoutes from '../modules/purchase/routes.js';

const router = Router();

// Health Check
router.use('/health', healthRoutes);

// Modular Subsystems
router.use('/pos', posRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/kot', kotRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/employee', employeeRoutes);
router.use('/payroll', payrollRoutes);
router.use('/reports', reportsRoutes);
router.use('/website-cms', websiteCmsRoutes);

export default router;
