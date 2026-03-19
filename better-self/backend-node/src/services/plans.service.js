const OnboardingData = require('../models/OnboardingData');
const Plan = require('../models/Plan');
const DayPlan = require('../models/DayPlan');
const Task = require('../models/Task');
const UserProgress = require('../models/UserProgress');
const planGenerator = require('./plan-generator.service');

const generatePlan = async (userId, subscriptionTier) => {
  const onboardingData = await OnboardingData.findOne({ user_id: userId });
  if (!onboardingData) {
    const error = new Error('Please complete onboarding before generating a plan');
    error.statusCode = 404;
    throw error;
  }

  return planGenerator.generatePlan(userId, onboardingData._id, subscriptionTier);
};

const getCurrentPlan = async (userId) => {
  const plan = await Plan.findOne({ user_id: userId, is_active: true });
  if (!plan) return null;

  const dayPlans = await DayPlan.find({ plan_id: plan._id }).sort({ day_number: 1 }).lean();

  // Attach tasks to each day plan
  for (const dayPlan of dayPlans) {
    dayPlan.tasks = await Task.find({ day_plan_id: dayPlan._id }).sort({ task_order: 1 }).lean();
  }

  const progress = await UserProgress.findOne({ plan_id: plan._id });

  return {
    plan,
    dayPlans,
    progress,
  };
};

const getDayPlan = async (userId, planId, dayNumber) => {
  const plan = await Plan.findOne({ _id: planId, user_id: userId });
  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }

  const dayPlan = await DayPlan.findOne({ plan_id: planId, day_number: dayNumber }).lean();
  if (!dayPlan) {
    const error = new Error('Day plan not found');
    error.statusCode = 404;
    throw error;
  }

  dayPlan.tasks = await Task.find({ day_plan_id: dayPlan._id }).sort({ task_order: 1 }).lean();

  return dayPlan;
};

module.exports = { generatePlan, getCurrentPlan, getDayPlan };
