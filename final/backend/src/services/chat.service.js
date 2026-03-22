const ChatMessage = require('../models/ChatMessage');
const OnboardingData = require('../models/OnboardingData');
const UserProgress = require('../models/UserProgress');
const openaiService = require('./openai.service');
const { SUBSCRIPTION_LIMITS } = require('../constants/subscription-limits');

const sendMessage = async (userId, { content, coachPersona }, subscriptionTier) => {
  const limits = SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;

  // Check TOTAL lifetime message limits (not per-day)
  const progress = await UserProgress.findOne({ user_id: userId });
  const totalUsed = progress?.ai_messages_used ?? 0;
  const totalLimit = limits.aiMessagesTotal;

  if (totalLimit !== undefined && totalLimit !== -1 && totalUsed >= totalLimit) {
    const error = new Error(
      `AI message limit reached (${totalLimit} total messages). Upgrade to send more messages.`
    );
    error.statusCode = 403;
    throw error;
  }

  // Save user message
  const userMessage = await ChatMessage.create({
    user_id: userId,
    role: 'user',
    content,
  });

  // Get recent chat history (last 10 assistant messages for context)
  const recentMessages = await ChatMessage.find({
    user_id: userId,
    role: { $in: ['user', 'assistant'] },
  })
    .sort({ created_at: -1 })
    .limit(10)
    .select('role content')
    .lean();

  const chatHistory = recentMessages.reverse();

  // Get user context
  const onboarding = await OnboardingData.findOne({ user_id: userId }).select(
    'niche addiction severity'
  );
  const userProgress = await UserProgress.findOne({ user_id: userId }).select(
    'current_day total_tasks_completed streak_days'
  );

  const userContext = {
    niche: onboarding?.niche,
    addiction: onboarding?.addiction,
    severity: onboarding?.severity,
    currentDay: userProgress?.current_day,
    recentProgress: userProgress
      ? `${userProgress.total_tasks_completed} tasks completed, ${userProgress.streak_days} day streak`
      : 'just starting',
  };

  // Generate AI response
  const aiResponse = await openaiService.generateCoachResponse(
    chatHistory,
    coachPersona || 'Alex',
    userContext,
    subscriptionTier
  );

  // Save AI response
  const assistantMessage = await ChatMessage.create({
    user_id: userId,
    role: 'assistant',
    content: aiResponse.content,
    sender_name: coachPersona || 'Alex',
    tokens_used: aiResponse.tokensUsed,
    model: aiResponse.model,
  });

  // Update TOTAL AI messages used count (lifetime, not daily)
  if (progress) {
    progress.ai_messages_used = totalUsed + 1;
    // Update last_activity_date for streak tracking
    const today = new Date().toISOString().split('T')[0];
    progress.last_activity_date = today;
    await progress.save();
  }

  const newTotal = totalUsed + 1;
  const messagesRemaining =
    totalLimit === -1 || totalLimit === undefined ? -1 : Math.max(0, totalLimit - newTotal);

  return { userMessage, assistantMessage, messagesRemaining };
};

const getMessages = async (userId, role, limit = 50, offset = 0) => {
  // Build filter - optionally filter by role (for persona-specific feeds)
  const filter = { user_id: userId };

  if (role === 'coach') {
    // AI Coach feed: user messages + assistant messages
    filter.role = { $in: ['user', 'assistant'] };
  } else if (role === 'friend') {
    filter.role = 'friend';
  } else if (role === 'family') {
    filter.role = 'family';
  } else if (role === 'girlfriend') {
    filter.role = 'girlfriend';
  }
  // If no role specified, return all messages (backward compat)

  const total = await ChatMessage.countDocuments(filter);
  const messages = await ChatMessage.find(filter)
    .sort({ created_at: 1 })
    .skip(offset)
    .limit(limit)
    .lean();

  return {
    messages,
    total,
    hasMore: total > offset + limit,
  };
};

const deleteMessages = async (userId) => {
  return await ChatMessage.deleteMany({ user_id: userId });
};

const sendInitialMessage = async (userId, coachPersona = 'Alex') => {
  const onboarding = await OnboardingData.findOne({ user_id: userId }).select('niche addiction');

  let welcomeText = `Hi there! I'm ${coachPersona}, your AI Coach. I've analyzed your onboarding and I'm ready to help you overcome your ${onboarding?.addiction || 'habits'} and level up your life. Shall we get started with Day 1?`;

  if (onboarding?.niche === 'digital') {
    welcomeText = `Ready to reclaim your time from the digital noise? I'm ${coachPersona}, and I'll be guiding you through your digital detox journey. Let's start making every offline minute count.`;
  } else if (onboarding?.niche === 'mental') {
    welcomeText = `Hello! I'm ${coachPersona}. I'm here to support your mental well-being and help you build a more resilient mindset. You're not alone in this journey.`;
  }

  const initialMessage = await ChatMessage.create({
    user_id: userId,
    role: 'assistant',
    content: welcomeText,
    sender_name: coachPersona,
  });

  return initialMessage;
};

module.exports = { sendMessage, getMessages, deleteMessages, sendInitialMessage };
