const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripe_subscription_id: {
      type: String,
      sparse: true,
    },
    stripe_price_id: {
      type: String,
      default: null,
    },
    tier: {
      type: String,
      enum: ['free', 'starter', 'premium'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete'],
      default: 'active',
    },
    current_period_start: {
      type: Date,
      default: null,
    },
    current_period_end: {
      type: Date,
      default: null,
    },
    cancel_at_period_end: {
      type: Boolean,
      default: false,
    },
    canceled_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

subscriptionSchema.index({ user_id: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
