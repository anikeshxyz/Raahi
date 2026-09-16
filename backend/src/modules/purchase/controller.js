import mongoose from 'mongoose';
import { Supplier } from '../../models/Supplier.js';
import { PurchaseOrder } from '../../models/PurchaseOrder.js';
import { InventoryItem } from '../../models/InventoryItem.js';
import { logAuditTrail } from '../../middleware/audit.js';
import {
  createSupplierSchema,
  updateSupplierSchema,
  createPurchaseOrderSchema,
  updatePOStatusSchema,
} from './validation.js';
import {
  defaultSuppliersData,
  seedInitialSuppliers,
} from '../../seeds/suppliersSeed.js';
import { getMemInventory } from '../inventory/controller.js';

// In-memory fallback stores
let memSuppliers = defaultSuppliersData.map((s) => ({ ...s }));
let memPurchaseOrders = [
  {
    _id: 'po-initial-001',
    poNumber: 'PO-2026-0001',
    supplierId: 'sup-chikmagalur-001',
    items: [
      {
        inventoryItemId: '65f033333333333333330001',
        quantity: 25,
        unitCost: 1400,
        totalCost: 35000,
      },
    ],
    totalAmount: 35000,
    status: 'received',
    receivedDate: new Date('2026-09-01T10:00:00Z'),
    createdBy: 'usr-admin-001',
    notes: 'Initial monthly specialty beans procurement',
    createdAt: new Date('2026-09-01T09:00:00Z'),
    updatedAt: new Date('2026-09-01T10:00:00Z'),
  },
  {
    _id: 'po-initial-002',
    poNumber: 'PO-2026-0002',
    supplierId: 'sup-nilgiri-002',
    items: [
      {
        inventoryItemId: '65f033333333333333330002',
        quantity: 100,
        unitCost: 65,
        totalCost: 6500,
      },
    ],
    totalAmount: 6500,
    status: 'ordered',
    receivedDate: null,
    createdBy: 'usr-admin-001',
    notes: 'Weekly fresh organic milk batch',
    createdAt: new Date('2026-09-10T08:30:00Z'),
    updatedAt: new Date('2026-09-10T08:30:00Z'),
  },
];

let poCounter = 3;

export const resetMemPurchaseStore = () => {
  memSuppliers = defaultSuppliersData.map((s) => ({ ...s }));
  memPurchaseOrders = [
    {
      _id: 'po-initial-001',
      poNumber: 'PO-2026-0001',
      supplierId: 'sup-chikmagalur-001',
      items: [
        {
          inventoryItemId: '65f033333333333333330001',
          quantity: 25,
          unitCost: 1400,
          totalCost: 35000,
        },
      ],
      totalAmount: 35000,
      status: 'received',
      receivedDate: new Date('2026-09-01T10:00:00Z'),
      createdBy: 'usr-admin-001',
      notes: 'Initial monthly specialty beans procurement',
      createdAt: new Date('2026-09-01T09:00:00Z'),
      updatedAt: new Date('2026-09-01T10:00:00Z'),
    },
    {
      _id: 'po-initial-002',
      poNumber: 'PO-2026-0002',
      supplierId: 'sup-nilgiri-002',
      items: [
        {
          inventoryItemId: '65f033333333333333330002',
          quantity: 100,
          unitCost: 65,
          totalCost: 6500,
        },
      ],
      totalAmount: 6500,
      status: 'ordered',
      receivedDate: null,
      createdBy: 'usr-admin-001',
      notes: 'Weekly fresh organic milk batch',
      createdAt: new Date('2026-09-10T08:30:00Z'),
      updatedAt: new Date('2026-09-10T08:30:00Z'),
    },
  ];
  poCounter = 3;
};

export const getMemSuppliers = () => memSuppliers;
export const getMemPurchaseOrders = () => memPurchaseOrders;

// ==========================================
// 1. SUPPLIER ENDPOINTS
// ==========================================

