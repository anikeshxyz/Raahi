import mongoose from 'mongoose';
import { Table } from '../../models/Table.js';
import { Order } from '../../models/Order.js';
import { MenuItem } from '../../models/MenuItem.js';
import { Category } from '../../models/Category.js';
import { Reservation } from '../../models/Reservation.js';
import { AuditLog } from '../../models/AuditLog.js';
import { logAuditTrail } from '../../middleware/audit.js';
import {
  createOrderSchema,
  addItemsSchema,
  settleBillSchema,
  cancelOrderSchema,
  tableStatusSchema,
} from './validation.js';
import {
  defaultTablesData,
  defaultStaffUser,
  seedInitialTables,
  ensureDefaultStaffUser,
} from '../../seeds/posSeed.js';
import {
  defaultCategoriesData,
  defaultMenuItemsData,
  seedInitialMenu,
} from '../../seeds/menuSeed.js';
import {
  deductStockForOrder,
  restoreStockForOrder,
} from '../inventory/controller.js';

// In-memory fallback stores when MongoDB is not connected (e.g. unit testing / offline dev)
let memTables = defaultTablesData.map((t, idx) => ({
  _id: `65f02222222222222222${String(idx + 1).padStart(4, '0')}`,
  ...t,
  currentOrderId: null,
  currentReservationId: null,
}));

let memOrders = new Map();
let memAuditLogs = [];
let memReservations = [];

export const resetMemStore = () => {
  memTables = defaultTablesData.map((t, idx) => ({
    _id: `65f02222222222222222${String(idx + 1).padStart(4, '0')}`,
    ...t,
    currentOrderId: null,
    currentReservationId: null,
  }));
  memOrders.clear();
  memAuditLogs = [];
};

export const getMemOrders = () => memOrders;
export const getMemTables = () => memTables;
export const getMemAuditLogs = () => memAuditLogs;

