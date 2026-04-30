const mongoose = require('mongoose');

// Counter schema for auto-incrementing order number
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  sequence_value: {
    type: Number,
    default: 1000,
  },
});

const Counter = mongoose.model('Counter', counterSchema);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        customizations: {
          sugarLevel: {
            type: String,
            enum: ['none', 'low', 'medium', 'high'],
            default: 'medium',
          },
          milkType: {
            type: String,
            enum: ['whole', 'skim', 'almond', 'oat', 'none'],
            default: 'whole',
          },
          extraShot: {
            type: Boolean,
            default: false,
          },
          notes: String,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'preparing', 'ready', 'completed', 'rejected'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedTime: {
      type: Number,
      default: 0,
      // in minutes
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    readyAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-increment order number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'orderNumber' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.orderNumber = counter.sequence_value;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Order', orderSchema);