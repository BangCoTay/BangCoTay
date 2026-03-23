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

    // Auto-sync: If not found in our DB, create the record now
    if (!user) {
      console.log(`[AUTH] User ${userId} not found in MongoDB. Attempting auto-sync...`);
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (email) {
          // Double check by email to avoid duplicates
          user = await User.findOne({ email });
          if (user) {
            user.clerk_id = userId;
            await user.save();
            console.log(`[AUTH] User found by email and linked: ${email}`);
          }
        }

        if (!user) {
          // Create new user record
          user = await User.create({
            clerk_id: userId,
            email: email || 'no-email',
            full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
            subscription_tier: 'free',
            onboarding_completed: false,
          });
          console.log(`[AUTH] New user record created for: ${email}`);
        }
      } catch (clerkError) {
        console.error('[AUTH] Auto-sync failed:', clerkError);
        return res.status(401).json({ success: false, error: 'User profile missing and sync failed.' });
      }
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
