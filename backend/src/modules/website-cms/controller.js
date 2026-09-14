import mongoose from 'mongoose';
import { Category } from '../../models/Category.js';
import { MenuItem } from '../../models/MenuItem.js';
import { Reservation } from '../../models/Reservation.js';
import { reservationSchema, inquirySchema } from './validation.js';
import {
  seedInitialMenu,
  defaultCategoriesData,
  defaultMenuItemsData,
} from '../../seeds/menuSeed.js';

/**
 * GET /api/v1/website-cms/menu
 * Returns active categories with their available menu items
 */
export const getPublicMenu = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { category, vegOnly } = req.query;

    if (isDbConnected) {
      const categoryCount = await Category.countDocuments();
      if (categoryCount === 0) {
        await seedInitialMenu();
      }

      const categoryQuery = { isActive: true };
      if (category) {
        categoryQuery.slug = category;
      }

      const categories = await Category.find(categoryQuery).sort({ displayOrder: 1 }).lean();

      const itemQuery = { isAvailable: true };
      if (vegOnly === 'true') {
        itemQuery.isVegetarian = true;
      }

      const allItems = await MenuItem.find(itemQuery).lean();

      const formattedMenu = categories.map((cat) => {
        const items = allItems.filter((item) => String(item.categoryId) === String(cat._id));
        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          displayOrder: cat.displayOrder,
          items,
        };
      });

      return res.status(200).json({
        success: true,
        count: formattedMenu.length,
        data: formattedMenu,
      });
    }

    // Fallback: If DB is disconnected (e.g. testing / offline dev), serve high-fidelity static seed data
    let categories = defaultCategoriesData.map((c, idx) => ({
      _id: `cat-00${idx + 1}`,
      ...c,
    }));

    if (category) {
      categories = categories.filter((c) => c.slug === category);
    }

    let items = defaultMenuItemsData;
    if (vegOnly === 'true') {
      items = items.filter((i) => i.isVegetarian);
    }

    const formattedMenu = categories.map((cat) => {
      const catItems = items.filter((item) => item.categorySlug === cat.slug);
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
        items: catItems,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMenu.length,
      data: formattedMenu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/website-cms/reservations
 * Submits a new table reservation request with validation
 */
export const createReservation = async (req, res, next) => {
  try {
    const parseResult = reservationSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors,
      });
    }

    const { name, phone, email, date, time, guestCount, specialRequests } = parseResult.data;
    const isDbConnected = mongoose.connection.readyState === 1;

    let reservationId = new mongoose.Types.ObjectId();
    if (isDbConnected) {
      const newReservation = await Reservation.create({
        name,
        phone,
        email: email || '',
        date,
        time,
        guestCount,
        specialRequests: specialRequests || '',
        status: 'Pending',
      });
      reservationId = newReservation._id;
    }

    return res.status(201).json({
      success: true,
      message: 'Your table reservation request has been submitted. Our team will contact you shortly to confirm!',
      data: {
        reservationId,
        name,
        date,
        time,
        guestCount,
        status: 'Pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/website-cms/inquiries
 * Submits an event or general contact inquiry
 */
export const createInquiry = async (req, res, next) => {
  try {
    const parseResult = inquirySchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting Raahi Café! We have received your message and will respond promptly.',
      data: parseResult.data,
    });
  } catch (error) {
    next(error);
  }
};
