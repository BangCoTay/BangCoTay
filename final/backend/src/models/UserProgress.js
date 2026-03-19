const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    current_day: {
      type: Number,
      default: 1,
    },
    total_tasks_completed: {
      type: Number,
      default: 0,
    },
    ai_messages_used: {
      type: Number,
      default: 0,
    },
    quote_regenerations: {
      type: Number,
      default: 0,
    },
    streak_days: {
      type: Number,
      default: 0,
    },
    last_activity_date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

userProgressSchema.index({ user_id: 1, plan_id: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