// GET /api/v1/purchase/suppliers
export const getSuppliers = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { active, search } = req.query;

    let suppliers = [];

    if (isDbConnected) {
      await seedInitialSuppliers();
      const query = {};
      if (active !== undefined) query.isActive = active === 'true';
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { contactPerson: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }
      suppliers = await Supplier.find(query).sort({ name: 1 }).lean();
    } else {
      suppliers = memSuppliers.map((s) => ({ ...s }));
      if (active !== undefined) {
        suppliers = suppliers.filter((s) => s.isActive === (active === 'true'));
      }
      if (search) {
        const q = search.toLowerCase();
        suppliers = suppliers.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
            (s.phone && s.phone.includes(q))
        );
      }
    }

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/purchase/suppliers
export const createSupplier = async (req, res, next) => {
  try {
    const validated = createSupplierSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const supplier = await Supplier.create(validated);
      return res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier,
      });
    }

    // In-memory fallback
    const newSupplier = {
      _id: `sup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memSuppliers.push(newSupplier);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: newSupplier,
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

// PUT /api/v1/purchase/suppliers/:id
export const updateSupplier = async (req, res, next) => {
  try {
    const validated = updateSupplierSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const supplier = await Supplier.findByIdAndUpdate(req.params.id, validated, { new: true });
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }
      return res.json({
        success: true,
        message: 'Supplier updated successfully',
        data: supplier,
      });
    }

    // In-memory fallback
    const index = memSuppliers.findIndex((s) => String(s._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    memSuppliers[index] = {
      ...memSuppliers[index],
      ...validated,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: memSuppliers[index],
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

// DELETE /api/v1/purchase/suppliers/:id (soft delete: set isActive to false)
export const deleteSupplier = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const supplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }
      return res.json({
        success: true,
        message: 'Supplier deactivated successfully',
        data: supplier,
      });
    }

    // In-memory fallback
    const index = memSuppliers.findIndex((s) => String(s._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    memSuppliers[index].isActive = false;
    memSuppliers[index].updatedAt = new Date();

    res.json({
      success: true,
      message: 'Supplier deactivated successfully',
      data: memSuppliers[index],
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. PURCHASE ORDER ENDPOINTS
// ==========================================

// Helper to enrich PO with supplier & item details
const enrichPO = (po) => {
  const memInv = getMemInventory();
  const sup = memSuppliers.find((s) => String(s._id) === String(po.supplierId?._id || po.supplierId));

  const items = (po.items || []).map((item) => {
    const inv = memInv.find((i) => String(i._id) === String(item.inventoryItemId?._id || item.inventoryItemId));
    return {
      ...item,
      inventoryItemId: inv
        ? {
            _id: inv._id,
            name: inv.name,
            sku: inv.sku,
            unit: inv.unit,
            currentStock: inv.currentStock,
          }
        : item.inventoryItemId,
    };
  });

  return {
    ...po,
    supplierId: sup
      ? {
          _id: sup._id,
          name: sup.name,
          contactPerson: sup.contactPerson,
          phone: sup.phone,
          email: sup.email,
          gstin: sup.gstin,
        }
      : po.supplierId,
    items,
  };
};

// GET /api/v1/purchase/orders
export const getPurchaseOrders = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { status, supplierId } = req.query;

    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
      if (supplierId) query.supplierId = supplierId;

      const orders = await PurchaseOrder.find(query)
        .populate('supplierId', 'name contactPerson phone email gstin')
        .populate('items.inventoryItemId', 'name sku unit currentStock')
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        count: orders.length,
        data: orders,
      });
    }

    // In-memory fallback
    let orders = memPurchaseOrders.map((o) => ({ ...o }));
    if (status) orders = orders.filter((o) => o.status === status);
    if (supplierId) {
      orders = orders.filter((o) => String(o.supplierId?._id || o.supplierId) === supplierId);
    }

    const enriched = orders.map(enrichPO).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/purchase/orders/:id
export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await PurchaseOrder.findById(req.params.id)
        .populate('supplierId', 'name contactPerson phone email gstin address')
        .populate('items.inventoryItemId', 'name sku unit currentStock costPerUnit')
        .lean();

      if (!order) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      return res.json({ success: true, data: order });
    }

    // In-memory fallback
    const order = memPurchaseOrders.find((o) => String(o._id) === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({ success: true, data: enrichPO(order) });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/purchase/orders
export const createPurchaseOrder = async (req, res, next) => {
  try {
    const validated = createPurchaseOrderSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;
    const year = new Date().getFullYear();

    // Calculate line item totals and overall total
    let totalAmount = 0;
    const calculatedItems = validated.items.map((item) => {
      const totalCost = Math.round(item.quantity * item.unitCost * 100) / 100;
      totalAmount += totalCost;
      return {
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost,
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;

    if (isDbConnected) {
      const poCount = await PurchaseOrder.countDocuments();
      const poNumber = `PO-${year}-${String(poCount + 1).padStart(4, '0')}`;

      // Default createdBy to user or a generic admin ObjectId
      const createdBy = req.user?._id || new mongoose.Types.ObjectId();

      const newPO = await PurchaseOrder.create({
        poNumber,
        supplierId: validated.supplierId,
        items: calculatedItems,
        totalAmount,
        status: 'draft',
        createdBy,
        notes: validated.notes || '',
      });

      const populated = await PurchaseOrder.findById(newPO._id)
        .populate('supplierId', 'name contactPerson phone email gstin')
        .populate('items.inventoryItemId', 'name sku unit currentStock');

      return res.status(201).json({
        success: true,
        message: 'Purchase order created successfully',
        data: populated,
      });
    }

    // In-memory fallback
    const poNumber = `PO-${year}-${String(poCounter++).padStart(4, '0')}`;
    const newPO = {
      _id: `po-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      poNumber,
      supplierId: validated.supplierId,
      items: calculatedItems,
      totalAmount,
      status: 'draft',
      receivedDate: null,
      createdBy: req.user?._id || 'usr-admin-001',
      notes: validated.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memPurchaseOrders.push(newPO);

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: enrichPO(newPO),
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

// PUT /api/v1/purchase/orders/:id/status
export const updatePOStatus = async (req, res, next) => {
  try {
    const { status, notes } = updatePOStatusSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const po = await PurchaseOrder.findById(req.params.id);
      if (!po) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      if (po.status === 'received' && status !== 'received') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change status of an already received purchase order',
        });
      }

      if (po.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change status of a cancelled purchase order',
        });
      }

      po.status = status;
      if (notes) po.notes = notes;
      await po.save();

      return res.json({
        success: true,
        message: `Purchase order status updated to ${status}`,
        data: po,
      });
    }

    // In-memory fallback
    const index = memPurchaseOrders.findIndex((o) => String(o._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const po = memPurchaseOrders[index];
    if (po.status === 'received' && status !== 'received') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change status of an already received purchase order',
      });
    }

    if (po.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change status of a cancelled purchase order',
      });
    }

    po.status = status;
    if (notes) po.notes = notes;
    po.updatedAt = new Date();

    res.json({
      success: true,
      message: `Purchase order status updated to ${status}`,
      data: enrichPO(po),
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

// POST /api/v1/purchase/orders/:id/receive (Goods Received Note / GRN - Inward Stock Automation)
export const receivePurchaseOrder = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const po = await PurchaseOrder.findById(req.params.id);
      if (!po) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      if (po.status === 'received') {
        return res.status(400).json({
          success: false,
          message: 'This purchase order has already been received',
        });
      }

      if (po.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot receive a cancelled purchase order',
        });
      }

      // 1. Mark PO as received
      po.status = 'received';
      po.receivedDate = new Date();
      await po.save();

      // 2. Automated Stock Inward for each item in the PO
      for (const item of po.items) {
        const inv = await InventoryItem.findById(item.inventoryItemId);
        if (inv) {
          const beforeStock = inv.currentStock;
          const newStock = Math.round((beforeStock + item.quantity) * 1000) / 1000;
          inv.currentStock = newStock;
          if (item.unitCost > 0) {
            inv.costPerUnit = item.unitCost;
          }
          await inv.save();

          // Write mandatory audit log
          await logAuditTrail({
            actorId: req.user?._id || null,
            actorRole: req.user?.role || 'Manager',
            action: 'STOCK_INWARD_PO',
            entityName: 'InventoryItem',
            entityId: String(inv._id),
            beforeState: { currentStock: beforeStock },
            afterState: { currentStock: newStock },
            notes: `Goods Received Note: Inward from PO ${po.poNumber} (+${item.quantity} ${inv.unit})`,
          });
        }
      }

      // Log PO received event
      await logAuditTrail({
        actorId: req.user?._id || null,
        actorRole: req.user?.role || 'Manager',
        action: 'PURCHASE_ORDER_RECEIVED',
        entityName: 'PurchaseOrder',
        entityId: String(po._id),
        beforeState: { status: 'ordered' },
        afterState: { status: 'received' },
        notes: `PO ${po.poNumber} received. ₹${po.totalAmount} goods added to stock.`,
      });

      const updated = await PurchaseOrder.findById(po._id)
        .populate('supplierId', 'name contactPerson phone email gstin')
        .populate('items.inventoryItemId', 'name sku unit currentStock');

      return res.json({
        success: true,
        message: `PO ${po.poNumber} received successfully. Stock inward credited and audit trail logged.`,
        data: updated,
      });
    }

    // In-memory fallback
    const index = memPurchaseOrders.findIndex((o) => String(o._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const po = memPurchaseOrders[index];
    if (po.status === 'received') {
      return res.status(400).json({
        success: false,
        message: 'This purchase order has already been received',
      });
    }

    if (po.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot receive a cancelled purchase order',
      });
    }

    po.status = 'received';
    po.receivedDate = new Date();
    po.updatedAt = new Date();

    // Automated Stock Inward into memInventory
    const memInv = getMemInventory();
    for (const item of po.items) {
      const inv = memInv.find((i) => String(i._id) === String(item.inventoryItemId?._id || item.inventoryItemId));
      if (inv) {
        const beforeStock = inv.currentStock;
        inv.currentStock = Math.round((beforeStock + item.quantity) * 1000) / 1000;
        if (item.unitCost > 0) {
          inv.costPerUnit = item.unitCost;
        }
        inv.updatedAt = new Date();

        await logAuditTrail({
          actorId: req.user?._id || 'usr-admin-001',
          actorRole: req.user?.role || 'Manager',
          action: 'STOCK_INWARD_PO',
          entityName: 'InventoryItem',
          entityId: String(inv._id),
          beforeState: { currentStock: beforeStock },
          afterState: { currentStock: inv.currentStock },
          notes: `Goods Received Note: Inward from PO ${po.poNumber} (+${item.quantity} ${inv.unit})`,
        });
      }
    }

    await logAuditTrail({
      actorId: req.user?._id || 'usr-admin-001',
      actorRole: req.user?.role || 'Manager',
      action: 'PURCHASE_ORDER_RECEIVED',
      entityName: 'PurchaseOrder',
      entityId: String(po._id),
      beforeState: { status: 'ordered' },
      afterState: { status: 'received' },
      notes: `PO ${po.poNumber} received. ₹${po.totalAmount} goods added to stock.`,
    });

    res.json({
      success: true,
      message: `PO ${po.poNumber} received successfully. Stock inward credited and audit trail logged.`,
      data: enrichPO(po),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/purchase/orders/:id/cancel
export const cancelPurchaseOrder = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const po = await PurchaseOrder.findById(req.params.id);
      if (!po) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      if (po.status === 'received') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a purchase order that has already been received into stock',
        });
      }

      if (po.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Purchase order is already cancelled',
        });
      }

      const prevStatus = po.status;
      po.status = 'cancelled';
      po.notes = reason ? `${po.notes ? po.notes + ' | ' : ''}Cancellation reason: ${reason}` : po.notes;
      await po.save();

      await logAuditTrail({
        actorId: req.user?._id || null,
        actorRole: req.user?.role || 'Manager',
        action: 'PURCHASE_ORDER_CANCELLED',
        entityName: 'PurchaseOrder',
        entityId: String(po._id),
        beforeState: { status: prevStatus },
        afterState: { status: 'cancelled' },
        notes: `PO ${po.poNumber} cancelled. Reason: ${reason || 'Not specified'}`,
      });

      return res.json({
        success: true,
        message: `Purchase order ${po.poNumber} cancelled successfully`,
        data: po,
      });
    }

    // In-memory fallback
    const index = memPurchaseOrders.findIndex((o) => String(o._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const po = memPurchaseOrders[index];
    if (po.status === 'received') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a purchase order that has already been received into stock',
      });
    }

    if (po.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Purchase order is already cancelled',
      });
    }

    const prevStatus = po.status;
    po.status = 'cancelled';
    po.notes = reason ? `${po.notes ? po.notes + ' | ' : ''}Cancellation reason: ${reason}` : po.notes;
    po.updatedAt = new Date();

    await logAuditTrail({
      actorId: req.user?._id || 'usr-admin-001',
      actorRole: req.user?.role || 'Manager',
      action: 'PURCHASE_ORDER_CANCELLED',
      entityName: 'PurchaseOrder',
      entityId: String(po._id),
      beforeState: { status: prevStatus },
      afterState: { status: 'cancelled' },
      notes: `PO ${po.poNumber} cancelled. Reason: ${reason || 'Not specified'}`,
    });

    res.json({
      success: true,
      message: `Purchase order ${po.poNumber} cancelled successfully`,
      data: enrichPO(po),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/purchase/summary
export const getPurchaseSummary = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    let suppliersCount = 0;
    let pendingCount = 0;
    let receivedCount = 0;
    let totalInwardSpend = 0;

    if (isDbConnected) {
      await seedInitialSuppliers();
      suppliersCount = await Supplier.countDocuments({ isActive: true });
      pendingCount = await PurchaseOrder.countDocuments({ status: { $in: ['draft', 'ordered'] } });
      receivedCount = await PurchaseOrder.countDocuments({ status: 'received' });

      const spendAgg = await PurchaseOrder.aggregate([
        { $match: { status: 'received' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]);
      totalInwardSpend = spendAgg[0]?.total || 0;
    } else {
      suppliersCount = memSuppliers.filter((s) => s.isActive).length;
      pendingCount = memPurchaseOrders.filter((o) => ['draft', 'ordered'].includes(o.status)).length;
      receivedCount = memPurchaseOrders.filter((o) => o.status === 'received').length;
      totalInwardSpend = memPurchaseOrders
        .filter((o) => o.status === 'received')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    }

    res.json({
      success: true,
      data: {
        activeSuppliers: suppliersCount,
        pendingOrders: pendingCount,
        receivedOrders: receivedCount,
        totalInwardSpend: Math.round(totalInwardSpend * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};
