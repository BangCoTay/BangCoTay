const Plan = require('../models/Plan');
const Task = require('../models/Task');
const DayPlan = require('../models/DayPlan');
const UserProgress = require('../models/UserProgress');

const getProgress = async (userId) => {
  const plan = await Plan.findOne({ user_id: userId, is_active: true });
  if (!plan) return null;

  const progress = await UserProgress.findOne({ user_id: userId, plan_id: plan._id });
  if (!progress) return null;

  const tasks = await Task.find({ user_id: userId }).select('completed');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    currentDay: progress.current_day,
    totalTasksCompleted: completedTasks,
    streakDays: progress.streak_days,
    completionRate: Math.round(completionRate),
    aiMessagesUsed: progress.ai_messages_used,
    quoteRegenerations: progress.quote_regenerations,
    lastActivityDate: progress.last_activity_date,
  };
};

const getAnalytics = async (userId) => {
  const plan = await Plan.findOne({ user_id: userId, is_active: true });
  if (!plan) return null;

  // Get all tasks with day plan info
  const dayPlans = await DayPlan.find({ plan_id: plan._id }).lean();
  const dayPlanMap = {};
  for (const dp of dayPlans) {
    dayPlanMap[dp._id.toString()] = dp.day_number;
  }

  const tasks = await Task.find({ user_id: userId }).lean();

  // Attach day_number to each task
  const tasksWithDay = tasks.map((t) => ({
    ...t,
    day_number: dayPlanMap[t.day_plan_id?.toString()] || 0,
  }));

  // Weekly progress
  const weeklyProgress = [];
  for (let week = 1; week <= 4; week++) {
    const startDay = (week - 1) * 7 + 1;
    const endDay = week * 7;

    const weekTasks = tasksWithDay.filter((t) => t.day_number >= startDay && t.day_number <= endDay);
    const completed = weekTasks.filter((t) => t.completed).length;
    const total = weekTasks.length;

    weeklyProgress.push({
      week,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  // Task completion by type
  const quitTasks = tasksWithDay.filter((t) => t.task_type === 'quit');
  const adoptTasks = tasksWithDay.filter((t) => t.task_type === 'adopt');

  const taskCompletionByType = {
    quit: {
      completed: quitTasks.filter((t) => t.completed).length,
      total: quitTasks.length,
    },
    adopt: {
      completed: adoptTasks.filter((t) => t.completed).length,
      total: adoptTasks.length,
    },
  };

  // Streak history (last 7 days)
  const streakHistory = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayTasks = tasksWithDay.filter(
      (t) => t.completed_at && new Date(t.completed_at).toISOString().split('T')[0] === dateStr
    );

    streakHistory.push({
      date: dateStr,
      tasksCompleted: dayTasks.length,
    });
  }

  return { weeklyProgress, taskCompletionByType, streakHistory };
};

module.exports = { getProgress, getAnalytics };
