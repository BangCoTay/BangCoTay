const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    clerk_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    full_name: {
      type: String,
      default: null,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    subscription_tier: {
      type: String,
      enum: ['free', 'starter', 'premium'],
      default: 'free',
    },
    stripe_customer_id: {
      type: String,
      sparse: true,
    },
    onboarding_completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
