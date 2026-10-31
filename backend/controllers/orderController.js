import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const isValidId = id => mongoose.Types.ObjectId.isValid(id);

// @route   POST /api/orders   (Private, COD)
export const createOrder = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }
    if (!isValidId(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Please login with a customer account to place an order.',
      });
    }

    const { items, shippingAddress, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const a = shippingAddress || {};
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    for (const f of required) {
      if (!a[f] || !String(a[f]).trim()) {
        return res.status(400).json({ success: false, message: `Shipping address: ${f} is required` });
      }
    }
    if (String(a.phone).replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10 digit phone number' });
    }
    if (!/^\d{6}$/.test(String(a.pincode).trim())) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6 digit pincode' });
    }

    // Prices always come from DB, never from frontend
    const productCache = new Map();
    const reserved = new Map();
    const orderItems = [];
    const stockUpdates = [];

    for (const it of items) {
      const qty = Math.floor(Number(it.quantity));
      if (!qty || qty < 1) {
        return res.status(400).json({ success: false, message: 'Invalid item quantity' });
      }
      if (!isValidId(it.productId)) {
        return res.status(400).json({
          success: false,
          message: 'A product in your cart is invalid. Please remove it and add it again.',
        });
      }

      let product = productCache.get(String(it.productId));
      if (!product) {
        product = await Product.findById(it.productId);
        if (product) productCache.set(String(it.productId), product);
      }
      if (!product || product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'A product in your cart is no longer available. Please remove it.',
        });
      }

      let price, sku, available, variant = null, variantName = '';

      if (it.variantId) {
        variant = product.variants.find(
          v => String(v._id) === String(it.variantId) || v.sku === it.variantId
        );
        if (!variant || variant.isActive === false) {
          return res.status(400).json({
            success: false,
            message: `Selected variant of "${product.name}" is not available`,
          });
        }
        price = variant.discountPrice > 0 ? variant.discountPrice : variant.regularPrice;
        sku = variant.sku;
        variantName = variant.name;
        available = variant.stockQuantity;
      } else {
        price = product.discountPrice > 0 ? product.discountPrice : product.regularPrice;
        sku = product.sku;
        available = product.stockQuantity;
      }

      const key = `${product._id}:${variant ? variant._id : 'base'}`;
      const already = reserved.get(key) || 0;
      if (qty + already > available) {
        return res.status(400).json({
          success: false,
          message: `Only ${available} left in stock for "${product.name}"${variantName ? ` (${variantName})` : ''}`,
        });
      }
      reserved.set(key, already + qty);

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url || '',
        variantName,
        sku,
        price,
        quantity: qty,
        total: price * qty,
      });
      stockUpdates.push({ productId: product._id, variantId: variant?._id || null, qty });
    }

    const deliveryFee = Number(process.env.DEFAULT_DELIVERY_CHARGE ?? 99);
    const freeThreshold = Number(process.env.FREE_DELIVERY_THRESHOLD ?? 999);

    const subtotal = orderItems.reduce((s, i) => s + i.total, 0);
    const deliveryCharge = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : deliveryFee;
    const finalAmount = subtotal + deliveryCharge;

    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now()
      .toString(36)
      .toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: a.fullName.trim(),
        phone: String(a.phone).trim(),
        alternatePhone: a.alternatePhone || '',
        addressLine1: a.addressLine1.trim(),
        addressLine2: a.addressLine2 || '',
        landmark: a.landmark || '',
        city: a.city.trim(),
        state: a.state.trim(),
        pincode: String(a.pincode).trim(),
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      subtotal,
      deliveryCharge,
      finalAmount,
      orderStatus: 'Confirmed',
      notes: notes || '',
      statusHistory: [
        { status: 'Confirmed', comment: 'Order placed (Cash on Delivery)', changedAt: new Date() },
      ],
    });

    // Reduce stock
    for (const u of stockUpdates) {
      if (u.variantId) {
        await Product.updateOne(
          { _id: u.productId, 'variants._id': u.variantId },
          { $inc: { 'variants.$.stockQuantity': -u.qty } }
        );
      } else {
        await Product.updateOne({ _id: u.productId }, { $inc: { stockQuantity: -u.qty } });
      }
    }

    res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/my
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/:id   (owner or admin)
export const getOrderById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isOwner = String(order.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed to view this order' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};