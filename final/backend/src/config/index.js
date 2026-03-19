const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Explicitly ensure Clerk keys are in process.env for the SDK
if (process.env.CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY.trim();
}
if (process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY.trim();
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/better-self',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceIdStarter: process.env.STRIPE_PRICE_ID_STARTER,
    priceIdPremium: process.env.STRIPE_PRICE_ID_PREMIUM,
  },
  openaiApiKey: process.env.OPENAI_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  },
};

module.exports = config;
