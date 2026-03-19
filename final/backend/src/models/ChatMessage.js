const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'girlfriend', 'friend', 'family'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sender_name: {
      type: String,
      default: null,
    },
    tokens_used: {
      type: Number,
      default: 0,
    },
    model: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

chatMessageSchema.index({ user_id: 1, created_at: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
