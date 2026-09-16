import mongoose from 'mongoose';
import { Order } from '../../models/Order.js';
import { Table } from '../../models/Table.js';
import { ticketStatusSchema, itemStatusSchema } from './validation.js';
import { getMemOrders, getMemTables } from '../pos/controller.js';

// Station categorization: Beverage (Barista) vs Kitchen (Chef / Bakery)
export const determineStation = (item) => {
  const name = (item.name || '').toLowerCase();
  const beverageKeywords = [
    'coffee',
    'pour over',
    'v60',
    'latte',
    'flat white',
    'brew',
    'espresso',
    'tea',
    'matcha',
    'kahwa',
    'cappuccino',
    'mocha',
    'beverage',
    'shake',
    'tonic',
  ];

  for (const kw of beverageKeywords) {
    if (name.includes(kw)) {
      return 'beverage';
    }
  }
  return 'kitchen';
};

// 1. GET /api/v1/kot/tickets
export const getLiveTickets = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { station = 'all', status = 'all', history = 'false' } = req.query;

    let orders = [];

    if (isDbConnected) {
      const query = { status: { $ne: 'cancelled' } };

      if (history === 'true') {
        query.kotStatus = 'completed';
      } else {
        if (status !== 'all') {
          query.kotStatus = status;
        } else {
          query.kotStatus = { $in: ['sent', 'preparing', 'ready'] };
        }
      }

      orders = await Order.find(query)
        .populate('tableId', 'tableNumber capacity status')
        .populate('createdBy', 'name role')
        .sort({ createdAt: 1 })
        .lean();
    } else {
      // In-memory fallback
      const memMap = getMemOrders();
      orders = Array.from(memMap.values()).filter((o) => o.status !== 'cancelled');

      if (history === 'true') {
        orders = orders.filter((o) => o.kotStatus === 'completed');
      } else {
        if (status !== 'all') {
          orders = orders.filter((o) => o.kotStatus === status);
        } else {
          orders = orders.filter((o) => ['sent', 'preparing', 'ready'].includes(o.kotStatus));
        }
      }

      // Populate table in in-memory
      const memTables = getMemTables();
      orders = orders.map((o) => {
        const tbl = o.tableId ? memTables.find((t) => String(t._id) === String(o.tableId)) : null;
        return {
          ...o,
          tableId: tbl ? { _id: tbl._id, tableNumber: tbl.tableNumber, capacity: tbl.capacity } : null,
        };
      });
    }

    const now = Date.now();
    const formattedTickets = orders
      .map((order) => {
        const createdTime = new Date(order.createdAt).getTime();
        const elapsedMinutes = Math.max(0, Math.floor((now - createdTime) / 60000));

        const taggedItems = (order.items || []).map((item) => ({
          ...item,
          station: determineStation(item),
        }));

        let displayItems = taggedItems;
        if (station !== 'all') {
          displayItems = taggedItems.filter((i) => i.station === station);
        }

        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableId ? order.tableId.tableNumber : 'Takeaway',
          tableId: order.tableId,
          orderType: order.orderType,
          kotStatus: order.kotStatus,
          status: order.status,
          customerName: order.customerName,
          items: displayItems,
          totalItemsCount: taggedItems.length,
          matchingItemsCount: displayItems.length,
          elapsedMinutes,
          isDelayed: elapsedMinutes > 15,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      })
      .filter((ticket) => ticket.matchingItemsCount > 0);

    res.json({
      success: true,
      count: formattedTickets.length,
      data: formattedTickets,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/v1/kot/tickets/:id
export const getTicketById = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let order = null;

    if (isDbConnected) {
      order = await Order.findById(req.params.id)
        .populate('tableId', 'tableNumber capacity')
        .populate('createdBy', 'name role')
        .lean();
    } else {
      const memMap = getMemOrders();
      order = memMap.get(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Kitchen ticket not found' });
    }

    const elapsedMinutes = Math.max(
      0,
      Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
    );

    const taggedItems = (order.items || []).map((i) => ({
      ...i,
      station: determineStation(i),
    }));

    res.json({
      success: true,
      data: {
        ...order,
        items: taggedItems,
        elapsedMinutes,
        isDelayed: elapsedMinutes > 15,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. PUT /api/v1/kot/tickets/:id/status
export const updateTicketStatus = async (req, res, next) => {
  try {
    const validated = ticketStatusSchema.parse(req.body);
    const { kotStatus } = validated;
    const isDbConnected = mongoose.connection.readyState === 1;

    let order = null;
    if (isDbConnected) {
      order = await Order.findById(req.params.id);
    } else {
      const memMap = getMemOrders();
      order = memMap.get(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    order.kotStatus = kotStatus;
    const now = new Date();

    if (kotStatus === 'preparing') {
      order.status = 'in-kitchen';
      order.items.forEach((item) => {
        if (item.status === 'pending') {
          item.status = 'preparing';
          if (!item.kotPrintedAt) item.kotPrintedAt = now;
        }
      });
    } else if (kotStatus === 'ready') {
      order.items.forEach((item) => {
        if (item.status !== 'cancelled') {
          item.status = 'ready';
        }
      });
    } else if (kotStatus === 'completed') {
      order.items.forEach((item) => {
        if (item.status !== 'cancelled') {
          item.status = 'served';
        }
      });
      if (order.status !== 'billed') {
        order.status = 'served';
      }
    }

    if (isDbConnected) {
      await order.save();
    } else {
      order.updatedAt = now;
    }

    res.json({
      success: true,
      message: `Kitchen ticket status updated to ${kotStatus}`,
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

// 4. PUT /api/v1/kot/tickets/:id/items/:itemId/status
export const updateItemStatus = async (req, res, next) => {
  try {
    const validated = itemStatusSchema.parse(req.body);
    const { status } = validated;
    const isDbConnected = mongoose.connection.readyState === 1;

    let order = null;
    if (isDbConnected) {
      order = await Order.findById(req.params.id);
    } else {
      const memMap = getMemOrders();
      order = memMap.get(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const item = order.items.find(
      (i) => String(i._id) === req.params.itemId || String(i.menuItemId) === req.params.itemId
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in this ticket' });
    }

    item.status = status;
    if (status === 'preparing' && !item.kotPrintedAt) {
      item.kotPrintedAt = new Date();
    }

    // Recalculate parent ticket kotStatus
    const activeItems = order.items.filter((i) => i.status !== 'cancelled');
    if (activeItems.length > 0) {
      const allServed = activeItems.every((i) => i.status === 'served');
      const allReadyOrServed = activeItems.every((i) => i.status === 'ready' || i.status === 'served');
      const anyPreparing = activeItems.some((i) => i.status === 'preparing');

      if (allServed) {
        order.kotStatus = 'completed';
        if (order.status !== 'billed') order.status = 'served';
      } else if (allReadyOrServed) {
        order.kotStatus = 'ready';
      } else if (anyPreparing) {
        order.kotStatus = 'preparing';
        order.status = 'in-kitchen';
      }
    }

    if (isDbConnected) {
      await order.save();
    } else {
      order.updatedAt = new Date();
    }

    res.json({
      success: true,
      message: `Item ${item.name} status updated to ${status}`,
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

// 5. GET /api/v1/kot/summary
export const getKitchenSummary = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let activeOrders = [];

    if (isDbConnected) {
      activeOrders = await Order.find({
        status: { $ne: 'cancelled' },
        kotStatus: { $in: ['sent', 'preparing', 'ready'] },
      }).lean();
    } else {
      const memMap = getMemOrders();
      activeOrders = Array.from(memMap.values()).filter(
        (o) => o.status !== 'cancelled' && ['sent', 'preparing', 'ready'].includes(o.kotStatus)
      );
    }

    let preparingItems = 0;
    let readyItems = 0;
    let delayedTickets = 0;
    let totalMinutes = 0;
    const now = Date.now();

    activeOrders.forEach((order) => {
      const elapsed = Math.floor((now - new Date(order.createdAt).getTime()) / 60000);
      totalMinutes += elapsed;
      if (elapsed > 15) {
        delayedTickets++;
      }

      (order.items || []).forEach((item) => {
        if (item.status === 'preparing') preparingItems++;
        if (item.status === 'ready') readyItems++;
      });
    });

    const avgPrepTime =
      activeOrders.length > 0 ? Math.round(totalMinutes / activeOrders.length) : 8;

    res.json({
      success: true,
      data: {
        activeTickets: activeOrders.length,
        preparingItems,
        readyItems,
        delayedTickets,
        avgPrepTime,
      },
    });
  } catch (error) {
    next(error);
  }
};
