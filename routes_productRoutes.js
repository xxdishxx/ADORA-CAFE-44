const express = require('express');
const productController = require('../controllers/productController');
const { verifyToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProductById);

// Admin routes
router.post('/', verifyToken, authorize('manager'), productController.createProduct);
router.put('/:productId', verifyToken, authorize('manager'), productController.updateProduct);

module.exports = router;