const OnboardingData = require('../models/OnboardingData');
const Plan = require('../models/Plan');
const DayPlan = require('../models/DayPlan');
const Task = require('../models/Task');
const UserProgress = require('../models/UserProgress');
const planGenerator = require('./plan-generator.service');
const quotesService = require('./quotes.service');
const chatService = require('./chat.service');

const generatePlan = async (userId, subscriptionTier) => {
  const onboardingData = await OnboardingData.findOne({ user_id: userId });
  if (!onboardingData) {
    const error = new Error('Please complete onboarding before generating a plan');
    error.statusCode = 404;
    throw error;
  }

  const planResult = await planGenerator.generatePlan(userId, onboardingData._id, subscriptionTier);
  
  // Initialize quotes and chat welcome message
  try {
    await quotesService.getQuotes(userId, subscriptionTier);
    await chatService.sendInitialMessage(userId);
  } catch (error) {
    console.error('Error initializing quotes or chat:', error);
    // Move on, don't fail the whole plan generation
  }
  
  return planResult;
};

const getCurrentPlan = async (userId, subscriptionTier = 'free') => {
  const plan = await Plan.findOne({ user_id: userId, is_active: true });
  if (!plan) return null;

  const dayPlans = await DayPlan.find({ plan_id: plan._id }).sort({ day_number: 1 }).lean();

  // Attach tasks to each day plan and force unlock if on a paid plan
  for (const dayPlan of dayPlans) {
    dayPlan.tasks = await Task.find({ day_plan_id: dayPlan._id }).sort({ task_order: 1 }).lean();
    
    // Safety check: if user has a paid plan, allow them to see all 30 days
    // even if the database state hasn't been updated yet due to webhook delays
    if (subscriptionTier && subscriptionTier !== 'free') {
      dayPlan.unlocked = true;
    }
  }

  const progress = await UserProgress.findOne({ plan_id: plan._id });

  return {
    plan,
    dayPlans,
    progress,
  };
};

const getDayPlan = async (userId, planId, dayNumber, subscriptionTier = 'free') => {
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

  // Handle premium unlocking in the response layer
  if (subscriptionTier && subscriptionTier !== 'free') {
    dayPlan.unlocked = true;
  }

  dayPlan.tasks = await Task.find({ day_plan_id: dayPlan._id }).sort({ task_order: 1 }).lean();

  return dayPlan;
};

module.exports = { generatePlan, getCurrentPlan, getDayPlan };