// Helper to generate a unique order number: ORD-YYYYMMDD-XXXX
const generateOrderNumber = () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${rand}`;
};

// 1. GET /api/v1/pos/tables
export const getTables = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      await seedInitialTables();

      const tables = await Table.find()
        .populate({
          path: 'currentOrderId',
          select: 'orderNumber status subTotal taxTotal grandTotal paymentStatus items createdAt orderType customerName',
        })
        .populate({
          path: 'currentReservationId',
          select: 'name phone email date time guestCount specialRequests status',
        })
        .sort({ tableNumber: 1 });

      return res.json({
        success: true,
        data: tables,
      });
    }

    // In-memory fallback
    const populatedTables = memTables.map((t) => {
      const order = t.currentOrderId ? memOrders.get(String(t.currentOrderId)) : null;
      return {
        ...t,
        currentOrderId: order
          ? {
              _id: order._id,
              orderNumber: order.orderNumber,
              status: order.status,
              subTotal: order.subTotal,
              taxTotal: order.taxTotal,
              grandTotal: order.grandTotal,
              paymentStatus: order.paymentStatus,
              items: order.items,
              createdAt: order.createdAt,
              orderType: order.orderType,
              customerName: order.customerName,
            }
          : null,
      };
    });

    res.json({
      success: true,
      data: populatedTables,
    });
  } catch (error) {
    next(error);
  }
};

// 2. PUT /api/v1/pos/tables/:id/status
export const updateTableStatus = async (req, res, next) => {
  try {
    const validated = tableStatusSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const table = await Table.findById(req.params.id);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Table not found' });
      }

      table.status = validated.status;
      if (validated.status === 'vacant') {
        table.currentOrderId = null;
      }
      await table.save();

      return res.json({
        success: true,
        message: `Table ${table.tableNumber} status updated to ${table.status}`,
        data: table,
      });
    }

    // In-memory fallback
    const table = memTables.find((t) => String(t._id) === req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    table.status = validated.status;
    if (validated.status === 'vacant') {
      table.currentOrderId = null;
    }

    res.json({
      success: true,
      message: `Table ${table.tableNumber} status updated to ${table.status}`,
      data: table,
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

// 3. GET /api/v1/pos/menu
export const getPosMenu = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      await seedInitialMenu();

      const categories = await Category.find().sort({ displayOrder: 1 }).lean();
      const menuItems = await MenuItem.find({ isAvailable: true }).lean();

      const result = categories.map((cat) => ({
        ...cat,
        items: menuItems.filter(
          (item) => String(item.categoryId) === String(cat._id)
        ),
      }));

      return res.json({
        success: true,
        data: result,
      });
    }

    // In-memory fallback
    const result = defaultCategoriesData.map((cat, idx) => ({
      _id: `cat-${idx + 1}`,
      ...cat,
      items: defaultMenuItemsData.filter((i) => i.categorySlug === cat.slug && i.isAvailable),
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 4. POST /api/v1/pos/orders
export const createOrder = async (req, res, next) => {
  try {
    const validated = createOrderSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    const itemIds = validated.items.map((i) => String(i.menuItemId));
    let menuItemMap = new Map();

    if (isDbConnected) {
      const foundMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
      foundMenuItems.forEach((m) => menuItemMap.set(String(m._id), m));
    } else {
      defaultMenuItemsData.forEach((m) => menuItemMap.set(String(m._id), m));
    }

    const processedItems = [];
    let subTotal = 0;

    for (const item of validated.items) {
      const dbItem = menuItemMap.get(String(item.menuItemId));
      if (!dbItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item not found: ${item.menuItemId}`,
        });
      }

      const unitPrice = dbItem.price;
      const taxPercent = dbItem.taxPercent || 5.0;
      const totalPrice = Math.round(unitPrice * item.quantity * 100) / 100;
      subTotal += totalPrice;

      processedItems.push({
        _id: isDbConnected ? new mongoose.Types.ObjectId() : `item-${Date.now()}-${Math.random()}`,
        menuItemId: dbItem._id,
        name: dbItem.name,
        quantity: item.quantity,
        unitPrice,
        taxPercent,
        totalPrice,
        notes: item.notes || '',
        status: 'pending',
        kotPrintedAt: null,
      });
    }

    subTotal = Math.round(subTotal * 100) / 100;
    const taxTotal = Math.round(subTotal * 0.05 * 100) / 100;
    const grandTotal = Math.round((subTotal + taxTotal) * 100) / 100;
    const orderNumber = generateOrderNumber();

    if (isDbConnected) {
      let creator = req.user;
      if (!creator) {
        creator = await ensureDefaultStaffUser();
      }

      let targetTable = null;
      if (validated.orderType === 'dine-in' && validated.tableId) {
        targetTable = await Table.findById(validated.tableId);
        if (!targetTable) {
          return res.status(404).json({ success: false, message: 'Selected table not found' });
        }
      }

      const order = await Order.create({
        orderNumber,
        tableId: targetTable ? targetTable._id : null,
        orderType: validated.orderType,
        status: 'pending',
        items: processedItems,
        subTotal,
        taxTotal,
        discountAmount: 0,
        grandTotal,
        paymentStatus: 'unpaid',
        kotStatus: 'sent',
        createdBy: creator._id,
        customerName: validated.customerName || '',
        customerPhone: validated.customerPhone || '',
      });

      if (targetTable) {
        targetTable.status = 'occupied';
        targetTable.currentOrderId = order._id;
        await targetTable.save();
      }

      // Automatically deduct stock via recipe mapping on POS sale
      await deductStockForOrder(processedItems);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    }

    // In-memory fallback
    let targetTable = null;
    if (validated.orderType === 'dine-in' && validated.tableId) {
      targetTable = memTables.find((t) => String(t._id) === String(validated.tableId));
      if (!targetTable) {
        return res.status(404).json({ success: false, message: 'Selected table not found' });
      }
    }

    const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOrder = {
      _id: orderId,
      orderNumber,
      tableId: targetTable ? targetTable._id : null,
      orderType: validated.orderType,
      status: 'pending',
      items: processedItems,
      subTotal,
      taxTotal,
      discountAmount: 0,
      grandTotal,
      paymentStatus: 'unpaid',
      kotStatus: 'sent',
      createdBy: { _id: 'user-001', name: 'Cashier', role: 'Cashier' },
      customerName: validated.customerName || '',
      customerPhone: validated.customerPhone || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memOrders.set(orderId, newOrder);

    if (targetTable) {
      targetTable.status = 'occupied';
      targetTable.currentOrderId = orderId;
    }

    // Automatically deduct stock in-memory via recipe mapping
    await deductStockForOrder(processedItems);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
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

// 5. GET /api/v1/pos/orders
export const getOrders = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { status, orderType, tableId, todayOnly } = req.query;

    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
      if (orderType) query.orderType = orderType;
      if (tableId) query.tableId = tableId;

      if (todayOnly === 'true') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: startOfDay };
      }

      const orders = await Order.find(query)
        .populate('tableId', 'tableNumber capacity')
        .populate('createdBy', 'name role')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: orders.length,
        data: orders,
      });
    }

    // In-memory fallback
    let list = Array.from(memOrders.values());
    if (status) list = list.filter((o) => o.status === status);
    if (orderType) list = list.filter((o) => o.orderType === orderType);
    if (tableId) list = list.filter((o) => String(o.tableId) === String(tableId));

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// 6. GET /api/v1/pos/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await Order.findById(req.params.id)
        .populate('tableId', 'tableNumber capacity')
        .populate('createdBy', 'name role');

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      return res.json({
        success: true,
        data: order,
      });
    }

    // In-memory fallback
    const order = memOrders.get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// 7. PUT /api/v1/pos/orders/:id/items
