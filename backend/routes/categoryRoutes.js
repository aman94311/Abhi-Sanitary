import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getPublicSettings,
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/settings/shop', getPublicSettings);
router.get('/:slug', getCategoryBySlug);

export default router;
