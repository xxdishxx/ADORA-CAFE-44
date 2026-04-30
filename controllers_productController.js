const Product = require('../models/Product');

/**
 * Get all active products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json({
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Create product (admin only)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, basePreparationTime, price, category, description } =
      req.body;

    if (!name || !basePreparationTime || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = new Product({
      name,
      basePreparationTime,
      price,
      category: category || 'coffee',
      description: description || '',
      isActive: true,
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, basePreparationTime, price, isActive, category } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        basePreparationTime,
        price,
        isActive,
        category,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
};