export const addItemsToOrder = async (req, res, next) => {
  try {
    const validated = addItemsSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.status === 'billed' || order.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: `Cannot modify items for order in status: ${order.status}`,
        });
      }

      const itemIds = validated.items.map((i) => i.menuItemId);
      const foundMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
      const menuItemMap = new Map();
      foundMenuItems.forEach((m) => menuItemMap.set(String(m._id), m));

      for (const item of validated.items) {
        const dbItem = menuItemMap.get(item.menuItemId);
        if (!dbItem) {
          return res.status(400).json({
            success: false,
            message: `Menu item not found: ${item.menuItemId}`,
          });
        }

        const unitPrice = dbItem.price;
        const taxPercent = dbItem.taxPercent || 5.0;
        const totalPrice = Math.round(unitPrice * item.quantity * 100) / 100;

        order.items.push({
          menuItemId: dbItem._id,
          name: dbItem.name,
          quantity: item.quantity,
          unitPrice,
          taxPercent,
          totalPrice,
          notes: item.notes || '',
          status: 'pending',
        });
      }

      let newSubTotal = 0;
      order.items.forEach((item) => {
        if (item.status !== 'cancelled') {
          newSubTotal += item.totalPrice;
        }
      });

      order.subTotal = Math.round(newSubTotal * 100) / 100;
      order.taxTotal = Math.round(order.subTotal * 0.05 * 100) / 100;
      const discount = order.discountAmount || 0;
      order.grandTotal = Math.round(Math.max(0, order.subTotal - discount + order.taxTotal) * 100) / 100;

      await order.save();

      return res.json({
        success: true,
        message: 'Items added to order successfully',
        data: order,
      });
    }

    // In-memory fallback
    const order = memOrders.get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'billed' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot modify items for order in status: ${order.status}`,
      });
    }

    const menuItemMap = new Map();
    defaultMenuItemsData.forEach((m) => menuItemMap.set(String(m._id), m));

    for (const item of validated.items) {
      const dbItem = menuItemMap.get(String(item.menuItemId));
      if (!dbItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item not found: ${item.menuItemId}`,
        });
      }

      const unitPrice = dbItem.price;
      const taxPercent = dbItem.taxPercent || 5.0;
      const totalPrice = Math.round(unitPrice * item.quantity * 100) / 100;

      order.items.push({
        _id: `item-${Date.now()}-${Math.random()}`,
        menuItemId: dbItem._id,
        name: dbItem.name,
        quantity: item.quantity,
        unitPrice,
        taxPercent,
        totalPrice,
        notes: item.notes || '',
        status: 'pending',
        kotPrintedAt: null,
      });
    }

    let newSubTotal = 0;
    order.items.forEach((item) => {
      if (item.status !== 'cancelled') {
        newSubTotal += item.totalPrice;
      }
    });

    order.subTotal = Math.round(newSubTotal * 100) / 100;
    order.taxTotal = Math.round(order.subTotal * 0.05 * 100) / 100;
    const discount = order.discountAmount || 0;
    order.grandTotal = Math.round(Math.max(0, order.subTotal - discount + order.taxTotal) * 100) / 100;
    order.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Items added to order successfully',
      data: order,
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

