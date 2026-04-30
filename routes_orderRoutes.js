const express = require('express');
const orderController = require('../controllers/orderController');
const { verifyToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Customer routes
router.post('/', verifyToken, authorize('customer'), orderController.createOrder);
router.get('/my-orders', verifyToken, authorize('customer'), orderController.getMyOrders);

// Barista/Manager routes
router.get('/', verifyToken, authorize('barista', 'manager'), orderController.getAllOrders);
router.get('/:orderId', verifyToken, orderController.getOrderById);
router.put('/:orderId/approve', verifyToken, authorize('barista', 'manager'), orderController.approveOrder);
router.put('/:orderId/reject', verifyToken, authorize('barista', 'manager'), orderController.rejectOrder);
router.put('/:orderId/preparing', verifyToken, authorize('barista', 'manager'), orderController.markPreparing);
router.put('/:orderId/ready', verifyToken, authorize('barista', 'manager'), orderController.markReady);
router.put('/:orderId/complete', verifyToken, authorize('barista', 'manager'), orderController.completeOrder);

// Admin routes
router.get('/active/count', verifyToken, authorize('manager'), orderController.getActiveOrdersCount);

module.exports = router;