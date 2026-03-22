const mongoose = require('mongoose');

const onboardingDataSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    niche: {
      type: String,
      enum: ['digital', 'mental', 'study', 'health', 'food', 'gaming'],
      required: true,
    },
    addiction: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true,
    },
    pain_points: {
      type: [String],
      enum: ['time', 'energy', 'confidence', 'sleep', 'relationships', 'money'],
      default: [],
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

module.exports = mongoose.model('OnboardingData', onboardingDataSchema);
