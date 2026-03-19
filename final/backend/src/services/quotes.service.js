const Quote = require('../models/Quote');
const OnboardingData = require('../models/OnboardingData');
const UserProgress = require('../models/UserProgress');
const quoteGenerator = require('./quote-generator.service');
const { SUBSCRIPTION_LIMITS } = require('../constants/subscription-limits');

const mapQuote = (quote) => ({
  id: quote._id,
  content: quote.text,
  category: quote.category,
  niche: quote.niche,
  is_active: quote.is_active,
  created_at: quote.created_at,
});

const getQuotes = async (userId, subscriptionTier) => {
  const quotes = await Quote.find({ user_id: userId, is_active: true })
    .sort({ created_at: -1 })
    .limit(3)
    .lean();

  if (!quotes || quotes.length === 0) {
    return generateInitialQuotes(userId, subscriptionTier);
  }

  const progress = await UserProgress.findOne({ user_id: userId }).select(
    'quote_regenerations last_activity_date'
  );

  const limits = SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;
  const today = new Date().toISOString().split('T')[0];
  const regenerationsToday =
    progress && progress.last_activity_date === today ? progress.quote_regenerations : 0;

  const regenerationsRemaining =
    limits.quoteRegenerationsPerDay === -1
      ? -1
      : limits.quoteRegenerationsPerDay - regenerationsToday;

  return { 
    quotes: quotes.map(mapQuote), 
    regenerationsRemaining 
  };
};

const regenerateQuotes = async (userId, subscriptionTier) => {
  const limits = SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;

  const progress = await UserProgress.findOne({ user_id: userId }).select(
    'quote_regenerations last_activity_date'
  );

  if (progress) {
    const today = new Date().toISOString().split('T')[0];
    let regenerationsToday = progress.quote_regenerations;
    if (progress.last_activity_date !== today) {
      regenerationsToday = 0;
    }

    if (
      limits.quoteRegenerationsPerDay !== -1 &&
      regenerationsToday >= limits.quoteRegenerationsPerDay
    ) {
      const error = new Error(
        `Daily quote regeneration limit reached (${limits.quoteRegenerationsPerDay} regenerations). Upgrade for more.`
      );
      error.statusCode = 403;
      throw error;
    }
  }

  // Deactivate old quotes
  await Quote.updateMany({ user_id: userId, is_active: true }, { is_active: false });

  // Get user's niche
  const onboarding = await OnboardingData.findOne({ user_id: userId }).select('niche');

  // Generate new quotes
  const newQuotes = quoteGenerator.generateQuotes(onboarding?.niche || null);

  const quotesToInsert = newQuotes.map((quote) => ({
    user_id: userId,
    text: quote.text,
    category: quote.category,
    niche: quote.niche,
    is_active: true,
  }));

  const savedQuotes = await Quote.insertMany(quotesToInsert);

  // Update regeneration count
  if (progress) {
    const today = new Date().toISOString().split('T')[0];
    const regenerationsToday =
      progress.last_activity_date === today ? progress.quote_regenerations + 1 : 1;

    progress.quote_regenerations = regenerationsToday;
    await progress.save();

    const regenerationsRemaining =
      limits.quoteRegenerationsPerDay === -1
        ? -1
        : limits.quoteRegenerationsPerDay - regenerationsToday;

    return { 
      quotes: savedQuotes.map(mapQuote), 
      regenerationsRemaining 
    };
  }

  return { quotes: savedQuotes.map(mapQuote) };
};

const generateInitialQuotes = async (userId, subscriptionTier) => {
  const onboarding = await OnboardingData.findOne({ user_id: userId }).select('niche');

  const newQuotes = quoteGenerator.generateQuotes(onboarding?.niche || null);

  const quotesToInsert = newQuotes.map((quote) => ({
    user_id: userId,
    text: quote.text,
    category: quote.category,
    niche: quote.niche,
    is_active: true,
  }));

  const savedQuotes = await Quote.insertMany(quotesToInsert);

  const limits = SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;

  return {
    quotes: savedQuotes.map(mapQuote),
    regenerationsRemaining: limits.quoteRegenerationsPerDay,
  };
};

module.exports = { getQuotes, regenerateQuotes };
