const OnboardingData = require('../models/OnboardingData');
const User = require('../models/User');

const createOnboarding = async (userId, dto) => {
  const existing = await OnboardingData.findOne({ user_id: userId });

  if (existing) {
    existing.niche = dto.niche;
    existing.addiction = dto.addiction;
    existing.severity = dto.severity;
    existing.pain_points = dto.painPoints;
    existing.healthy_habit = dto.healthyHabit;
    existing.completed_at = new Date();
    await existing.save();

    await User.findByIdAndUpdate(userId, { onboarding_completed: true });

    return { onboardingData: existing, planGenerated: false };
  }

  const onboardingData = await OnboardingData.create({
    user_id: userId,
    niche: dto.niche,
    addiction: dto.addiction,
    severity: dto.severity,
    pain_points: dto.painPoints,
    healthy_habit: dto.healthyHabit,
  });

  await User.findByIdAndUpdate(userId, { onboarding_completed: true });

  return {
    onboardingData,
    planGenerated: false,
    message: 'Onboarding completed. Please generate your plan.',
  };
};

const getOnboarding = async (userId) => {
  const data = await OnboardingData.findOne({ user_id: userId });
  return data || null;
};

module.exports = { createOnboarding, getOnboarding };
