const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

/**
 * Calculate estimated time for an order
 * BaseTime = sum(product.basePreparationTime × quantity)
 * QueueDelay = activeOrders × (rushMode ? 3 : 2)
 * EstimatedTime = BaseTime + QueueDelay
 */
const calculateEstimatedTime = async (items, rushMode) => {
  let baseTime = 0;

  // Calculate base preparation time
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    baseTime += product.basePreparationTime * item.quantity;
  }

  // Get count of active orders
  const activeOrders = await Order.countDocuments({
    status: { $in: ['approved', 'preparing'] },
  });

  // Calculate queue delay
  const delayMultiplier = rushMode ? 3 : 2;
  const queueDelay = activeOrders * delayMultiplier;

  return baseTime + queueDelay;
};

/**
 * Check if shop can accept new orders
 */
const canAcceptNewOrder = async () => {
  const settings = await Settings.findOne();
  if (!settings) throw new Error('Settings not found');

  // Check shop status
  if (settings.shopStatus !== 'open') {
    return {
      canAccept: false,
      reason: `ADORA is currently ${settings.shopStatus}. Please try again later.`,
    };
  }

  // Check active orders capacity
  const activeOrders = await Order.countDocuments({
    status: { $in: ['approved', 'preparing'] },
  });

  if (activeOrders >= settings.maxActiveOrders) {
    return {
      canAccept: false,
      reason: 'ADORA is currently at full capacity. Please try again in a few minutes.',
    };
  }

  return { canAccept: true };
};

/**
 * Create a new order
 */
const createOrder = async (customerId, items) => {
  // Validate if shop can accept orders
  const { canAccept, reason } = await canAcceptNewOrder();
  if (!canAccept) {
    throw {
      status: 400,
      message: reason,
    };
  }

  // Validate items and calculate total price
  let totalPrice = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (!product.isActive) throw new Error(`Product ${product.name} is not available`);
    totalPrice += product.price * item.quantity;
  }

  // Get rush mode setting
  const settings = await Settings.findOne();
  const estimatedTime = await calculateEstimatedTime(items, settings.rushMode);

  // Create order
  const order = new Order({
    customerId,
    items,
    totalPrice,
    estimatedTime,
    status: 'pending',
  });

  await order.save();
  await order.populate('customerId items.productId');

  return order;
};

/**
 * Approve or reject an order
 */
const updateOrderStatus = async (orderId, newStatus, rejectionReason = null) => {
  const validTransitions = {
    pending: ['approved', 'rejected'],
    approved: ['preparing', 'rejected'],
    preparing: ['ready'],
    ready: ['completed'],
  };

  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  if (!validTransitions[order.status]?.includes(newStatus)) {
    throw new Error(
      `Cannot transition from ${order.status} to ${newStatus}`
    );
  }

  order.status = newStatus;

  if (newStatus === 'approved') {
    order.approvedAt = new Date();
  } else if (newStatus === 'ready') {
    order.readyAt = new Date();
  } else if (newStatus === 'completed') {
    order.completedAt = new Date();
  } else if (newStatus === 'rejected') {
    order.rejectionReason = rejectionReason;
  }

  await order.save();
  return order;
};

/**
 * Get active orders count
 */
const getActiveOrdersCount = async () => {
  return await Order.countDocuments({
    status: { $in: ['approved', 'preparing'] },
  });
};

/**
 * Get all orders for admin dashboard
 */
const getAllOrders = async (status = null) => {
  const filter = status ? { status } : {};
  return await Order.find(filter)
    .populate('customerId items.productId')
    .sort({ createdAt: -1 });
};

module.exports = {
  calculateEstimatedTime,
  canAcceptNewOrder,
  createOrder,
  updateOrderStatus,
  getActiveOrdersCount,
  getAllOrders,
};