import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import StockMovement from '../models/StockMovement.js';
import Quotation from '../models/Quotation.js';
import Coupon from '../models/Coupon.js';
import { mockProducts, mockCategories } from '../utils/mockData.js';
import mongoose from 'mongoose';

// In-memory runtime state for offline/fallback mode
let memoryProducts = [...mockProducts];
let memoryStockMovements = [
  {
    _id: 'sm_001',
    productName: 'Premium Interior Emulsion - Matt Finish',
    sku: 'AP-MATT-4L',
    previousStock: 18,
    changeQuantity: -3,
    updatedStock: 15,
    reason: 'Physical Shop Sale',
    referenceId: 'IN-STORE-BILL-1042',
    notes: 'Walk-in painter purchase in retail showroom',
    createdAt: new Date(Date.now() - 3600000 * 4),
  },
  {
    _id: 'sm_002',
    productName: 'Acrylic Wall Putty - 20 kg',
    sku: 'BW-PUTTY-20K',
    previousStock: 50,
    changeQuantity: 20,
    updatedStock: 70,
    reason: 'Restock / Purchase',
    referenceId: 'PO-BIRLA-8821',
    notes: 'Truck delivery received from distributor',
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
];

let memoryOrders = [
  {
    _id: 'ord_1001',
    orderNumber: 'ORD-2026-1001',
    user: { name: 'Rahul Sharma', email: 'customer@gmail.com', phone: '+91 98765 12345' },
    items: [
      {
        name: 'Premium Interior Emulsion - Matt Finish',
        variantName: '4 L',
        sku: 'AP-MATT-4L',
        price: 1899,
        quantity: 2,
        total: 3798,
      },
    ],
    shippingAddress: {
      fullName: 'Rahul Sharma',
      phone: '+91 98765 12345',
      addressLine1: 'Flat 402, Ganga Heights, Sigra',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221002',
    },
    paymentMethod: 'Razorpay',
    paymentStatus: 'Completed',
    subtotal: 3798,
    deliveryCharge: 0,
    finalAmount: 3798,
    orderStatus: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: 'ord_1002',
    orderNumber: 'ORD-2026-1002',
    user: { name: 'Amit Verma', email: 'amit.verma@gmail.com', phone: '+91 98111 22334' },
    items: [
      {
        name: 'Single-Lever Basin Mixer Tap',
        variantName: 'Chrome',
        sku: 'JAQ-MIX-CRM',
        price: 1650,
        quantity: 1,
        total: 1650,
      },
    ],
    shippingAddress: {
      fullName: 'Amit Verma',
      phone: '+91 98111 22334',
      addressLine1: 'B-14, Kabir Nagar Colony',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221005',
    },
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    subtotal: 1650,
    deliveryCharge: 99,
    finalAmount: 1749,
    orderStatus: 'Processing',
    createdAt: new Date(Date.now() - 3600000 * 8),
  },
];

// @desc    Get Admin Dashboard KPI metrics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [totalProducts, totalOrders, totalCustomers, lowStockCount] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Order.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Product.countDocuments({ stockQuantity: { $lte: 10 } }),
      ]);

      const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
      const totalRevenue = (await Order.find({ paymentStatus: 'Completed' })).reduce(
        (sum, ord) => sum + (ord.finalAmount || 0),
        0
      );

      const pendingOrdersCount = await Order.countDocuments({
        orderStatus: { $in: ['Pending Payment', 'Confirmed', 'Processing'] },
      });

      return res.status(200).json({
        success: true,
        stats: {
          totalProducts,
          totalOrders,
          totalCustomers,
          totalRevenue,
          pendingOrders: pendingOrdersCount,
          lowStockProducts: lowStockCount,
        },
        recentOrders: orders,
      });
    }

    // Fallback KPI data
    const totalRev = memoryOrders
      .filter(o => o.paymentStatus === 'Completed')
      .reduce((sum, o) => sum + o.finalAmount, 0);

    const lowStock = memoryProducts.filter(p => p.stockQuantity <= 15).length;

    res.status(200).json({
      success: true,
      stats: {
        totalProducts: memoryProducts.length,
        totalOrders: memoryOrders.length,
        totalCustomers: 24,
        totalRevenue: totalRev || 184500,
        pendingOrders: memoryOrders.filter(o => o.orderStatus !== 'Delivered').length,
        lowStockProducts: lowStock,
      },
      recentOrders: memoryOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all products (with pagination and filters)
// @route   GET /api/admin/products
// @access  Private/Admin
export const adminGetProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: products.length, data: products });
    }

    res.status(200).json({ success: true, count: memoryProducts.length, data: memoryProducts });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create product
