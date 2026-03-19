import type { OnboardingData, DayPlan, Task, HealthyHabit } from '@/types';

const QUIT_TASKS: Record<string, { beginner: string[]; intermediate: string[]; advanced: string[] }> = {
  'doomscrolling': {
    beginner: [
      'Set a 15-minute timer before opening social media',
      'Move social apps to the second page of your phone',
      'Turn off all non-essential notifications',
      'Check your screen time and note the number',
      'Delete one social app you use the least',
    ],
    intermediate: [
      'No phone for the first 30 minutes after waking',
      'Use grayscale mode on your phone all day',
      'Set app limits to 1 hour total for social media',
      'Charge your phone outside your bedroom tonight',
      'Have one phone-free meal today',
    ],
    advanced: [
      'Digital detox: no social media until 5 PM',
      'Delete social media apps (keep web-only access)',
      'Go 4 hours without checking your phone',
      'Spend 2 hours in nature without your phone',
      'Complete a full day with less than 1 hour screen time',
    ],
  },
  'social-media': {
    beginner: [
      'Unfollow 10 accounts that don\'t add value',
      'Turn off all social media notifications',
      'Set a 20-minute limit on your most-used app',
      'Log out of all social apps after each use',
      'Remove social media shortcuts from home screen',
    ],
    intermediate: [
      'Post nothing for 3 days - only observe',
      'Block the explore/discover page with an extension',
      'No social media until lunch time',
      'Mute or unfollow 20 more accounts',
      'Replace 30 mins of scrolling with calling a friend',
    ],
    advanced: [
      'Deactivate one social media account',
      'Full day without any social media',
      'Delete all social apps - use browser only',
      'Go 48 hours without checking any platform',
      'Announce a social media break to friends',
    ],
  },
  'procrastination': {
    beginner: [
      'Write down 3 tasks you\'ve been avoiding',
      'Do a 2-minute version of your hardest task',
      'Set a timer for 15 mins of focused work',
      'Clear your desk of all distractions',
      'Break one big task into 5 smaller steps',
    ],
    intermediate: [
      'Complete your hardest task before noon',
      'Work for 25 mins without any breaks (Pomodoro)',
      'Finish one task you\'ve been avoiding for a week',
      'Plan tomorrow\'s tasks tonight',
      'Say no to one distraction request today',
    ],
    advanced: [
      'Complete 4 focused work sessions today',
      'Finish a project you\'ve been putting off',
      'Work for 2 hours with phone in another room',
      'Clear your entire to-do list for the day',
      'Help someone else overcome their procrastination',
    ],
  },
  'default': {
    beginner: [
      'Identify 3 triggers for your habit',
      'Journal about how this habit affects you',
      'Tell someone about your goal to quit',
      'Remove one thing that enables this habit',
      'Replace the habit with a 5-minute walk',
    ],
    intermediate: [
      'Track every time you feel the urge',
      'Delay acting on the urge by 10 minutes',
      'Find a healthy alternative for when urges hit',
      'Reflect on your progress in a journal',
      'Reward yourself for a full day without the habit',
    ],
    advanced: [
      'Go 24 hours completely habit-free',
      'Teach someone else what you\'ve learned',
      'Create a plan for handling future triggers',
      'Celebrate 1 week of reduced habit',
      'Set a bigger goal for the next 30 days',
    ],
  },
};

