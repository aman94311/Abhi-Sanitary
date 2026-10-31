import express from 'express';
import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder); // COD
router.post('/razorpay/create', createRazorpayOrder); // Online step 1
router.post('/razorpay/verify', verifyRazorpayPayment); // Online step 2
router.get('/my', getMyOrders); // /my pehle, /:id baad mein
router.get('/:id', getOrderById);

export default router;