const express = require('express');
const { getAuth, clerkClient } = require('@clerk/express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/sync
 * @desc    Sync Clerk user with MongoDB (create if doesn't exist)
 * @access  Private (Clerk Auth)
 */
router.post('/sync', async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    const avatarUrl = clerkUser.imageUrl;

    let user = await User.findOne({ clerk_id: userId });

    if (!user && email) {
      // Try finding by email for existing users migrating to Clerk
      user = await User.findOne({ email });
      if (user) {
        user.clerk_id = userId;
        if (!user.full_name && fullName) user.full_name = fullName;
        if (!user.avatar_url && avatarUrl) user.avatar_url = avatarUrl;
        await user.save();
      }
    }

    if (!user) {
      // Create new user record in MongoDB
      user = await User.create({
        clerk_id: userId,
        email,
        full_name: fullName || (email ? email.split('@')[0] : 'User'),
        avatar_url: avatarUrl,
        subscription_tier: 'free',
        onboarding_completed: false,
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
          subscriptionTier: user.subscription_tier,
          onboardingCompleted: user.onboarding_completed,
        }
      }
    });
  } catch (error) {
    console.error('Sync Error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile from MongoDB
 * @access  Private
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    // req.user is populated by our 'auth' middleware which maps Clerk ID to MongoDB User
    res.json({
      success: true,
      data: {
        user: req.user,
        profile: req.user // For compatibility with frontend expectations
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Placeholder for logout (Clerk handles this on frontend)
 * @access  Public
 */
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
