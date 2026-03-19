const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    day_plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DayPlan',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task_order: {
      type: Number,
      required: true,
    },
    task_type: {
      type: String,
      enum: ['quit', 'adopt'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
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

taskSchema.index({ user_id: 1 });
taskSchema.index({ day_plan_id: 1 });

module.exports = mongoose.model('Task', taskSchema);
