import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { getRazorpay } from '../config/razorpay.js';

const isValidId = id => mongoose.Types.ObjectId.isValid(id);

class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const handleError = (error, res, next) => {
  if (error instanceof OrderError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  // Razorpay API error
  if (error?.statusCode && error?.error?.description) {
    return res
      .status(502)
      .json({ success: false, message: `Payment gateway error: ${error.error.description}` });
  }
  next(error);
};

const assertReady = req => {
  if (mongoose.connection.readyState !== 1) {
    throw new OrderError('Database not connected', 503);
  }
  if (!isValidId(req.user._id)) {
    throw new OrderError('Please login with a customer account to place an order.');
  }
};

const makeOrderNumber = () =>
  `ORD-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}${Math.floor(
    Math.random() * 90 + 10
  )}`;

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// ---------------------------------------------------------------
// Cart + address validate karta hai. Prices/stock hamesha DB se.
// COD aur Razorpay dono yahi use karte hain.
// ---------------------------------------------------------------
const prepareOrder = async body => {
  const { items, shippingAddress } = body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError('Your cart is empty');
  }

  const a = shippingAddress || {};
  const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  for (const f of required) {
    if (!a[f] || !String(a[f]).trim()) {
      throw new OrderError(`Shipping address: ${f} is required`);
    }
  }
  if (String(a.phone).replace(/\D/g, '').length < 10) {
    throw new OrderError('Enter a valid 10 digit phone number');
  }
  if (!/^\d{6}$/.test(String(a.pincode).trim())) {
    throw new OrderError('Enter a valid 6 digit pincode');
  }

  const productCache = new Map();
  const reserved = new Map();
  const orderItems = [];

  for (const it of items) {
    const qty = Math.floor(Number(it.quantity));
    if (!qty || qty < 1) throw new OrderError('Invalid item quantity');
    if (!isValidId(it.productId)) {
      throw new OrderError('A product in your cart is invalid. Please remove it and add it again.');
    }

    let product = productCache.get(String(it.productId));
    if (!product) {
      product = await Product.findById(it.productId);
      if (product) productCache.set(String(it.productId), product);
    }
    if (!product || product.isActive === false) {
      throw new OrderError('A product in your cart is no longer available. Please remove it.');
    }

    let price, sku, available, variant = null, variantName = '';

    if (it.variantId) {
      variant = product.variants.find(
        v => String(v._id) === String(it.variantId) || v.sku === it.variantId
      );
      if (!variant || variant.isActive === false) {
        throw new OrderError(`Selected variant of "${product.name}" is not available`);
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
      throw new OrderError(
        `Only ${available} left in stock for "${product.name}"${variantName ? ` (${variantName})` : ''}`
      );
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
  }

  const deliveryFee = Number(process.env.DEFAULT_DELIVERY_CHARGE ?? 99);
  const freeThreshold = Number(process.env.FREE_DELIVERY_THRESHOLD ?? 999);

  const subtotal = orderItems.reduce((s, i) => s + i.total, 0);
  const deliveryCharge = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : deliveryFee;
  const finalAmount = subtotal + deliveryCharge;

  const address = {
    fullName: a.fullName.trim(),
    phone: String(a.phone).trim(),
    alternatePhone: a.alternatePhone || '',
    addressLine1: a.addressLine1.trim(),
    addressLine2: a.addressLine2 || '',
    landmark: a.landmark || '',
    city: a.city.trim(),
    state: a.state.trim(),
    pincode: String(a.pincode).trim(),
  };

  return { orderItems, address, subtotal, deliveryCharge, finalAmount };
};

// Order ke items ke hisaab se stock ghatao (variant SKU se, warna base product)
const reduceStock = async items => {
  for (const it of items) {
    const r = await Product.updateOne(
      { _id: it.product, 'variants.sku': it.sku },
      { $inc: { 'variants.$.stockQuantity': -it.quantity } }
    );
    if (r.matchedCount === 0) {
      await Product.updateOne({ _id: it.product }, { $inc: { stockQuantity: -it.quantity } });
    }
  }
};

// Order ko "paid" mark karta hai. Verify API aur webhook dono yahi call
// karte hain; atomic filter ki wajah se stock sirf ek baar hi ghatta hai.
const markOrderPaid = async (orderId, paymentId, signature = '') => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: { $ne: 'Completed' } },
    {
      $set: {
        paymentStatus: 'Completed',
        orderStatus: 'Confirmed',
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      },
      $push: {
        statusHistory: {
          status: 'Confirmed',
          comment: 'Payment received via Razorpay',
          changedAt: new Date(),
        },
      },
    },
    { new: true }
  );
  if (order) await reduceStock(order.items);
  return order; // null matlab pehle hi paid ho chuka tha
};

