const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    maxActiveOrders: {
      type: Number,
      default: 4,
      min: 1,
    },
    rushMode: {
      type: Boolean,
      default: false,
    },
    shopStatus: {
      type: String,
      enum: ['open', 'paused', 'closed'],
      default: 'open',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);