const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['emotional', 'practical'],
      default: 'emotional',
    },
    niche: {
      type: String,
      enum: ['digital', 'mental', 'study', 'health', 'food', 'gaming', 'general'],
      default: 'general',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

quoteSchema.index({ user_id: 1, is_active: 1 });

module.exports = mongoose.model('Quote', quoteSchema);
