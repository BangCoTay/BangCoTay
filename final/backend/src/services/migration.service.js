const OnboardingData = require('../models/OnboardingData');
const Plan = require('../models/Plan');
const DayPlan = require('../models/DayPlan');
const Task = require('../models/Task');
const ChatMessage = require('../models/ChatMessage');
const Quote = require('../models/Quote');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');

const importLocalStorage = async (userId, dto) => {
  const imported = {
    onboarding: false,
    plan: false,
    tasks: 0,
    messages: 0,
    quotes: 0,
  };

  const existingOnboarding = await OnboardingData.findOne({ user_id: userId });
  if (existingOnboarding) {
    const error = new Error('User already has data. Migration can only be done once.');
    error.statusCode = 400;
    throw error;
  }

  // Import onboarding data
  if (dto.onboardingData) {
    await OnboardingData.create({
      user_id: userId,
      niche: dto.onboardingData.niche,
      addiction: dto.onboardingData.addiction,
      severity: dto.onboardingData.severity,
      pain_points: dto.onboardingData.painPoints || [],
      healthy_habit: dto.onboardingData.healthyHabit,
    });
    imported.onboarding = true;

    await User.findByIdAndUpdate(userId, { onboarding_completed: true });
  }

  // Import plan and tasks
  if (dto.plan && dto.plan.length > 0) {
    const plan = await Plan.create({
      user_id: userId,
      total_days: 30,
      current_day: dto.userProgress?.currentDay || 1,
      is_active: true,
    });
    imported.plan = true;

    for (const dayPlanData of dto.plan) {
      const createdDayPlan = await DayPlan.create({
        plan_id: plan._id,
        day_number: dayPlanData.day,
        unlocked: dayPlanData.unlocked || false,
      });

      if (Array.isArray(dayPlanData.tasks)) {
        for (const task of dayPlanData.tasks) {
          await Task.create({
            day_plan_id: createdDayPlan._id,
            user_id: userId,
            task_order: task.order,
            task_type: task.type,
            title: task.title,
            description: task.description,
            completed: task.completed || false,
            completed_at: task.completed ? new Date() : null,
          });

          if (task.completed) {
            imported.tasks++;
          }
        }
      }
    }

    await UserProgress.create({
      user_id: userId,
      plan_id: plan._id,
      current_day: dto.userProgress?.currentDay || 1,
      total_tasks_completed: imported.tasks,
      ai_messages_used: dto.userProgress?.aiMessagesUsed || 0,
      quote_regenerations: dto.userProgress?.quoteRegenerations || 0,
      streak_days: 0,
      last_activity_date: new Date().toISOString().split('T')[0],
    });
  }

  // Import chat messages
  if (dto.chatMessages && dto.chatMessages.length > 0) {
    for (const message of dto.chatMessages) {
      await ChatMessage.create({
        user_id: userId,
        role: message.role,
        content: message.content,
        sender_name: message.senderName,
      });
      imported.messages++;
    }
  }

  // Import quotes
  if (dto.quotes && dto.quotes.length > 0) {
    for (const quote of dto.quotes) {
      await Quote.create({
        user_id: userId,
        text: quote.text,
        author: quote.author,
        category: quote.category || 'emotional',
        niche: 'general',
        is_active: true,
      });
      imported.quotes++;
    }
  }

  return {
    success: true,
    imported,
    message: 'Data migrated successfully. You can now use the app with your existing progress!',
  };
};

module.exports = { importLocalStorage };