// 8. POST /api/v1/pos/orders/:id/kot
export const sendKot = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.status === 'cancelled' || order.status === 'billed') {
        return res.status(400).json({
          success: false,
          message: `Cannot send KOT for order with status: ${order.status}`,
        });
      }

      const now = new Date();
      order.items.forEach((item) => {
        if (item.status === 'pending') {
          item.status = 'preparing';
          item.kotPrintedAt = now;
        }
      });

      order.status = 'in-kitchen';
      order.kotStatus = 'preparing';
      await order.save();

      return res.json({
        success: true,
        message: 'Order sent to kitchen (KOT generated)',
        data: order,
      });
    }

    // In-memory fallback
    const order = memOrders.get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'cancelled' || order.status === 'billed') {
      return res.status(400).json({
        success: false,
        message: `Cannot send KOT for order with status: ${order.status}`,
      });
    }

    const now = new Date();
    order.items.forEach((item) => {
      if (item.status === 'pending') {
        item.status = 'preparing';
        item.kotPrintedAt = now;
      }
    });

    order.status = 'in-kitchen';
    order.kotStatus = 'preparing';
    order.updatedAt = now;

    res.json({
      success: true,
      message: 'Order sent to kitchen (KOT generated)',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// 9. POST /api/v1/pos/orders/:id/settle
export const settleOrder = async (req, res, next) => {
  try {
    const validated = settleBillSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.status === 'billed') {
        return res.status(400).json({ success: false, message: 'Order is already settled and billed' });
      }

      if (order.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Cancelled orders cannot be settled' });
      }

      const discount = Math.min(validated.discountAmount || 0, order.subTotal);
      order.discountAmount = discount;

      const finalSubTotal = order.subTotal;
      const finalTaxTotal = Math.round((finalSubTotal - discount) * 0.05 * 100) / 100;
      order.taxTotal = finalTaxTotal;
      order.grandTotal = Math.round((finalSubTotal - discount + finalTaxTotal) * 100) / 100;

      order.paymentMethod = validated.paymentMethod;
      order.paymentStatus = 'paid';
      order.status = 'billed';

      if (validated.customerName) order.customerName = validated.customerName;
      if (validated.customerPhone) order.customerPhone = validated.customerPhone;

      if (order.tableId) {
        await Table.findByIdAndUpdate(order.tableId, {
          status: 'vacant',
          currentOrderId: null,
        });
      }

      if (discount > 0) {
        await logAuditTrail({
          actorId: req.user?._id || null,
          actorRole: req.user?.role || 'Cashier',
          action: 'ORDER_DISCOUNT_APPLIED',
          entityName: 'Order',
          entityId: String(order._id),
          beforeState: { discountAmount: 0 },
          afterState: { discountAmount: discount, grandTotal: order.grandTotal },
          notes: `Discount of ₹${discount} applied to bill ${order.orderNumber}`,
        });
      }

      await order.save();

      const cgst = Math.round((order.taxTotal / 2) * 100) / 100;
      const sgst = Math.round((order.taxTotal - cgst) * 100) / 100;

      return res.json({
        success: true,
        message: 'Bill settled and order closed successfully',
        data: order,
        receipt: {
          cafeName: 'Raahi Café',
          address: '100 Feet Road, Indiranagar, Bengaluru 560038',
          gstin: '29AAAAA0000A1Z5',
          fssai: '11223344556677',
          orderNumber: order.orderNumber,
          date: order.updatedAt,
          orderType: order.orderType,
          items: order.items.map((i) => ({
            name: i.name,
            qty: i.quantity,
            rate: i.unitPrice,
            amount: i.totalPrice,
          })),
          subTotal: order.subTotal,
          discount: order.discountAmount,
          cgst,
          sgst,
          taxTotal: order.taxTotal,
          grandTotal: order.grandTotal,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
        },
      });
    }

    // In-memory fallback
    const order = memOrders.get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'billed') {
      return res.status(400).json({ success: false, message: 'Order is already settled and billed' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled orders cannot be settled' });
    }

    const discount = Math.min(validated.discountAmount || 0, order.subTotal);
    order.discountAmount = discount;

    const finalSubTotal = order.subTotal;
    const finalTaxTotal = Math.round((finalSubTotal - discount) * 0.05 * 100) / 100;
    order.taxTotal = finalTaxTotal;
    order.grandTotal = Math.round((finalSubTotal - discount + finalTaxTotal) * 100) / 100;

    order.paymentMethod = validated.paymentMethod;
    order.paymentStatus = 'paid';
    order.status = 'billed';
    order.updatedAt = new Date();

    if (validated.customerName) order.customerName = validated.customerName;
    if (validated.customerPhone) order.customerPhone = validated.customerPhone;

    if (order.tableId) {
      const table = memTables.find((t) => String(t._id) === String(order.tableId));
      if (table) {
        table.status = 'vacant';
        table.currentOrderId = null;
      }
    }

    if (discount > 0) {
      memAuditLogs.push({
        actorRole: 'Cashier',
        action: 'ORDER_DISCOUNT_APPLIED',
        entityName: 'Order',
        entityId: String(order._id),
        notes: `Discount of ₹${discount} applied to bill ${order.orderNumber}`,
        timestamp: new Date(),
      });
    }

    const cgst = Math.round((order.taxTotal / 2) * 100) / 100;
    const sgst = Math.round((order.taxTotal - cgst) * 100) / 100;

    res.json({
      success: true,
      message: 'Bill settled and order closed successfully',
      data: order,
      receipt: {
        cafeName: 'Raahi Café',
        address: '100 Feet Road, Indiranagar, Bengaluru 560038',
        gstin: '29AAAAA0000A1Z5',
        fssai: '11223344556677',
        orderNumber: order.orderNumber,
        date: order.updatedAt,
        orderType: order.orderType,
        items: order.items.map((i) => ({
          name: i.name,
          qty: i.quantity,
          rate: i.unitPrice,
          amount: i.totalPrice,
        })),
        subTotal: order.subTotal,
        discount: order.discountAmount,
        cgst,
        sgst,
        taxTotal: order.taxTotal,
        grandTotal: order.grandTotal,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      },
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

// 10. POST /api/v1/pos/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
  try {
    const validated = cancelOrderSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.status === 'billed') {
        return res.status(400).json({
          success: false,
          message: 'Billed order cannot be cancelled directly. Please issue a refund.',
        });
      }

      const beforeState = {
        status: order.status,
        itemsCount: order.items.length,
        grandTotal: order.grandTotal,
      };

      order.status = 'cancelled';
      order.items.forEach((item) => {
        item.status = 'cancelled';
      });

      if (order.tableId) {
        await Table.findByIdAndUpdate(order.tableId, {
          status: 'vacant',
          currentOrderId: null,
        });
      }

      // Restore recipe stock on cancelled order
      await restoreStockForOrder(order.items, validated.reason);

      await order.save();

      await logAuditTrail({
        actorId: req.user?._id || null,
        actorRole: req.user?.role || 'Cashier',
        action: 'ORDER_CANCELLED',
        entityName: 'Order',
        entityId: String(order._id),
        beforeState,
        afterState: { status: 'cancelled' },
        notes: validated.reason,
      });

      return res.json({
        success: true,
        message: 'Order cancelled successfully and audit trail recorded',
        data: order,
      });
    }

    // In-memory fallback
    const order = memOrders.get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'billed') {
      return res.status(400).json({
        success: false,
        message: 'Billed order cannot be cancelled directly. Please issue a refund.',
      });
    }

    const beforeState = {
      status: order.status,
      itemsCount: order.items.length,
      grandTotal: order.grandTotal,
    };

    order.status = 'cancelled';
    order.items.forEach((item) => {
      item.status = 'cancelled';
    });

    if (order.tableId) {
      const table = memTables.find((t) => String(t._id) === String(order.tableId));
      if (table) {
        table.status = 'vacant';
        table.currentOrderId = null;
      }
    }

    // Restore recipe stock in-memory
    await restoreStockForOrder(order.items, validated.reason);

    memAuditLogs.push({
      actorRole: 'Cashier',
      action: 'ORDER_CANCELLED',
      entityName: 'Order',
      entityId: String(order._id),
      beforeState,
      afterState: { status: 'cancelled' },
      notes: validated.reason,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully and audit trail recorded',
      data: order,
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

// 11. POST /api/v1/pos/orders/:id/refund
export const refundOrder = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.paymentStatus !== 'paid') {
        return res.status(400).json({
          success: false,
          message: `Cannot refund order with payment status: ${order.paymentStatus}`,
        });
      }

      const beforeState = {
        paymentStatus: order.paymentStatus,
        grandTotal: order.grandTotal,
      };

      order.paymentStatus = 'refunded';
      await order.save();

      await logAuditTrail({
        actorId: req.user?._id || null,
        actorRole: req.user?.role || 'Manager',
        action: 'ORDER_REFUNDED',
        entityName: 'Order',
        entityId: String(order._id),
        beforeState,
        afterState: { paymentStatus: 'refunded' },
        notes: req.body.reason || 'Customer refund',
      });

      return res.json({
        success: true,
        message: 'Order refunded successfully and audit trail logged',
        data: order,
      });
    }

    // In-memory fallback
    const order = memOrders.get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot refund order with payment status: ${order.paymentStatus}`,
      });
    }

    const beforeState = {
      paymentStatus: order.paymentStatus,
      grandTotal: order.grandTotal,
    };

    order.paymentStatus = 'refunded';

    memAuditLogs.push({
      actorRole: 'Manager',
      action: 'ORDER_REFUNDED',
      entityName: 'Order',
      entityId: String(order._id),
      beforeState,
      afterState: { paymentStatus: 'refunded' },
      notes: req.body.reason || 'Customer refund',
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: 'Order refunded successfully and audit trail logged',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/pos/reservations
 * Fetch all customer table reservations from online booking
 */
export const getReservations = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const reservations = await Reservation.find()
        .populate('tableId', 'tableNumber capacity status')
        .sort({ date: 1, time: 1, createdAt: -1 });
      return res.json({ success: true, data: reservations });
    }
    return res.json({ success: true, data: memReservations });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/pos/reservations/:id/assign
 * Assign a specific table to a pending reservation
 */
export const assignReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tableId } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!tableId) {
      return res.status(400).json({ success: false, message: 'Please select a table to assign' });
    }

    if (isDbConnected) {
      const reservation = await Reservation.findById(id);
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Reservation not found' });
      }

      const table = await Table.findById(tableId);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Table not found' });
      }

      // If previous table was assigned, release it
      if (reservation.tableId && String(reservation.tableId) !== String(tableId)) {
        await Table.findByIdAndUpdate(reservation.tableId, { status: 'vacant', currentReservationId: null });
      }

      // Update table to reserved
      table.status = 'reserved';
      table.currentReservationId = reservation._id;
      await table.save();

      // Update reservation
      reservation.tableId = table._id;
      reservation.status = 'Confirmed';
      await reservation.save();

      return res.json({
        success: true,
        message: `Table ${table.tableNumber} assigned to ${reservation.name}`,
        data: { reservation, table },
      });
    }

    // In-memory
    const r = memReservations.find((item) => String(item._id) === String(id));
    if (r) {
      r.tableId = tableId;
      r.status = 'Confirmed';
    }
    return res.json({ success: true, message: 'Table assigned (in-memory)' });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/pos/reservations/:id/seat
 * Seat the guests when they arrive at the café
 */
export const seatReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const reservation = await Reservation.findById(id);
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Reservation not found' });
      }

      reservation.status = 'Seated';
      await reservation.save();

      let table = null;
      if (reservation.tableId) {
        table = await Table.findById(reservation.tableId);
        if (table) {
          table.status = 'occupied';
          await table.save();
        }
      }

      return res.json({
        success: true,
        message: `Guest ${reservation.name} seated successfully`,
        data: { reservation, table },
      });
    }

    return res.json({ success: true, message: 'Guest marked as seated' });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/pos/reservations/:id/cancel
 * Cancel a table reservation and free up the table
 */
export const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const reservation = await Reservation.findById(id);
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Reservation not found' });
      }

      if (reservation.tableId) {
        const table = await Table.findById(reservation.tableId);
        if (table && table.status === 'reserved') {
          table.status = 'vacant';
          table.currentReservationId = null;
          await table.save();
        }
      }

      reservation.status = 'Cancelled';
      await reservation.save();

      return res.json({
        success: true,
        message: `Reservation for ${reservation.name} cancelled`,
        data: reservation,
      });
    }

    return res.json({ success: true, message: 'Reservation cancelled' });
  } catch (error) {
    next(error);
  }
};

