import express from 'express';
import {
  getDashboardStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminAdjustStock,
  adminGetStockMovements,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminBulkUploadProducts,
  adminGetQuotations,
  adminUpdateQuotation,
  adminExportOrdersCsv,
} from '../controllers/adminController.js';
import { toggleFeatured } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getNextInvoiceNumber } from '../controllers/invoiceController.js';
const router = express.Router();

// All routes in this router are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/orders/export', adminExportOrdersCsv);

// Product CRUD
router.get('/products', adminGetProducts);
router.post('/products', adminCreateProduct);
router.put('/products/:id', adminUpdateProduct);
router.patch('/products/:id/featured', toggleFeatured);
router.delete('/products/:id', adminDeleteProduct);

// Quotations
router.get('/quotations', adminGetQuotations);
router.put('/quotations/:id', adminUpdateQuotation);

// Inventory sync (Online + Physical Shop sales adjustment)
router.post('/inventory/adjust-stock', adminAdjustStock);
router.get('/inventory/movements', adminGetStockMovements);

// Orders
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', adminUpdateOrderStatus);

// Bulk CSV upload
router.post('/products/bulk-upload', adminBulkUploadProducts);

// Invoice number generator
router.post('/invoices/next-number', getNextInvoiceNumber);

export default router;