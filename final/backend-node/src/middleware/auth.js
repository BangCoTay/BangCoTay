const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id).select('_id email subscription_tier onboarding_completed');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      subscriptionTier: user.subscription_tier,
      onboardingCompleted: user.onboarding_completed,
    };
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

module.exports = auth;
