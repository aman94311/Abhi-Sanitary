import express from 'express';
import {
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  getProducts,
  getProductBySlug,
  getSearchSuggestions,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

export default router;
