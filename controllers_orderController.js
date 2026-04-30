const Order = require('../models/Order');
const User = require('../models/User');
const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');

/**
 * Create new order
 */
const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }

    const order = await orderService.createOrder(req.user.id, items);

    // Get customer for notifications
    const customer = await User.findById(order.customerId);

    // Send notification
    if (customer.fcmToken) {
      await notificationService.notifyOrderCreated(customer);
    }

    // Emit socket event to admin dashboard
    req.app.io.emit('newOrder', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      estimatedTime: order.estimatedTime,
    });

    res.status(201).json({
      message: 'Order created successfully. Awaiting approval.',
      order,
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Approve order
 */
const approveOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await orderService.updateOrderStatus(orderId, 'approved');

    // Get customer for notifications
    const customer = await User.findById(order.customerId);

    // Send notification
    if (customer.fcmToken) {
      await notificationService.notifyOrderApproved(customer);
    }

    // Emit socket event
    req.app.io.emit('orderStatusUpdated', {
      orderId: order._id,
      status: 'approved',
    });

    res.json({ message: 'Order approved', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject order
 */
const rejectOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await orderService.updateOrderStatus(
      orderId,
      'rejected',
      reason
    );

    // Emit socket event
    req.app.io.emit('orderStatusUpdated', {
      orderId: order._id,
      status: 'rejected',
    });

    res.json({ message: 'Order rejected', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark order as preparing
 */
const markPreparing = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await orderService.updateOrderStatus(orderId, 'preparing');

    // Emit socket event
    req.app.io.emit('orderStatusUpdated', {
      orderId: order._id,
      status: 'preparing',
    });

    res.json({ message: 'Order is being prepared', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark order as ready
 */
const markReady = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await orderService.updateOrderStatus(orderId, 'ready');

    // Get customer for notifications
    const customer = await User.findById(order.customerId);

    // Send notification
    if (customer.fcmToken) {
      await notificationService.notifyOrderReady(customer);
    }

    // Emit socket event
    req.app.io.emit('orderStatusUpdated', {
      orderId: order._id,
      status: 'ready',
    });

    res.json({ message: 'Order is ready for pickup', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark order as completed
 */
const completeOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await orderService.updateOrderStatus(orderId, 'completed');

    // Emit socket event
    req.app.io.emit('orderStatusUpdated', {
      orderId: order._id,
      status: 'completed',
    });

    res.json({ message: 'Order completed', order });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const orders = await orderService.getAllOrders(status);

    res.json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order
 */
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      'customerId items.productId'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer's orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active orders count
 */
const getActiveOrdersCount = async (req, res, next) => {
  try {
    const count = await orderService.getActiveOrdersCount();
    res.json({ activeOrdersCount: count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  approveOrder,
  rejectOrder,
  markPreparing,
  markReady,
  completeOrder,
  getAllOrders,
  getOrderById,
  getMyOrders,
  getActiveOrdersCount,
};