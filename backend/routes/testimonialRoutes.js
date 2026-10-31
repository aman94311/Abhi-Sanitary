import express from 'express';
import {
  getPublicTestimonials,
  adminGetTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
} from '../controllers/testimonialController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for homepage
router.get('/', getPublicTestimonials);

// Admin protected routes
router.get('/admin', protect, authorize('admin'), adminGetTestimonials);
router.post('/admin', protect, authorize('admin'), adminCreateTestimonial);
router.put('/admin/:id', protect, authorize('admin'), adminUpdateTestimonial);
router.delete('/admin/:id', protect, authorize('admin'), adminDeleteTestimonial);

export default router;
