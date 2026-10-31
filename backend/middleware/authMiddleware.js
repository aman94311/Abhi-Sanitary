import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verifies JWT from cookie or Authorization header
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in cookies or Bearer Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login first.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'abhi_sanitary_secret_jwt_key_2026_super_secure'
    );

    // Attach user to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      // If user is from fallback admin/mock
      if (decoded.role === 'admin') {
        req.user = {
          _id: decoded.id,
          name: decoded.name || 'Store Admin',
          email: decoded.email,
          role: 'admin',
        };
      } else {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact store support.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please login again.',
    });
  }
};

// Grant access to specific roles (e.g., 'admin')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
