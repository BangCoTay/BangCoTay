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
  day: number;
  order: number;
  type: 'quit' | 'adopt';
  title: string;
  description: string;
  completed: boolean;
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
  timestamp: Date;
  senderName?: string;
}

export interface Quote {
  id: string;
  text: string;
  author?: string;
  category: 'emotional' | 'practical';
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
  completedTasks: string[];
  aiMessagesUsed: number;
  quoteRegenerations: number;
  subscriptionTier: 'free' | 'starter' | 'premium';
}

export const NICHES: { id: Niche; label: string; icon: string; color: string }[] = [
  { id: 'digital', label: 'Digital Addiction', icon: '📱', color: 'from-blue-500 to-cyan-500' },
  { id: 'mental', label: 'Mental Health', icon: '🧠', color: 'from-purple-500 to-pink-500' },
  { id: 'study', label: 'Study / Focus', icon: '📚', color: 'from-amber-500 to-orange-500' },
  { id: 'health', label: 'Physical Health', icon: '🏃', color: 'from-green-500 to-emerald-500' },
  { id: 'food', label: 'Food / Sugar', icon: '🍔', color: 'from-red-500 to-rose-500' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: 'from-indigo-500 to-violet-500' },
];

export const ADDICTIONS: AddictionType[] = [
  // Digital
  { id: 'doomscrolling', label: 'Doomscrolling', niche: 'digital' },
  { id: 'social-media', label: 'Social Media', niche: 'digital' },
  { id: 'porn', label: 'Porn', niche: 'digital' },
  { id: 'youtube-tiktok', label: 'YouTube / TikTok', niche: 'digital' },
  { id: 'late-night-phone', label: 'Late-night Phone Use', niche: 'digital' },
  // Mental
  { id: 'overthinking', label: 'Overthinking', niche: 'mental' },
  { id: 'anxiety', label: 'Anxiety Spirals', niche: 'mental' },
  { id: 'negative-self-talk', label: 'Negative Self-Talk', niche: 'mental' },
  // Study
  { id: 'procrastination', label: 'Procrastination', niche: 'study' },
  { id: 'distraction', label: 'Easy Distraction', niche: 'study' },
  { id: 'cramming', label: 'Last-minute Cramming', niche: 'study' },
  // Health
  { id: 'sedentary', label: 'Sedentary Lifestyle', niche: 'health' },
  { id: 'poor-sleep', label: 'Poor Sleep Habits', niche: 'health' },
  { id: 'skipping-exercise', label: 'Skipping Exercise', niche: 'health' },
  // Food
  { id: 'sugar', label: 'Sugar Addiction', niche: 'food' },
  { id: 'binge-eating', label: 'Binge Eating', niche: 'food' },
  { id: 'junk-food', label: 'Junk Food', niche: 'food' },
  // Gaming
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

export type Persona = 'coach' | 'friend' | 'family' | 'girlfriend';

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

export const GIRLFRIEND_MESSAGES = [
  "I knew you could do it! So proud of you ❤️",
  "You're amazing, keep going! 💕",
  "My favorite person doing amazing things! 🥰",
  "You make me so happy watching you grow! 😍",
  "This is why I believe in you! Go you! 🌟",
  "Your dedication is inspiring, baby! 💖",
  "One step at a time, and you're crushing it! 🎯",
  "I'm so lucky to have someone this determined! 😘",
  "Your progress makes my heart full! ❤️",
  "Keep being incredible, my love! ✨",
  "You make everything look so easy! I'm impressed! 😎",
  "Seeing you succeed is the best feeling ever! 🥹",
  "This is just the beginning - you're unstoppable! 🚀",
  "I'm rooting for you every single day! 🙌",
  "Your hard work is paying off, I can see it! 💯",
  "You inspire me to be better too! 🌈",
  "Such a strong person - I'm in awe! 💪",
  "Every small victory matters, and you're winning! 🏆",
  "The way you keep going is amazing! 🔥",
  "I love watching you become the best version of yourself! 💗",
  "You have no idea how proud I am right now! 🎉",
  "This is hot - watching you work so hard! 😏",
  "Stay focused, stay strong, you've got this! ⭐",
  "My personal champion! 🏅",
  "You're making dreams happen, baby! ✨",
  "This dedication is sexy! 😘",
  "My heart is so full watching you succeed! 💕",
  "You make impossible things look easy! 👏",
  "I've always known you had it in you! 🌟",
  "Keep that fire burning, love! 🔥",
  "You're proving everyone wrong, I'm so here for it! 💪",
  "My favorite human is absolutely crushing it! 😍",
  "The world better watch out for you! 🌍",
  "Your ambition turns me on! 😏",
  "Look at you go, unstoppable! 🚀",
  "I'm here for every victory, big or small! 🥰",
  "This is the version of you I always knew existed! ✨",
  "You're not just doing this - you're owning it! 👑",
  "My hero! 🦸‍♀️",
  "Such a boss! I love it! 🔥",
  "You're rewriting your story, and it's beautiful! 📖",
  "This is what I call level up! 🎮",
  "You're the definition of strength! 💎",
  "I believe in you more than ever! 🙌",
  "You're making it look so good! 😎",
  "My whole heart is in this for you! ❤️",
  "Watch the magic happen! ✨",
  "You are exactly where you need to be! 🧭",
  "This is your moment - own it! 📸",
  "I'm so grateful to watch this journey! 🙏",
  "You inspire me every single day! 🌅",
  "This is just the start of something amazing! 🌠",
  "Your potential is beyond anything you know! 💫",
  "Keep showing up for yourself, it's working! 💯",
  "I adore your determination! 😘",
  "Every day you're closer to your goals! 🎯",
  "You're a natural winner! 🏆",
  "My favorite success story! 📚",
  "This is what I call raw talent + hard work! 🔥",
  "You're making waves! 🌊",
  "I'm obsessed with your progress! 😍",
  "You're the whole package - brains, heart, drive! 💯",
  "This journey is so worth it, I can tell! 🛤️",
  "You're exactly who you're supposed to be! 🎯",
  "Nothing can stop you now! 🚫",
  "My favorite person in the world is changing lives! 🌍",
  "You make my heart sing! 🎵",
  "Watch you shatter every expectation! 💥",
  "I'm here for the ride - it's going to be epic! 🎢",
  "You're the blueprint for success! 📐",
  "This is your era, embrace it! 👑",
  "My motivation comes from watching you! 🔋",
  "You make being ambitious look so good! 😎",
  "We're going to celebrate so hard later! 🥳",
  "You're the definition of women who hustle! 💪",
  "This is your year, I can feel it! 📅",
  "Every single step forward matters! 👣",
  "You're creating the life you've always wanted! 🏡",
  "My biggest cheerleader is right here! 📣",
  "I love seeing you in your element! ✨",
  "You're the reason dreams still exist! 🌙",
  "Hard work looks so good on you! 👠",
  "This is the kind of content I live for! 📱",
  "You're proof that anything is possible! ✨",
  "My entire energy shifts when you're winning! ⚡",
  "You've already won - this is just the confirmation! 🏅",
  "I'm so attracted to your discipline! 😏",
  "Keep being that girl! 💃",
  "You're unstoppable and it's incredible! 🔥",
  "This is what happens when you trust the process! 📈",
  "My person is winning and I'm here for it! 🥰",
  "You're the standard! 📏",
  "Such an incredible human being! 🌟",
  "I've got my eyes on you, and I'm impressed! 👀",
  "Your glow up is showing! ✨",
  "This is what success looks like! 📸",
  "I'm taking notes on how you do it! 📝",
  "You're the main character! 🎬",
];

export const FRIEND_MESSAGES = [
  "Bro, you're actually doing this! 🔥",
  "Let's gooo! Keep that streak! 💪",
  "You're built different fr fr 🚀",
  "Bro that next level energy! 🎮",
  "You're making moves, I respect that! 🙌",
  "Gotta say, you're holding it down! 💯",
  "This is your year bro, I can feel it! 🌟",
  "One more down, you're unbeatable! 🏆",
  "Bro you're on fire! Keep it burning! 🔥",
  "That's what I like to see! 💪",
  "You're making everyone proud fr! 👏",
  "The grind is showing, respect! ⚡",
  "Bro you're built for this! 💎",
  "That's a W in my book! 📖",
  "Keep that same energy! ✨",
  "You're showing out fr! 🌟",
  "This is the way! 🛤️",
  "You're about to blow up! 💥",
  "Real ones see the work you're putting in! 👀",
  "Don't stop now, you're too close! 🎯",
  "You're making moves, keep going! 🚀",
  "This is your moment bro, own it! 📸",
  "You're the definition of consistency! 💪",
  "Watchu been up to? Winning! 🏅",
  "You're on another level fr! 🧬",
  "This is just the beginning, trust me! 🌅",
  "You're that guy now! 👑",
  "I'm taking notes, you're unstoppable! 📝",
  "The discipline is crazy, respect! 🙌",
  "You're making it happen! 💯",
  "Don't nobody hold you back! 🚫",
  "You're built for this lifestyle! 🏋️",
  "Real talk, you're inspiring me too! 🔥",
  "You're putting in work and it shows! 💪",
  "This is what winning looks like! 🎉",
  "You're the example now! 📚",
  "Watch you dominate this year! 🏆",
  "That next step is waiting for you! 👣",
  "You're going places, I see it! ✈️",
  "The vibe shift is real! 🌊",
  "You're locked in, that's facts! 🔒",
  "Nothing can stop this momentum! 🛑",
  "You're setting the standard! 📏",
  "This the version I knew you had! 💡",
  "You're the blueprint! 🗺️",
  "You're about to eat, trust! 🍽️",
  "Bro you're so back! 🔙",
  "This is what I call a glow up! ✨",
  "You deserve all the flowers! 💐",
  "The work is paying off, look at you! 💰",
  "You're proving everyone wrong! 👊",
  "This the flex we needed! 💪",
  "You're in your bag right now! 👜",
  "That drive is unmatched! 🏎️",
  "You're building something real! 🏗️",
  "This is your season, no cap! 🥬",
  "You're so far ahead now! 🏃",
  "I see you winning fr! 🏆",
  "This is growth, embrace it! 🌱",
  "Your consistency is crazy! 🎯",
  "You're the early bird that catches the worm! 🐦",
  "This is your time, don't waste it! ⏰",
  "You're building that legacy! 🏛️",
  "The vibes are immaculate! ✨",
  "You're going to make it, I know! 🎯",
  "This the type of content I love to see! 📱",
  "You're in your era now! 🎤",
  "Real ones know you been putting in work! 🙌",
  "This is what happens when you don't quit! 🔁",
  "You're the main character of your story! 🎬",
  "The universe is rewarding your grind! 🌌",
  "This is growth in real time! 📈",
  "You're unstoppable once you start! ▶️",
  "This is the best version of you! 🌟",
  "You're living the dream! 💭",
  "This is what I call a power move! ⚡",
  "You're leveling up so fast! ⬆️",
  "This is history in the making! 📜",
  "You're the wave, embrace it! 🌊",
  "This is the content we needed! 📱",
  "Your glow is contagious! ✨",
  "This is what I call excellence! 🏅",
  "You're a certified baller now! 🏀",
  "This is your world, we just living in it! 🌍",
  "You're running this thing! 🏃‍♂️",
  "This is the win we needed! 🎊",
  "You're executing at a high level! 🎯",
  "This is legendary behavior! 📚",
  "You're out here winning! 🏆",
  "This is the move! ♟️",
  "You're making that money! 💵",
  "This is the flex! 💪",
  "You're in beast mode! 🦁",
  "This is the way to do it! 🛤️",
  "You're absolutely killing it! 🔥",
  "This is the energy we need! ⚡",
  "You're winning in silence! 🤫",
  "This is big brain moves! 🧠",
];

export const FAMILY_MESSAGES = [
  "We're so proud of you! Keep it up! 🙏",
  "You're making great progress, sweetheart! ❤️",
  "The whole family is cheering for you! 🎉",
  "We always knew you had it in you! 🌟",
  "This makes our hearts so full! 🥰",
  "You're making us all proud, dear! 👨‍👩‍👧",
  "Such determination, we admire that! 💪",
  "You've always been so strong! 💎",
  "This is what we hoped for you! 🎯",
  "Our family is so lucky to have you! 🍀",
  "Watching you grow is our joy! 🌱",
  "You make our family shine! ✨",
  "Keep going, we're right behind you! 👏",
  "This is just the beginning, we can feel it! 🌅",
  "Your hard work is inspiring us all! 🔥",
  "We believe in you completely! 💯",
  "You're making your ancestors proud! 🙏",
  "This is a beautiful journey to watch! 🌈",
  "Our family is stronger because of you! 💪",
  "You're proving that dreams come true! ⭐",
  "We love seeing you succeed! ❤️",
  "This is what family is all about! 👨‍👩‍👧",
  "You're our shining example! 🌟",
  "Keep pushing, we're with you! 🙌",
  "This is the path to greatness! 🛤️",
  "We knew you could do it all along! 💖",
  "You're building something amazing! 🏗️",
  "Our love grows with every win! 💕",
  "This is your moment to shine! ✨",
  "We're your biggest fans! 📣",
  "You've always made us proud! 🥹",
  "This is what perseverance looks like! 🏃",
  "We support you 100%! 💯",
  "You're the pride of our family! 👑",
  "This journey is beautiful to watch! 🌺",
  "We see all the effort you're putting in! 👀",
  "Your success is our success! 🎉",
  "This is a milestone worth celebrating! 🥂",
  "We're all in this together! 🤝",
  "You make our family story so special! 📖",
  "This is the reward for your dedication! 🏆",
  "We respect your commitment so much! 🙌",
  "You're creating a legacy! 🏛️",
  "This is what love in action looks like! ❤️",
  "We're behind you every step! 👣",
  "You bring so much joy to our family! 🎊",
  "This is exactly what you needed! 💡",
  "We celebrate every small victory with you! 🥳",
  "Your strength inspires us daily! 💪",
  "This is your time to shine, honey! 🌟",
  "We couldn't be happier for you! 😄",
  "You're showing us all what's possible! 🌈",
  "This is the result of your courage! 🦁",
  "We trust your journey completely! 🧭",
  "You're the best thing in our lives! 💖",
  "This is a moment to treasure forever! 📸",
  "We love you more with each accomplishment! 💕",
  "You're making our family dream come true! 🌙",
  "This is what hope looks like! 🌅",
  "We stand tall because of you! 🏔️",
  "Your progress is our greatest joy! 🥰",
  "This is the journey of a champion! 🏅",
  "We admire your resilience so much! 💎",
  "You're our everyday hero! 🦸",
  "This is the power of family love! ⚡",
  "We know you can achieve anything! 🌠",
  "Your success story is our favorite! 📚",
  "This is the moment we've waited for! ⏰",
  "We're crying happy tears right now! 🥹",
  "You light up our family name! ✨",
  "This is your destiny unfolding! 🌟",
  "We believe in your power! 🔋",
  "You're the reason we smile every day! 😊",
  "This is everything we wanted for you! 🎁",
  "We bow to your dedication! 🙏",
  "You're our greatest blessing! 🎀",
  "This is the beauty of perseverance! 🌸",
  "We cheer for you louder than ever! 🔊",
  "Your heart is in the right place! 💖",
  "This is your story of triumph! 🏆",
  "We stand amazed by your strength! 😲",
  "You're the glue that holds us together! 🧩",
  "This is the best day ever! 🌞",
  "We celebrate the person you've become! 🎭",
  "You're the light of our family! 💡",
  "This is a victory for the ages! 📜",
  "We love watching you thrive! 🌿",
  "Your journey is our inspiration! 💫",
  "This is everything you deserve! ✨",
  "We hold you close in our hearts! ❤️",
  "You're proof that dreams come true! ⭐",
  "This is the chapter you earned! 📖",
  "We are so grateful for you! 🙏",
  "You're our greatest achievement! 🏆",
];