// ===============================================================
// POST /api/orders   (Private, Cash on Delivery)
// ===============================================================
export const createOrder = async (req, res, next) => {
  try {
    assertReady(req);
    const d = await prepareOrder(req.body);

    const order = await Order.create({
      orderNumber: makeOrderNumber(),
      user: req.user._id,
      items: d.orderItems,
      shippingAddress: d.address,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      subtotal: d.subtotal,
      deliveryCharge: d.deliveryCharge,
      finalAmount: d.finalAmount,
      orderStatus: 'Confirmed',
      notes: req.body.notes || '',
      statusHistory: [
        { status: 'Confirmed', comment: 'Order placed (Cash on Delivery)', changedAt: new Date() },
      ],
    });

    await reduceStock(order.items);

    res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
  } catch (error) {
    handleError(error, res, next);
  }
};

// ===============================================================
// POST /api/orders/razorpay/create   (Private)
// Step 1 of online payment
// ===============================================================
export const createRazorpayOrder = async (req, res, next) => {
  try {
    assertReady(req);
    const d = await prepareOrder(req.body);

    const orderNumber = makeOrderNumber();

    const rpOrder = await getRazorpay().orders.create({
      amount: Math.round(d.finalAmount * 100), // paise mein
      currency: 'INR',
      receipt: orderNumber,
    });

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: d.orderItems,
      shippingAddress: d.address,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Pending',
      razorpayOrderId: rpOrder.id,
      subtotal: d.subtotal,
      deliveryCharge: d.deliveryCharge,
      finalAmount: d.finalAmount,
      orderStatus: 'Pending Payment',
      notes: req.body.notes || '',
      statusHistory: [
        { status: 'Pending Payment', comment: 'Waiting for online payment', changedAt: new Date() },
      ],
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        razorpayOrderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID, // public key, frontend ke liye safe
      },
    });
  } catch (error) {
    handleError(error, res, next);
  }
};

// ===============================================================
// POST /api/orders/razorpay/verify   (Private)
// Step 2: payment ke baad signature check
// ===============================================================
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    assertReady(req);
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!isValidId(orderId) || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new OrderError('Invalid payment details');
    }

    const order = await Order.findById(orderId);
    if (
      !order ||
      String(order.user) !== String(req.user._id) ||
      order.paymentMethod !== 'Razorpay' ||
      order.razorpayOrderId !== razorpay_order_id
    ) {
      throw new OrderError('Order not found', 404);
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeEqual(expected, razorpay_signature)) {
      await Order.updateOne(
        { _id: order._id, paymentStatus: 'Pending' },
        { $set: { paymentStatus: 'Failed' } }
      );
      throw new OrderError('Payment verification failed. If money was deducted, contact the store.');
    }

    const paid = await markOrderPaid(order._id, razorpay_payment_id, razorpay_signature);

    res.status(200).json({
      success: true,
      data: paid || (await Order.findById(order._id)),
      message: 'Payment successful',
    });
  } catch (error) {
    handleError(error, res, next);
  }
};

// ===============================================================
// POST /api/orders/razorpay/webhook   (Public, Razorpay server call karta hai)
// Backup: agar user payment ke baad browser band kar de
// NOTE: yeh route express.raw() ke saath server.js mein mount hota hai
// ===============================================================
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    if (!secret || !signature) return res.status(400).send('Missing secret or signature');

    const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (!safeEqual(expected, signature)) return res.status(400).send('Invalid signature');

    const event = JSON.parse(req.body.toString());

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        if (order && payment.amount === Math.round(order.finalAmount * 100)) {
          await markOrderPaid(order._id, payment.id);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[Razorpay webhook]', error.message);
    res.status(500).send('Error');
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