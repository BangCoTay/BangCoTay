const Task = require('../models/Task');
const DayPlan = require('../models/DayPlan');
const UserProgress = require('../models/UserProgress');

const getTasks = async (userId, dayNumber, completed) => {
  const filter = { user_id: userId };

  if (completed !== undefined) {
    filter.completed = completed;
  }

  let tasks;

  if (dayNumber !== undefined) {
    // Find the active plan for this user and day plans matching the day number
    const activePlan = await require('../models/Plan').findOne({
      user_id: userId,
      is_active: true,
    }).select('_id');

    if (!activePlan) {
      return [];
    }

    const dayPlans = await DayPlan.find({
      plan_id: activePlan._id,
      day_number: dayNumber,
    })
      .select('_id')
      .lean();

    const dayPlanIds = dayPlans.map((dp) => dp._id);
    if (dayPlanIds.length === 0) {
      return [];
    }

    filter.day_plan_id = { $in: dayPlanIds };
  }

  tasks = await Task.find(filter)
    .sort({ task_order: 1 })
    .populate('day_plan_id', 'day_number unlocked')
    .lean();

  // Reshape to match original API format
  return tasks.map((t) => ({
    ...t,
    day_plans: t.day_plan_id
      ? { day_number: t.day_plan_id.day_number, unlocked: t.day_plan_id.unlocked }
      : null,
  }));
};

const completeTask = async (userId, taskId, subscriptionTier) => {
  const task = await Task.findOne({ _id: taskId, user_id: userId }).populate(
    'day_plan_id',
    'unlocked plan_id'
  );

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const isPaidUser = subscriptionTier && subscriptionTier !== 'free';

  if (!task.day_plan_id.unlocked && !isPaidUser) {
    const error = new Error('This day is locked. Upgrade to unlock more days.');
    error.statusCode = 403;
    throw error;
  }

  if (task.completed) {
    return { task, message: 'Task already completed' };
  }

  task.completed = true;
  task.completed_at = new Date();
  await task.save();

  const progress = await UserProgress.findOne({
    plan_id: task.day_plan_id.plan_id,
    user_id: userId,
  });

  if (progress) {
    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = progress.last_activity_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = progress.streak_days;

    if (lastActivityDate === yesterdayStr) {
      newStreak += 1;
    } else if (lastActivityDate !== today) {
      newStreak = 1;
    }

    progress.total_tasks_completed += 1;
    progress.streak_days = newStreak;
    progress.last_activity_date = today;
    await progress.save();

    // Check if all daily tasks are completed
    const dayTasks = await Task.find({ day_plan_id: task.day_plan_id._id }).select('completed');
    const allCompleted = dayTasks.every((t) => t.completed);

    // Pick celebration messages
    const { CELEBRATION_MESSAGES } = require('../constants/celebration-messages');
    const isPremium = subscriptionTier === 'premium';
    
    // Choose a random coach message
    const coachMessages = CELEBRATION_MESSAGES.coach;
    const coachCelebration = coachMessages[Math.floor(Math.random() * coachMessages.length)];

    // Generate chat messages
    try {
      const ChatMessage = require('../models/ChatMessage');
      const OnboardingData = require('../models/OnboardingData');
      const onboarding = await OnboardingData.findOne({ user_id: userId }).select('niche');
      const { COACHES } = require('../constants/coaches');
      const coach = onboarding?.niche ? COACHES[onboarding.niche] : COACHES.health;

      // 1. Assistant (Coach) Message - Always sent
      await ChatMessage.create({
        user_id: userId,
        role: 'assistant',
        content: coachCelebration,
        sender_name: coach.name,
      });

      let companionMessages = [];

      // 2. Extra Persona Messages - Only for premium
      if (isPremium) {
        // Friend Message
        const friendMessages = CELEBRATION_MESSAGES.friend;
        const friendMsg = friendMessages[Math.floor(Math.random() * friendMessages.length)];
        await ChatMessage.create({
          user_id: userId,
          role: 'friend',
          content: friendMsg,
          sender_name: 'Best Friend',
        });
        companionMessages.push({ role: 'friend', content: friendMsg, name: 'Best Friend' });

        // Family Message
        const familyMessages = CELEBRATION_MESSAGES.family;
        const familyMsg = familyMessages[Math.floor(Math.random() * familyMessages.length)];
        await ChatMessage.create({
          user_id: userId,
          role: 'family',
          content: familyMsg,
          sender_name: 'Family Member',
        });
        companionMessages.push({ role: 'family', content: familyMsg, name: 'Family Member' });

        // Girlfriend (Sweetheart) Message
        const gfMessages = CELEBRATION_MESSAGES.girlfriend;
        const gfMsg = gfMessages[Math.floor(Math.random() * gfMessages.length)];
        await ChatMessage.create({
          user_id: userId,
          role: 'girlfriend',
          content: gfMsg,
          sender_name: 'Sweetheart',
        });
        companionMessages.push({ role: 'girlfriend', content: gfMsg, name: 'Sweetheart' });
      }
      
      const response = {
        task,
        progress: {
          totalTasksCompleted: progress.total_tasks_completed,
          streakDays: newStreak,
        },
        streakUpdated: newStreak > progress.streak_days - 1,
        celebrationMessage: coachCelebration,
      };

      if (isPremium) {
        response.companionMessages = companionMessages;
      }
      
      return response;
    } catch (chatError) {
      console.error('Failed to create celebration chat messages:', chatError);
    }
  }

  return { task, message: 'Task completed successfully' };
};

const uncompleteTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user_id: userId });
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  task.completed = false;
  task.completed_at = null;
  await task.save();

  return { task, message: 'Task marked as incomplete' };
};

module.exports = { getTasks, completeTask, uncompleteTask };
