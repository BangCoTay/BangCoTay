const { clerkClient, getAuth } = require('@clerk/express');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    // Find user in our database by clerk_id
    let user = await User.findOne({ clerk_id: userId });

    // Fallback: If not found by clerk_id, try to find by email and link them
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.clerk_id = userId;
            await user.save();
          }
        }
      } catch (clerkError) {
        console.error('Error fetching user from Clerk:', clerkError);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'User profile not found. Please complete signup.' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      subscriptionTier: user.subscription_tier,
      onboardingCompleted: user.onboarding_completed,
      clerkId: userId
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ success: false, error: 'Invalid authentication' });
  }
};

module.exports = auth;
