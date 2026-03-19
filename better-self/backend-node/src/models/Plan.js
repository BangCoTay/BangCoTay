const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    onboarding_data_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OnboardingData',
      default: null,
    },
    total_days: {
      type: Number,
      default: 30,
    },
    current_day: {
      type: Number,
      default: 1,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    started_at: {
      type: Date,
      default: Date.now,
    },
    completed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Partial unique index: one active plan per user
planSchema.index({ user_id: 1, is_active: 1 }, { unique: true, partialFilterExpression: { is_active: true } });

module.exports = mongoose.model('Plan', planSchema);
