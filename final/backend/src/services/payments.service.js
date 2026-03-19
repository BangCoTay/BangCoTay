const config = require('../config');
const Stripe = require('stripe');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PaymentHistory = require('../models/PaymentHistory');

let stripe = null;
if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey);
}

const createCheckout = async (userId, { priceId, tier }) => {
  if (!stripe) throw new Error('Stripe not configured');

  const user = await User.findById(userId).select('email');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 400;
    throw error;
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: userId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.frontendUrl}/dashboard?payment=success`,
    cancel_url: `${config.frontendUrl}/dashboard?payment=canceled`,
    metadata: { userId, tier },
  });

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

  const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);

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

  if (!userId) return;

  await User.findByIdAndUpdate(userId, { stripe_customer_id: customerId });

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const tier = session.metadata?.tier || 'starter';

  await Subscription.create({
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: subscription.items.data[0].price.id,
    tier,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
  });

  await User.findByIdAndUpdate(userId, { subscription_tier: tier });
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

module.exports = { createCheckout, getPortal, handleWebhook };
