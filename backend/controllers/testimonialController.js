import mongoose from 'mongoose';
import Testimonial from '../models/Testimonial.js';

let memoryTestimonials = [
  {
    _id: 'testi_001',
    name: 'Suresh Singhania',
    role: 'Civil Contractor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    comment: 'Been buying Asian Paints and Jaquar bath fittings from Abhi Paints for over 5 years. Having this online platform makes ordering 20L paint buckets and PVC pipes directly to our site incredibly fast.',
    projectType: 'Commercial Apartment Complex',
    isActive: true,
    sortOrder: 1,
  },
  {
    _id: 'testi_002',
    name: 'Vikram Joshi',
    role: 'Professional Painter & Decorator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    comment: '100% genuine factory-sealed containers. Unlike other stores, they never sell diluted or old stock paint. Their color consistency on Asian Paints Royale Matt is flawless.',
    projectType: 'Luxury Villa Interior Painting',
    isActive: true,
    sortOrder: 2,
  },
  {
    _id: 'testi_003',
    name: 'Dr. Anita Mishra',
    role: 'Homeowner, Cantt',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    comment: 'Ordered ceramic vessel wash basins and rain shower heads for both our bathrooms. Delivery was super prompt and undamaged with original warranty cards included!',
    projectType: 'Full Bathroom Remodel',
    isActive: true,
    sortOrder: 3,
  },
];

// @desc    Get active testimonials for public homepage
// @route   GET /api/testimonials
// @access  Public
export const getPublicTestimonials = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const testimonials = await Testimonial.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
      if (testimonials.length > 0) {
        return res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
      }
    }

    const active = memoryTestimonials.filter(t => t.isActive);
    res.status(200).json({ success: true, count: active.length, data: active });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all testimonials
// @route   GET /api/admin/testimonials
// @access  Private/Admin
export const adminGetTestimonials = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const testimonials = await Testimonial.find().sort({ sortOrder: 1, createdAt: -1 });
      return res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
    }

    res.status(200).json({ success: true, count: memoryTestimonials.length, data: memoryTestimonials });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new feedback slide
// @route   POST /api/admin/testimonials
// @access  Private/Admin
export const adminCreateTestimonial = async (req, res, next) => {
  try {
    const { name, role, rating, comment, projectType, isActive, avatar } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ success: false, message: 'Name and feedback comment are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const testimonial = await Testimonial.create({
        name,
        role: role || 'Verified Customer',
        rating: Number(rating) || 5,
        comment,
        projectType: projectType || 'Home Project',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        isActive: isActive !== false,
      });
      return res.status(201).json({ success: true, data: testimonial, message: 'Feedback slide added!' });
    }

    const newTestimonial = {
      _id: 'testi_' + Date.now(),
      name,
      role: role || 'Verified Customer',
      rating: Number(rating) || 5,
      comment,
      projectType: projectType || 'Home Project',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      isActive: isActive !== false,
      sortOrder: memoryTestimonials.length + 1,
    };

    memoryTestimonials.push(newTestimonial);
    res.status(201).json({ success: true, data: newTestimonial, message: 'Feedback slide added!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update / toggle feedback slide
// @route   PUT /api/admin/testimonials/:id
// @access  Private/Admin
export const adminUpdateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!testimonial) return res.status(404).json({ success: false, message: 'Feedback slide not found' });
      return res.status(200).json({ success: true, data: testimonial, message: 'Feedback slide updated!' });
    }

    const index = memoryTestimonials.findIndex(t => t._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Feedback slide not found' });
    }

    memoryTestimonials[index] = { ...memoryTestimonials[index], ...req.body };
    res.status(200).json({ success: true, data: memoryTestimonials[index], message: 'Feedback slide updated!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete feedback slide
// @route   DELETE /api/admin/testimonials/:id
// @access  Private/Admin
export const adminDeleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Testimonial.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Feedback slide deleted' });
    }

    memoryTestimonials = memoryTestimonials.filter(t => t._id !== id);
    res.status(200).json({ success: true, message: 'Feedback slide deleted' });
  } catch (error) {
    next(error);
  }
};