// @route   POST /api/admin/products
// @access  Private/Admin
export const adminCreateProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    if (!productData.name || !productData.categorySlug || !productData.regularPrice || !productData.sku) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, Regular Price, and SKU are required fields',
      });
    }

    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    productData.slug = slug;

    if (mongoose.connection.readyState === 1) {
      // Category slug se Category dhoondo, na mile to bana do
      const catSlug = productData.categorySlug.toLowerCase();

      let categoryDoc = await Category.findOne({ slug: catSlug });
      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: catSlug.charAt(0).toUpperCase() + catSlug.slice(1),
          slug: catSlug,
        });
      }
      productData.category = categoryDoc._id;

      const product = await Product.create(productData);
      return res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    }

    const newProduct = {
      _id: 'prod_' + Date.now(),
      ...productData,
      slug,
      images: productData.images?.length > 0 ? productData.images : [{ url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800', isPrimary: true }],
      stockQuantity: Number(productData.stockQuantity) || 10,
      regularPrice: Number(productData.regularPrice),
      discountPrice: Number(productData.discountPrice) || 0,
      createdAt: new Date(),
    };

    memoryProducts.unshift(newProduct);
    res.status(201).json({ success: true, data: newProduct, message: 'Product added successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const adminUpdateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
    }

    const index = memoryProducts.findIndex(p => p._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    memoryProducts[index] = { ...memoryProducts[index], ...req.body, updatedAt: new Date() };
    res.status(200).json({ success: true, data: memoryProducts[index], message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const adminDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }

    memoryProducts = memoryProducts.filter(p => p._id !== id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Adjust physical shop stock (Inventory Sync)
// @route   POST /api/admin/inventory/adjust-stock
// @access  Private/Admin
export const adminAdjustStock = async (req, res, next) => {
  try {
    const { productId, variantId, changeQuantity, reason, notes, referenceId } = req.body;

    if (!productId || changeQuantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Change Quantity, and Reason are required for stock adjustment',
      });
    }

    const qty = Number(changeQuantity);

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      let prevStock = product.stockQuantity;
      let newStock = prevStock + qty;

      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce stock below 0. Current stock is ${prevStock}`,
        });
      }

      product.stockQuantity = newStock;
      await product.save();

      const movement = await StockMovement.create({
        product: product._id,
        variantId: variantId || null,
        productName: product.name,
        sku: product.sku,
        previousStock: prevStock,
        changeQuantity: qty,
        updatedStock: newStock,
        reason,
        referenceId: referenceId || '',
        notes: notes || '',
        performedBy: req.user?._id || null,
      });

      return res.status(200).json({
        success: true,
        message: `Stock updated successfully. New stock: ${newStock}`,
        data: movement,
      });
    }

    const targetProduct = memoryProducts.find(p => p._id === productId);
    if (!targetProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prev = targetProduct.stockQuantity;
    const updated = prev + qty;

    if (updated < 0) {
      return res.status(400).json({ success: false, message: `Cannot reduce stock below 0. Current: ${prev}` });
    }

    targetProduct.stockQuantity = updated;

    const newMovement = {
      _id: 'sm_' + Date.now(),
      productName: targetProduct.name,
      sku: targetProduct.sku,
      previousStock: prev,
      changeQuantity: qty,
      updatedStock: updated,
      reason,
      referenceId: referenceId || 'STORE-ADJUST',
      notes: notes || '',
      createdAt: new Date(),
    };

    memoryStockMovements.unshift(newMovement);

    res.status(200).json({
      success: true,
      message: `Stock adjusted successfully. New stock: ${updated}`,
      data: newMovement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get stock movement audit trail
// @route   GET /api/admin/inventory/movements
// @access  Private/Admin
export const adminGetStockMovements = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const movements = await StockMovement.find().sort({ createdAt: -1 }).limit(50);
      return res.status(200).json({ success: true, count: movements.length, data: movements });
    }

    res.status(200).json({ success: true, count: memoryStockMovements.length, data: memoryStockMovements });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const adminGetOrders = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    }

    res.status(200).json({ success: true, count: memoryOrders.length, data: memoryOrders });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, notes } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ success: false, message: 'Order status is required' });
    }

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        comment: notes || `Status updated to ${orderStatus} by store admin`,
        changedAt: new Date(),
      });
      await order.save();

      return res.status(200).json({ success: true, data: order, message: `Order status updated to ${orderStatus}` });
    }

    const order = memoryOrders.find(o => o._id === id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = orderStatus;
    res.status(200).json({ success: true, data: order, message: `Order status updated to ${orderStatus}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Bulk CSV import products
// @route   POST /api/admin/products/bulk-upload
// @access  Private/Admin
export const adminBulkUploadProducts = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No product rows provided in CSV payload' });
    }

    const results = {
      totalRows: products.length,
      importedCount: 0,
      failedRows: [],
    };

    const toSlug = s =>
      String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const DEFAULT_IMG = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800';
    const dbReady = mongoose.connection.readyState === 1;

    // ---------- Step 1: har row ko validate aur clean karo ----------
    const cleaned = [];
    const seenSkus = new Set();

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      const rowNum = i + 1;
      const fail = reason =>
        results.failedRows.push({ row: rowNum, sku: row.sku || 'N/A', reason });

      if (!row.name || !row.sku || !row.regularPrice || !row.categorySlug) {
        fail('Missing required field: name, sku, regularPrice, or categorySlug');
        continue;
      }

      const catSlug = String(row.categorySlug).trim().toLowerCase();
      if (!['paints', 'sanitary'].includes(catSlug)) {
        fail(`categorySlug must be "paints" or "sanitary" (got "${row.categorySlug}")`);
        continue;
      }

      const regularPrice = Number(row.regularPrice);
      const discountPrice = Number(row.discountPrice) || 0;
      if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
        fail('regularPrice must be a number greater than 0');
        continue;
      }
      if (discountPrice < 0 || discountPrice > regularPrice) {
        fail('discountPrice must be between 0 and regularPrice');
        continue;
      }

      const sku = String(row.sku).trim().toUpperCase();
      if (seenSkus.has(sku)) {
        fail(`Duplicate SKU '${sku}' inside the CSV`);
        continue;
      }
      seenSkus.add(sku);

      const stock = Number(row.stockQuantity);
      const subcategory = (row.subcategory || 'General').trim();

      cleaned.push({
        rowNum,
        name: String(row.name).trim(),
        slug: toSlug(row.name),
        categorySlug: catSlug,
        subcategory,
        subcategorySlug: toSlug(subcategory),
        brand: (row.brand || 'Generic').trim(),
        description: row.description || `Quality ${row.name} for home and construction.`,
        images: [{ url: row.imageUrl || DEFAULT_IMG, isPrimary: true }],
        regularPrice,
        discountPrice,
        stockQuantity: Number.isFinite(stock) && stock >= 0 ? stock : 0,
        sku,
        hasVariants: false,
        isActive: true,
      });
    }

    // ---------- Step 2: Offline (memory) mode ----------
    if (!dbReady) {
      for (const p of cleaned) {
        if (memoryProducts.some(m => m.sku === p.sku)) {
          results.failedRows.push({ row: p.rowNum, sku: p.sku, reason: `Duplicate SKU '${p.sku}' found` });
          continue;
        }
        const { rowNum, ...data } = p;
        memoryProducts.unshift({
          ...data,
          _id: 'prod_' + Date.now() + '_' + rowNum,
          ratingsAverage: 0,
          ratingsCount: 0,
          createdAt: new Date(),
        });
        results.importedCount++;
      }

      return res.status(200).json({
        success: true,
        message: `Import completed: ${results.importedCount} products added, ${results.failedRows.length} rows failed.`,
        summary: results,
      });
    }

    // ---------- Step 3: Database mode ----------

    // Database me pehle se maujood SKU aur slug ek hi query me nikaalo
    const existing = await Product.find({
      $or: [
        { sku: { $in: cleaned.map(p => p.sku) } },
        { slug: { $in: cleaned.map(p => p.slug) } },
      ],
    }).select('sku slug');
    const usedSkus = new Set(existing.map(p => p.sku));
    const usedSlugs = new Set(existing.map(p => p.slug));

    // Category cache: "paints" / "sanitary" ka document ek baar dhoondo, na mile to bana do
    const categoryCache = new Map();
    const getCategoryId = async catSlug => {
      if (categoryCache.has(catSlug)) return categoryCache.get(catSlug);

      let doc = await Category.findOne({ slug: catSlug });
      if (!doc) {
        doc = await Category.create({
          name: catSlug.charAt(0).toUpperCase() + catSlug.slice(1),
          slug: catSlug,
        });
      }
      categoryCache.set(catSlug, doc._id);
      return doc._id;
    };

    // Ek-ek row save karo, taaki ek fail ho to baaki ruk na jayein
    for (const p of cleaned) {
      try {
        if (usedSkus.has(p.sku)) {
          results.failedRows.push({
            row: p.rowNum,
            sku: p.sku,
            reason: `Duplicate SKU '${p.sku}' already exists in database`,
          });
          continue;
        }

        // Slug unique rakhna hai: same naam ho to sku jod do
        let slug = p.slug;
        if (usedSlugs.has(slug)) slug = `${slug}-${toSlug(p.sku)}`;
        if (usedSlugs.has(slug)) slug = `${slug}-${Date.now().toString(36)}`;

        const category = await getCategoryId(p.categorySlug);
        const { rowNum, ...data } = p;

        await Product.create({ ...data, slug, category });

        usedSkus.add(p.sku);
        usedSlugs.add(slug);
        results.importedCount++;
      } catch (err) {
        results.failedRows.push({
          row: p.rowNum,
          sku: p.sku,
          reason: err.message || 'Could not save this product',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Import completed: ${results.importedCount} products added, ${results.failedRows.length} rows failed.`,
      summary: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all quotations
// @route   GET /api/admin/quotations
// @access  Private/Admin
export const adminGetQuotations = async (req, res, next) => {
  try {
    const quotes = await Quotation.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Set quoted price / status
// @route   PUT /api/admin/quotations/:id
// @access  Private/Admin
export const adminUpdateQuotation = async (req, res, next) => {
  try {
    const { totalQuotedPrice, status, adminNotes } = req.body;

    const update = {};
    if (totalQuotedPrice !== undefined) {
      update.totalQuotedPrice = Number(String(totalQuotedPrice).replace(/,/g, '')) || 0;
      update.status = status || 'Quoted';
    } else if (status) {
      update.status = status;
    }
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const quote = await Quotation.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });

    res.status(200).json({ success: true, data: quote, message: 'Quotation updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Download full order history as CSV
// @route   GET /api/admin/orders/export
// @access  Private/Admin
export const adminExportOrdersCsv = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    const userIds = [
      ...new Set(orders.map(o => String(o.user)).filter(id => mongoose.Types.ObjectId.isValid(id))),
    ];
    const users = await User.find({ _id: { $in: userIds } }).select('name email phone').lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const esc = v => {
      let s = v === undefined || v === null ? '' : String(v);
      if (/^[=+\-@]/.test(s)) s = "'" + s; // Excel formula injection se bachav
      return `"${s.replace(/"/g, '""')}"`;
    };

    const fmt = d => (d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '');

    const headers = [
      'Order Number', 'Date & Time', 'Order Status', 'Payment Method', 'Payment Status',
      'Customer Name', 'Customer Email', 'Customer Phone',
      'Ship To Name', 'Ship To Phone', 'Address', 'City', 'State', 'Pincode',
      'Item Name', 'Variant', 'SKU', 'Unit Price', 'Quantity', 'Item Total',
      'Order Subtotal', 'Delivery Charge', 'Discount', 'Final Amount', 'Notes',
    ];

    const rows = [headers.map(esc).join(',')];

    for (const o of orders) {
      const u = userMap.get(String(o.user)) || {};
      const a = o.shippingAddress || {};
      const address = [a.addressLine1, a.addressLine2, a.landmark].filter(Boolean).join(', ');
      const items = o.items && o.items.length ? o.items : [{}];

      for (const it of items) {
        rows.push(
          [
            o.orderNumber, fmt(o.createdAt), o.orderStatus, o.paymentMethod, o.paymentStatus,
            u.name, u.email, u.phone,
            a.fullName, a.phone, address, a.city, a.state, a.pincode,
            it.name, it.variantName, it.sku, it.price, it.quantity, it.total,
            o.subtotal, o.deliveryCharge, o.discountAmount, o.finalAmount, o.notes,
          ]
            .map(esc)
            .join(',')
        );
      }
    }

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders-history-${stamp}.csv"`);
    res.send('\uFEFF' + rows.join('\n')); // BOM: Excel mein ₹ sahi dikhe
  } catch (error) {
    next(error);
  }
};