const ADOPT_TASKS: Record<HealthyHabit, { beginner: string[]; intermediate: string[]; advanced: string[] }> = {
  reading: {
    beginner: [
      'Read for just 5 minutes today',
      'Pick a book you\'re excited about',
      'Read 10 pages before bed',
    ],
    intermediate: [
      'Read for 20 minutes in the morning',
      'Finish one chapter today',
      'Read instead of scrolling for 30 mins',
    ],
    advanced: [
      'Read for 1 hour today',
      'Start and finish a short book this week',
      'Join an online book club or discussion',
    ],
  },
  workout: {
    beginner: [
      'Do 10 jumping jacks right now',
      'Take a 10-minute walk',
      'Stretch for 5 minutes',
    ],
    intermediate: [
      'Complete a 20-minute home workout',
      'Do 3 sets of push-ups and squats',
      'Walk 5,000 steps today',
    ],
    advanced: [
      'Complete a 45-minute workout',
      'Try a new type of exercise',
      'Exercise first thing in the morning',
    ],
  },
  meditation: {
    beginner: [
      'Sit quietly for 2 minutes',
      'Try a 5-minute guided meditation',
      'Practice 10 deep breaths',
    ],
    intermediate: [
      'Meditate for 10 minutes',
      'Try a body scan meditation',
      'Meditate without any guide for 5 mins',
    ],
    advanced: [
      'Meditate for 20 minutes',
      'Practice meditation twice today',
      'Try a walking meditation',
    ],
  },
  learning: {
    beginner: [
      'Watch a 10-minute educational video',
      'Read one article about something new',
      'Learn 5 new words or concepts',
    ],
    intermediate: [
      'Spend 30 minutes learning a new skill',
      'Complete one lesson in an online course',
      'Practice your new skill for 20 minutes',
    ],
    advanced: [
      'Spend 1 hour on deliberate practice',
      'Teach someone what you learned',
      'Create something using your new skill',
    ],
  },
  journaling: {
    beginner: [
      'Write 3 things you\'re grateful for',
      'Journal for 5 minutes about your day',
      'Write down one goal for tomorrow',
    ],
    intermediate: [
      'Journal for 15 minutes',
      'Write about a challenge and how to solve it',
      'Reflect on your progress this week',
    ],
    advanced: [
      'Write a full page about your feelings',
      'Create a vision for your life in 5 years',
      'Journal about your biggest lessons learned',
    ],
  },
  sleep: {
    beginner: [
      'Set a bedtime alarm for tonight',
      'No screens 30 mins before bed',
      'Prepare your bedroom for sleep',
    ],
    intermediate: [
      'Go to bed 30 minutes earlier',
      'Create a relaxing bedtime routine',
      'No caffeine after 2 PM',
    ],
    advanced: [
      'Wake up at the same time every day',
      'Get 7-8 hours of sleep consistently',
      'Optimize your sleep environment completely',
    ],
  },
  none: {
    beginner: ['Take a 10-minute break to relax'],
    intermediate: ['Spend 20 minutes on self-care'],
    advanced: ['Dedicate 1 hour to yourself today'],
  },
};

function getRandomTasks(tasks: string[], count: number): string[] {
  const shuffled = [...tasks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getDifficulty(day: number): 'beginner' | 'intermediate' | 'advanced' {
  if (day <= 7) return 'beginner';
  if (day <= 20) return 'intermediate';
  return 'advanced';
}

export function generatePlan(data: OnboardingData): DayPlan[] {
  const { addiction, healthyHabit, severity } = data;
  const FREE_DAYS = 3;
  
  const plan: DayPlan[] = [];
  const quitTasksSource = addiction && QUIT_TASKS[addiction] ? QUIT_TASKS[addiction] : QUIT_TASKS.default;
  const adoptTasksSource = healthyHabit && healthyHabit !== 'none' && ADOPT_TASKS[healthyHabit] 
    ? ADOPT_TASKS[healthyHabit] 
    : null;
  
  const usedQuitTasks = new Set<string>();
  const usedAdoptTasks = new Set<string>();
  
  for (let day = 1; day <= 30; day++) {
    const difficulty = getDifficulty(day);
    const tasks: Task[] = [];
    
    // Quit task
    const availableQuitTasks = quitTasksSource[difficulty].filter(t => !usedQuitTasks.has(t));
    const quitTask = availableQuitTasks.length > 0 
      ? availableQuitTasks[Math.floor(Math.random() * availableQuitTasks.length)]
      : quitTasksSource[difficulty][Math.floor(Math.random() * quitTasksSource[difficulty].length)];
    
    usedQuitTasks.add(quitTask);
    
    tasks.push({
      id: `day-${day}-quit`,
      day,
      order: 1,
      type: 'quit',
      title: quitTask,
      description: `Focus task for Day ${day}`,
      completed: false,
    });
    
    // Adopt task (if healthyHabit selected)
    if (adoptTasksSource) {
      const availableAdoptTasks = adoptTasksSource[difficulty].filter(t => !usedAdoptTasks.has(t));
      const adoptTask = availableAdoptTasks.length > 0
        ? availableAdoptTasks[Math.floor(Math.random() * availableAdoptTasks.length)]
        : adoptTasksSource[difficulty][Math.floor(Math.random() * adoptTasksSource[difficulty].length)];
      
      usedAdoptTasks.add(adoptTask);
      
      tasks.push({
        id: `day-${day}-adopt`,
        day,
        order: 2,
        type: 'adopt',
        title: adoptTask,
        description: `Build your new habit`,
        completed: false,
      });
    } else {
      // If no healthy habit, add a self-care task
      const selfCareTasks = [
        'Take 5 minutes to breathe deeply',
        'Drink a full glass of water',
        'Step outside for fresh air',
        'Stretch for 3 minutes',
        'Write one thing you\'re proud of today',
      ];
      tasks.push({
        id: `day-${day}-self-care`,
        day,
        order: 2,
        type: 'adopt',
        title: selfCareTasks[day % selfCareTasks.length],
        description: 'Self-care moment',
        completed: false,
      });
    }
    
    plan.push({
      day,
      tasks,
      unlocked: day <= FREE_DAYS,
    });
  }
  
  return plan;
}
