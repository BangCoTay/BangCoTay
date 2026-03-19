const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const connectDB = require('./database/connection');
const { clerkMiddleware } = require('@clerk/express');
const routes = require('./routes');

const app = express();

// Clerk Middleware
app.use(clerkMiddleware({
  publishableKey: config.clerk.publishableKey,
  secretKey: config.clerk.secretKey,
}));

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Rate limiting (100 requests per 60 seconds)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // Increased for dev stability
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // Stricter for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts, please try again later.' },
});

app.use(limiter);
app.use('/api/v1/auth', authLimiter);

// Body parsing - JSON for all routes except Stripe webhook
// The webhook route handles its own raw body parsing via express.raw()
app.use((req, res, next) => {
  if (req.originalUrl === `/${config.apiPrefix}/payments/webhook`) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Routes
app.use(`/${config.apiPrefix}`, routes);

// Global error handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format for field ${err.path}`;
  }

  console.error(`[ERROR] ${statusCode} - ${message}`);
  if (err.stack && statusCode === 500) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    error: message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Application is running on: http://localhost:${config.port}/${config.apiPrefix}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Clerk Publishable Key: ${config.clerk.publishableKey ? 'Found' : 'MISSING'}`);
  });
};

startServer();

module.exports = app;
