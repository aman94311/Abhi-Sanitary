import mongoose from 'mongoose';
import Category from '../models/Category.js';
import ShopSettings from '../models/ShopSettings.js';
import { mockCategories, mockShopSettings } from '../utils/mockData.js';

// @desc    Get all active categories with subcategories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
      if (categories.length > 0) {
        return res.status(200).json({
          success: true,
          count: categories.length,
          data: categories,
        });
      }
    }

    // Fallback if MongoDB is not connected yet
    res.status(200).json({
      success: true,
      count: mockCategories.length,
      data: mockCategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const category = await Category.findOne({ slug, isActive: true });
      if (category) {
        return res.status(200).json({ success: true, data: category });
      }
    }

    const fallback = mockCategories.find(c => c.slug === slug);
    if (!fallback) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: fallback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public shop settings (phone, address, delivery policy)
// @route   GET /api/settings
// @access  Public
export const getPublicSettings = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const settings = await ShopSettings.findOne();
      if (settings) {
        return res.status(200).json({ success: true, data: settings });
      }
    }

    res.status(200).json({ success: true, data: mockShopSettings });
  } catch (error) {
    next(error);
  }
};
