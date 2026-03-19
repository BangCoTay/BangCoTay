const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema(
  {
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    day_number: {
      type: Number,
      required: true,
    },
    unlocked: {
      type: Boolean,
      default: false,
    },
    unlocked_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

dayPlanSchema.index({ plan_id: 1, day_number: 1 }, { unique: true });

module.exports = mongoose.model('DayPlan', dayPlanSchema);
