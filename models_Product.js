const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    basePreparationTime: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: 1,
      // in minutes
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['coffee', 'tea', 'smoothie', 'pastry'],
      default: 'coffee',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);