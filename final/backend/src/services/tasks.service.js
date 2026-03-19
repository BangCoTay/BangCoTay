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
    // Find day plans matching the day number
    const dayPlans = await DayPlan.find({ day_number: dayNumber }).select('_id').lean();
    const dayPlanIds = dayPlans.map((dp) => dp._id);
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

const completeTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user_id: userId }).populate(
    'day_plan_id',
    'unlocked plan_id'
  );

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  if (!task.day_plan_id.unlocked) {
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

    return {
      task,
      progress: {
        totalTasksCompleted: progress.total_tasks_completed,
        streakDays: newStreak,
      },
      streakUpdated: newStreak > progress.streak_days - 1,
      celebrationMessage: allCompleted
        ? `Amazing! You completed all tasks for today! Streak: ${newStreak} days`
        : null,
    };
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
