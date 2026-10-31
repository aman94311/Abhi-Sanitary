import Quotation from '../models/Quotation.js';
import mongoose from 'mongoose';

// @desc    Customer: submit a quotation request
// @route   POST /api/quotations
// @access  Public
export const createQuotation = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerType,
      projectLocation,
      requirementsNotes,
    } = req.body;

    if (!customerName || !customerPhone || !customerEmail || !requirementsNotes) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, email and required products list are mandatory',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    const quoteNumber = `QT-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    const quotation = await Quotation.create({
      quoteNumber,
      customerName,
      customerPhone,
      customerEmail,
      customerType,
      projectLocation,
      requirementsNotes,
    });

    res.status(201).json({
      success: true,
      data: quotation,
      message: 'Quotation request submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};