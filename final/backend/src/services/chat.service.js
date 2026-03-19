const ChatMessage = require('../models/ChatMessage');
const OnboardingData = require('../models/OnboardingData');
const UserProgress = require('../models/UserProgress');
const openaiService = require('./openai.service');
const { SUBSCRIPTION_LIMITS } = require('../constants/subscription-limits');

const sendMessage = async (userId, { content, coachPersona }, subscriptionTier) => {
  const limits = SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;

  // Check message limits
  const progress = await UserProgress.findOne({ user_id: userId });

  if (progress) {
    const today = new Date().toISOString().split('T')[0];
    let messagesUsedToday = progress.ai_messages_used;
    if (progress.last_activity_date !== today) {
      messagesUsedToday = 0;
    }

    if (limits.aiMessagesPerDay !== -1 && messagesUsedToday >= limits.aiMessagesPerDay) {
      const error = new Error(
        `Daily AI message limit reached (${limits.aiMessagesPerDay} messages). Upgrade to send more messages.`
      );
      error.statusCode = 403;
      throw error;
    }
  }

  // Save user message
  const userMessage = await ChatMessage.create({
    user_id: userId,
    role: 'user',
    content,
  });

  // Get recent chat history (last 10 messages)
  const recentMessages = await ChatMessage.find({ user_id: userId })
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

  // Update AI messages used count
  if (progress) {
    const today = new Date().toISOString().split('T')[0];
    const messagesUsedToday =
      progress.last_activity_date === today ? progress.ai_messages_used + 1 : 1;

    progress.ai_messages_used = messagesUsedToday;
    await progress.save();

    const messagesRemaining =
      limits.aiMessagesPerDay === -1 ? -1 : limits.aiMessagesPerDay - messagesUsedToday;

    return { userMessage, assistantMessage, messagesRemaining };
  }

  return { userMessage, assistantMessage };
};

const getMessages = async (userId, limit = 50, offset = 0) => {
  const total = await ChatMessage.countDocuments({ user_id: userId });
  const messages = await ChatMessage.find({ user_id: userId })
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
