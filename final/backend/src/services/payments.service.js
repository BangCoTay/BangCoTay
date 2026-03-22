const config = require('../config');
const Stripe = require('stripe');
const User = require('../models/User');
const Plan = require('../models/Plan');
const DayPlan = require('../models/DayPlan');
const Subscription = require('../models/Subscription');
const PaymentHistory = require('../models/PaymentHistory');
const { SUBSCRIPTION_LIMITS } = require('../constants/subscription-limits');

let stripe = null;
if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey);
}

const createCheckout = async (userId, { priceId, tier }) => {
  if (!stripe) throw new Error('Stripe not configured');

  const allowedTiers = ['starter', 'premium'];
  if (!allowedTiers.includes(tier)) {
    const error = new Error('Invalid subscription tier');
    error.statusCode = 400;
    throw error;
  }

  const expectedPriceId =
    tier === 'starter' ? config.stripe.priceIdStarter : config.stripe.priceIdPremium;
  if (expectedPriceId && priceId !== expectedPriceId) {
    const error = new Error('Invalid price for selected tier');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select('email stripe_customer_id');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 400;
    throw error;
  }

  const sessionData = {
    client_reference_id: userId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.frontendUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontendUrl}/dashboard?payment=canceled`,
    metadata: { userId, tier, priceId },
  };

  if (user.stripe_customer_id) {
    sessionData.customer = user.stripe_customer_id;
  } else {
    sessionData.customer_email = user.email;
  }

  const session = await stripe.checkout.sessions.create(sessionData);

  return { checkoutUrl: session.url, sessionId: session.id };
};

const getPortal = async (userId) => {
  if (!stripe) throw new Error('Stripe not configured');

  const user = await User.findById(userId).select('stripe_customer_id');
  if (!user || !user.stripe_customer_id) {
    const error = new Error('No active subscription found. Please subscribe first.');
    error.statusCode = 400;
    throw error;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${config.frontendUrl}/dashboard`,
  });

  return { portalUrl: session.url };
};

const handleWebhook = async (signature, payload) => {
  if (!stripe) throw new Error('Stripe not configured');
  if (!config.stripe.webhookSecret) throw new Error('Stripe webhook secret not configured');

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw err;
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  return { received: true };
};

const handleCheckoutCompleted = async (session) => {
  const userId = session.client_reference_id || session.metadata?.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const tier = session.metadata?.tier || 'starter';
  const priceId = session.metadata?.priceId;

  if (!userId) {
    console.error('No userId found in session');
    return;
  }

  const user = await User.findById(userId).select('_id');
  if (!user) {
    console.error(`User ${userId} not found`);
    return;
  }

  await User.findByIdAndUpdate(userId, { stripe_customer_id: customerId });

  // If it's a subscription, retrieve more info
  let status = 'active';
  let current_period_start = new Date();
  let current_period_end = null; // null for forever access

  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      status = subscription.status;
      current_period_start = new Date(subscription.current_period_start * 1000);
      current_period_end = new Date(subscription.current_period_end * 1000);
    } catch (err) {
      console.error('Error retrieving subscription:', err);
    }
  }

  const userSubscription = await Subscription.findOneAndUpdate(
    { user_id: userId },
    {
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId || null,
      tier,
      status,
      current_period_start,
      current_period_end,
    },
    { upsert: true, new: true }
  );

  // If it's a one-time payment, record the history now
  if (!subscriptionId && session.payment_status === 'paid') {
    await PaymentHistory.create({
      user_id: userId,
      subscription_id: userSubscription._id,
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      status: 'succeeded',
      payment_method: 'card',
    });
  }

  await User.findByIdAndUpdate(userId, { subscription_tier: tier });

  // Unlock additional plan days based on new tier
  await unlockPlanDaysAfterUpgrade(userId, tier);
};

const unlockPlanDaysAfterUpgrade = async (userId, tier) => {
  try {
    const plan = await Plan.findOne({ user_id: userId, is_active: true });
    if (!plan) {
      console.log(`No active plan found for user ${userId} to unlock days for.`);
      return;
    }

    const limits = SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;
    const daysToUnlock = limits.daysUnlocked;

    if (!daysToUnlock) return;

    // Unlock all days up to the new limit
    const updateResult = await DayPlan.updateMany(
      { plan_id: plan._id, day_number: { $lte: daysToUnlock }, unlocked: false },
      { unlocked: true, unlocked_at: new Date() }
    );

    console.log(`Successfully unlocked ${updateResult.modifiedCount} days for user ${userId} (tier: ${tier}, planId: ${plan._id})`);
  } catch (err) {
    console.error('CRITICAL: Error unlocking plan days after upgrade:', err);
  }
};

const handleSubscriptionUpdated = async (subscription) => {
  const existing = await Subscription.findOne({
    stripe_subscription_id: subscription.id,
  });
  if (!existing) return;

  existing.status = subscription.status;
  existing.current_period_start = new Date(subscription.current_period_start * 1000);
  existing.current_period_end = new Date(subscription.current_period_end * 1000);
  existing.cancel_at_period_end = subscription.cancel_at_period_end;
  existing.canceled_at = subscription.canceled_at
    ? new Date(subscription.canceled_at * 1000)
    : null;
  await existing.save();

  if (subscription.status === 'active') {
    await User.findByIdAndUpdate(existing.user_id, { subscription_tier: existing.tier });
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  const existing = await Subscription.findOne({
    stripe_subscription_id: subscription.id,
  });
  if (!existing) return;

  existing.status = 'canceled';
  existing.canceled_at = new Date();
  await existing.save();

  await User.findByIdAndUpdate(existing.user_id, { subscription_tier: 'free' });
};

const handlePaymentSucceeded = async (invoice) => {
  const subscriptionId = invoice.subscription;
  const sub = await Subscription.findOne({ stripe_subscription_id: subscriptionId });
  if (!sub) return;

  await PaymentHistory.create({
    user_id: sub.user_id,
    subscription_id: sub._id,
    stripe_payment_intent_id: invoice.payment_intent,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    payment_method: invoice.payment_intent ? 'card' : 'unknown',
  });
};

const handlePaymentFailed = async (invoice) => {
  const subscriptionId = invoice.subscription;
  const sub = await Subscription.findOne({ stripe_subscription_id: subscriptionId });
  if (!sub) return;

  await PaymentHistory.create({
    user_id: sub.user_id,
    subscription_id: sub._id,
    stripe_payment_intent_id: invoice.payment_intent,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    payment_method: 'card',
  });

  await Subscription.findOneAndUpdate(
    { stripe_subscription_id: subscriptionId },
    { status: 'past_due' }
  );
};

const verifySession = async (userId, sessionId) => {
  if (!stripe) throw new Error('Stripe not configured');

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure the session belongs to the user
  const sessionUserId = session.client_reference_id || session.metadata?.userId;
  if (sessionUserId !== userId) {
    const error = new Error('Unauthorized: This session does not belong to you');
    error.statusCode = 403;
    throw error;
  }

  if (session.payment_status === 'paid') {
    await handleCheckoutCompleted(session);
    return { success: true, tier: session.metadata?.tier || 'starter' };
  }

  return { success: false, status: session.payment_status };
};

module.exports = { createCheckout, getPortal, handleWebhook, verifySession };
