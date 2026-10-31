import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Helper to sign JWT and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'abhi_sanitary_secret_jwt_key_2026_super_secure',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + (Number(process.env.COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
      },
    });
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name, email and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please login.',
        });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || '',
        role: 'customer',
      });

      return sendTokenResponse(user, 201, res);
    }

    // Temporary fallback customer session if DB is not connected
    const fallbackUser = {
      _id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      role: 'customer',
    };
    sendTokenResponse(fallbackUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Customer / Admin)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your email address and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check database if connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact store support.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      return sendTokenResponse(user, 200, res);
    }

    // Fallback authentication for offline/local development without DB running
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@abhisanitary.com').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'Admin@Abhi2026!';

    if (cleanEmail === adminEmail && password === adminPass) {
      const adminUser = {
        _id: 'admin_master_001',
        name: process.env.ADMIN_NAME || 'Store Admin',
        email: adminEmail,
        role: 'admin',
        phone: process.env.SHOP_PHONE || '+91 98765 43210',
      };
      return sendTokenResponse(adminUser, 200, res);
    }

    // Demo customer fallback
    if (cleanEmail === 'customer@gmail.com' && password === 'Customer@123') {
      const demoCustomer = {
        _id: 'cust_demo_001',
        name: 'Rahul Sharma',
        email: 'customer@gmail.com',
        role: 'customer',
        phone: '+91 98765 12345',
      };
      return sendTokenResponse(demoCustomer, 200, res);
    }

    res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user and clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
