const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: '1h', // Access token 1 hour
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || '7d', // Refresh token 7 days
  });
};

const signup = async ({ email, password, fullName }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    email,
    password,
    full_name: fullName,
    subscription_tier: 'free',
    onboarding_completed: false,
  });

  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: user.toJSON(),
    profile: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    const accessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  const subscription = await Subscription.findOne({
    user_id: userId,
    status: 'active',
  });

  return {
    user: user.toJSON(),
    profile: user.toJSON(),
    subscription,
  };
};

module.exports = { signup, login, getMe, refreshToken, generateToken };
