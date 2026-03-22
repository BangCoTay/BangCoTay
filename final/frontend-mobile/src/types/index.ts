export type Niche = 'digital' | 'mental' | 'study' | 'health' | 'food' | 'gaming';

export type AddictionType = {
  id: string;
  label: string;
  niche: Niche;
};

export type Severity = 'mild' | 'moderate' | 'severe';

export type PainPoint = 'time' | 'energy' | 'confidence' | 'sleep' | 'relationships' | 'money';

export interface OnboardingData {
  niche: Niche | null;
  addiction: string | null;
  severity: Severity | null;
  painPoints: PainPoint[];
}

export interface Task {
  id: string;
  dayNumber: number;
  order: number;
  type: 'quit' | 'adopt';
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface DayPlan {
  day: number;
  tasks: Task[];
  unlocked: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'girlfriend' | 'friend' | 'family';
  content: string;
  createdAt: string;
  senderName?: string;
  model?: string;
  tokensUsed?: number;
}

export interface Quote {
  id: string;
  content: string;
  category: 'emotional' | 'practical';
  isActive: boolean;
  createdAt: string;
}

export interface CoachInfo {
  name: string;
  title: string;
  niche: Niche;
  avatar: string;
  greeting: string;
}

export interface UserProgress {
  currentDay: number;
  totalTasksCompleted: number;
  streakDays: number;
  completionRate: number;
  aiMessagesUsed: number;
  quoteRegenerations: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'starter' | 'premium';
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface UserSubscriptionInfo {
  tier: 'free' | 'starter' | 'premium';
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  features: {
    daysUnlocked: number;
    aiMessagesTotal: number | null;
    aiMessagesPerDay: number | null;
    quoteRegenerationsPerDay: number | null;
    hasAICompanion: boolean;
  };
}

export type Persona = 'coach' | 'friend' | 'family' | 'girlfriend';

export const NICHES: { id: Niche; label: string; icon: string; color: string }[] = [
  { id: 'digital', label: 'Digital Addiction', icon: '📱', color: '#3B82F6' },
  { id: 'mental', label: 'Mental Health', icon: '🧠', color: '#A855F7' },
  { id: 'study', label: 'Study / Focus', icon: '📚', color: '#F59E0B' },
  { id: 'health', label: 'Physical Health', icon: '🏃', color: '#22C55E' },
  { id: 'food', label: 'Food / Sugar', icon: '🍔', color: '#EF4444' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: '#6366F1' },
];

export const ADDICTIONS: AddictionType[] = [
  { id: 'doomscrolling', label: 'Doomscrolling', niche: 'digital' },
  { id: 'social-media', label: 'Social Media', niche: 'digital' },
  { id: 'porn', label: 'Porn', niche: 'digital' },
  { id: 'youtube-tiktok', label: 'YouTube / TikTok', niche: 'digital' },
  { id: 'late-night-phone', label: 'Late-night Phone Use', niche: 'digital' },
  { id: 'overthinking', label: 'Overthinking', niche: 'mental' },
  { id: 'anxiety', label: 'Anxiety Spirals', niche: 'mental' },
  { id: 'negative-self-talk', label: 'Negative Self-Talk', niche: 'mental' },
  { id: 'procrastination', label: 'Procrastination', niche: 'study' },
  { id: 'distraction', label: 'Easy Distraction', niche: 'study' },
  { id: 'cramming', label: 'Last-minute Cramming', niche: 'study' },
  { id: 'sedentary', label: 'Sedentary Lifestyle', niche: 'health' },
  { id: 'poor-sleep', label: 'Poor Sleep Habits', niche: 'health' },
  { id: 'skipping-exercise', label: 'Skipping Exercise', niche: 'health' },
  { id: 'sugar', label: 'Sugar Addiction', niche: 'food' },
  { id: 'binge-eating', label: 'Binge Eating', niche: 'food' },
  { id: 'junk-food', label: 'Junk Food', niche: 'food' },
  { id: 'excessive-gaming', label: 'Excessive Gaming', niche: 'gaming' },
  { id: 'rage-quitting', label: 'Rage / Tilting', niche: 'gaming' },
  { id: 'gaming-over-sleep', label: 'Gaming Over Sleep', niche: 'gaming' },
];

export const PAIN_POINTS: { id: PainPoint; label: string; icon: string }[] = [
  { id: 'time', label: 'Time', icon: '⏰' },
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'confidence', label: 'Confidence', icon: '💎' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'relationships', label: 'Relationships', icon: '❤️' },
  { id: 'money', label: 'Money', icon: '💰' },
];

export const COACHES: Record<Niche, CoachInfo> = {
  digital: {
    name: 'Alex',
    title: 'AI Digital Wellness Coach',
    niche: 'digital',
    avatar: '🤖',
    greeting: "Hey! I'm Alex, your Digital Wellness Coach. I know how hard it is to unplug in a world that's always online. But you've taken the first step, and that's huge. I'm here for every step after. What's on your mind?",
  },
  mental: {
    name: 'Luna',
    title: 'AI Mind Coach',
    niche: 'mental',
    avatar: '🌙',
    greeting: "Hi there. I'm Luna, your Mind Coach. The fact that you're here shows incredible self-awareness. Your mental health matters, and I'm here to help you build a calmer, stronger mind. How are you feeling today?",
  },
  study: {
    name: 'Max',
    title: 'AI Focus Coach',
    niche: 'study',
    avatar: '🎯',
    greeting: "What's up! I'm Max, your Focus Coach. Procrastination and distraction? Been there. But in the next 30 days, we're going to rewire how you work. Ready to become unstoppable?",
  },
  health: {
    name: 'Antony',
    title: 'AI Health Coach',
    niche: 'health',
    avatar: '💪',
    greeting: "Hey champion! I'm Antony, your Health Coach. Building healthy habits isn't about perfection—it's about progress. I'll be with you every day for the next 30 days. Let's do this together!",
  },
  food: {
    name: 'Mia',
    title: 'AI Nutrition Coach',
    niche: 'food',
    avatar: '🥗',
    greeting: "Hi! I'm Mia, your Nutrition Coach. Food should fuel you, not control you. Over the next 30 days, we'll rebuild your relationship with eating. No judgment, just support. What's your biggest struggle?",
  },
  gaming: {
    name: 'Kai',
    title: 'AI Balance Coach',
    niche: 'gaming',
    avatar: '🎮',
    greeting: "Yo! I'm Kai, your Balance Coach. Gaming is awesome, but not when it takes over. Let's find that sweet spot where you can enjoy games AND crush it in real life. Ready to level up?",
  },
};

export const PERSONAS: Record<Persona, { name: string; title: string; avatar: string; description: string }> = {
  coach: {
    name: 'AI Coach',
    title: 'Your personal coach',
    avatar: '🤖',
    description: 'Chat with your AI coach anytime',
  },
  friend: {
    name: 'Best Friend',
    title: 'Your hype squad',
    avatar: '👫',
    description: 'Your friend sends encouragement when you complete tasks',
  },
  family: {
    name: 'Family',
    title: 'Your support system',
    avatar: '👨‍👩‍👧',
    description: 'Your family celebrates your progress',
  },
  girlfriend: {
    name: 'Sweetheart',
    title: 'Your biggest fan',
    avatar: '💕',
    description: 'Your partner cheers you on every step',
  },
};

export const CONGRATULATION_MESSAGES = [
  "🎉 Amazing work! Small wins compound fast.",
  "🔥 You showed up today. That's what champions do.",
  "💪 One step closer to the person you want to become!",
  "⭐ Discipline today buys freedom tomorrow. Keep going!",
  "🚀 You're building momentum. Nothing can stop you now!",
  "✨ Progress, not perfection. And you're making progress!",
  "🏆 Another task crushed! Your future self is grateful.",
  "💎 Consistency is your superpower. You're proving it!",
];
