import type { OnboardingData, DayPlan, Task } from '@/types';

const QUIT_TASKS: Record<string, { beginner: string[]; intermediate: string[]; advanced: string[] }> = {
  'doomscrolling': {
    beginner: [
      'Set a 15-minute timer before opening social media',
      'Move social apps to the second page of your phone',
      'Turn off all non-essential notifications',
      'Check your screen time and note the number',
      'Delete one social app you use the least',
      'Disable pull-to-refresh on your most-used app',
      'Use a physical alarm clock instead of your phone',
      'Keep your phone in another room during meals',
      'Set your screen to grayscale for social apps',
      'Unfollow 5 accounts that trigger your scrolling',
      'Read 2 pages of a book when the urge to scroll hits',
      'Walk away from your phone for 10 minutes',
      'Move all scrolling apps into a single "Hidden" folder',
      'Use Do Not Disturb mode for 1 hour during work',
      'Disable "Raise to Wake" on your phone settings',
    ],
    intermediate: [
      'No phone for the first 30 minutes after waking',
      'Use grayscale mode on your phone all day',
      'Set app limits to 1 hour total for social media',
      'Charge your phone outside your bedroom tonight',
      'Have one phone-free meal today',
      'No phone use in the bathroom today',
      'Delete TikTok or Reels for 48 hours',
      'Leave your phone in a drawer while watching a movie',
      'Unsubscribe from 10 marketing or "news" emails',
      'Disable autoplay on all video platforms',
      'Set a specific 20-minute window for scrolling today',
      'Journal for 5 minutes about why you feel the urge to scroll',
      'Try a "Digital Sunset" - no screens after 9 PM',
      'Go for a 15-minute walk without your phone',
      'Turn off Background App Refresh for all social apps',
      'Spend 30 minutes on a hobby without any screens',
      'Mute all group chats that are not essential',
      'Delete social media apps for the entire weekend',
      'Use a browser extension to block infinite feed',
      'Call a friend instead of watching their stories',
    ],
    advanced: [
      'Digital detox: no social media until 5 PM',
      'Delete social media apps (keep web-only access)',
      'Go 4 hours without checking your phone',
      'Spend 2 hours in nature without your phone',
      'Complete a full day with less than 1 hour screen time',
      'Deactivate one social media account temporarily',
      'No phone use for the first 2 hours of your day',
      'Complete a 24-hour total digital fast',
      'Delete all apps that have a pull-to-refresh feed',
      'Uninstall all social media from your primary phone',
      'Go to a social event and leave your phone in the car',
      'Spend a full workday with your phone powered off',
      'Write a letter to your future self about your progress',
      'Remove your phone from your workspace completely',
      'Go an entire day without taking a single photo',
    ],
  },
  'social-media': {
    beginner: [
      "Unfollow 10 accounts that don't add value",
      'Turn off all social media notifications',
      'Set a 20-minute limit on your most-used app',
      'Log out of all social apps after each use',
      'Remove social media shortcuts from home screen',
      'Move social apps to the very last page',
      'Set a 15-minute timer before opening an app',
      'Clear your social media search history',
      'Delete one app you haven\'t used in a month',
      'Disable notifications for likes and comments',
      'Don\'t check social media while waiting in line',
      'Mute 5 people whose posts stress you out',
      'Spend 10 mins reading a physical book instead',
      'Put your phone on airplane mode during focus hours',
      'Try a different morning routine without social media',
    ],
    intermediate: [
      'Post nothing for 3 days - only observe',
      'Block the explore/discover page with an extension',
      'No social media until lunch time',
      'Mute or unfollow 20 more accounts',
      'Replace 30 mins of scrolling with calling a friend',
      'No phone for the first hour of your day',
      'Delete all social apps and use browser only',
      'Have a full day without any social media posts',
      'Charge your phone in a common area at night',
      'Go 48 hours without checking any platform',
      'Set your phone to grayscale mode for 24 hours',
      'Spend an hour outside without your phone',
      'Delete an app you spend more than 2 hours on',
      'Tell a friend about your social media goals',
      'Write down 3 things you want to achieve without social media',
      'Clean up your "Following" list - aim for -50 people',
      'Uninstall social media for the weekend',
      'Disable "Save to Camera Roll" for apps',
      'Block one platform entirely on your laptop',
      'Go one meal with zero phone contact',
    ],
    advanced: [
      'Deactivate one social media account',
      'Full day without any social media',
      'Delete all social apps - use browser only',
      'Go 48 hours without checking any platform',
      'Announce a social media break to friends',
      'Complete a 7-day social media detox',
      'Limit screen time to under 45 minutes today',
      'Replace all social media usage with a new skill',
      'Remove all biographical info from your profiles',
      'Stop using social media as your primary news source',
      'Go one week with only 30 mins of social media daily',
      'Reflect deeply on who you are without your online persona',
      'Delete all social media accounts you don\'t strictly need',
      'Help someone else reduce their social media usage',
      'Establish a "No Social Media" zone in your home',
    ],
  },
  'procrastination': {
    beginner: [
      "Write down 3 tasks you've been avoiding",
      'Do a 2-minute version of your hardest task',
      'Set a timer for 15 mins of focused work',
      'Clear your desk of all distractions',
      'Break one big task into 5 smaller steps',
      'Write your to-do list for tomorrow tonight',
      'Clean your workspace for exactly 5 minutes',
      'Finish one "quick" task (under 2 minutes) now',
      'Identify your biggest distraction and move it',
      'Tackle the task that takes the least effort first',
      'Set one specific goal for the next 2 hours',
      'Disable your internet for 20 minutes to focus',
      'Practice deep breathing for 2 minutes before work',
      'Tell someone what you plan to accomplish today',
      'Use a "done" list instead of a "to-do" list',
    ],
    intermediate: [
      'Complete your hardest task before noon',
      'Work for 25 mins without any breaks (Pomodoro)',
      "Finish one task you've been avoiding for a week",
      "Plan tomorrow's tasks tonight",
      'Say no to one distraction request today',
      'Work for 50 minutes with a 10-minute break',
      'Tackle the most complex task during your peak hours',
      'Keep your phone in another room while working',
      'Batch all your emails into two 20-minute windows',
      'Complete 4 "Pomodoro" sessions today',
      'Clean up your computer desktop and downloads',
      'Stop multi-tasking - focus on one thing for 1 hour',
      'Write down the "Next Action" for every project',
      'Eliminate one non-essential habit from your day',
      'Block all distracting websites for 3 hours',
      'Finish a task 10 minutes before the deadline',
      'Spend 15 minutes reviewing your long-term goals',
      'Say no to a meeting that could have been an email',
      'Organize your digital files for 20 minutes',
      'Focus on a single project for the entire afternoon',
    ],
    advanced: [
      'Complete 4 focused work sessions today',
      "Finish a project you've been putting off",
      'Work for 2 hours with phone in another room',
      'Clear your entire to-do list for the day',
      'Help someone else overcome their procrastination',
      'Complete a "Deep Work" session of 3 hours',
      'Establish a strict "No Procrastination" morning routine',
      'Finish all your weekly tasks by Thursday',
      'Go an entire day without checking social media at work',
      'Implement a "Eat the Frog" strategy for 5 days',
      'Design a permanent distraction-free workspace',
      'Teach a workshop or talk about time management',
      'Go 24 hours without any digital distractions',
      'Master a complex skill you\'ve been avoiding',
      'Achieve a state of "Flow" for at least 2 hours today',
    ],
  },
  'default': {
    beginner: [
      'Identify 3 triggers for your habit',
      'Journal about how this habit affects you',
      'Tell someone about your goal to quit',
      'Remove one thing that enables this habit',
      'Replace the habit with a 5-minute walk',
      'Write down why you want to change',
      'Track your habit for one full day',
      'Focus on deep breathing for 2 mins when triggered',
      'Avoid one environment where the habit happens',
      'Set a small, achievable daily target',
      'Reward yourself for skipping the habit once',
      'Read a story about someone who overcame this',
      'Take a cold shower to reset your focus',
      'Clean one small area of your living space',
      'Spend 5 minutes in silence reflecting',
    ],
    intermediate: [
      'Track every time you feel the urge',
      'Delay acting on the urge by 10 minutes',
      'Find a healthy alternative for when urges hit',
      'Reflect on your progress in a journal',
      'Reward yourself for a full day without the habit',
      'Go 3 days with a 50% reduction in the habit',
      'Tell a friend your progress and ask for support',
      'Avoid all triggers for a full 24-hour period',
      'Spend 30 minutes reading about habit formation',
      'Identify the root emotion driving your habit',
      'Change your physical environment to break cycles',
      'Implement a "Replacement Action" for the urge',
      'Go 48 hours without the habit entirely',
      'Practice mindfulness for 15 minutes today',
      'Write a list of 10 benefits you\'ve noticed',
      'Call someone when you feel the urge to relapse',
      'Go an entire weekend without the habit',
      'Create a "Urge Surfing" guide for yourself',
      'Clean up your digital lifestyle associated with habit',
      'Establish a new, positive routine at habit-time',
    ],
    advanced: [
      'Go 24 hours completely habit-free',
      "Teach someone else what you've learned",
      'Create a plan for handling future triggers',
      'Celebrate 1 week of reduced habit',
      'Set a bigger goal for the next 30 days',
      'Achieve a 14-day streak of your new focus',
      'Eliminate the habit core from your lifestyle',
      'Volunteer or help others with similar struggles',
      'Complete a full 30-day "Hard Mode" challenge',
      'Master the art of saying "No" to yourself',
      'Build a support system to maintain your freedom',
      'Write a public post or blog about your journey',
      'Redesign your life to make the habit impossible',
      'Celebrate 1 month of total transformation',
      'Become a mentor for someone starting their day 1',
    ],
  },
};

function getDifficulty(day: number): 'beginner' | 'intermediate' | 'advanced' {
  if (day <= 7) return 'beginner';
  if (day <= 20) return 'intermediate';
  return 'advanced';
}

export function generatePlan(data: OnboardingData): DayPlan[] {
  const { addiction } = data;
  const FREE_DAYS = 3;
  
  const plan: DayPlan[] = [];
  const quitTasksSource = addiction && QUIT_TASKS[addiction] ? QUIT_TASKS[addiction] : QUIT_TASKS.default;
  
  const usedQuitTasks = new Set<string>();
  
  for (let day = 1; day <= 30; day++) {
    const difficulty = getDifficulty(day);
    const tasks: Task[] = [];
    
    // Pick 2 different quit tasks for each day
    const dayQuitTasks: string[] = [];
    
    // First Task
    let availableTasks = quitTasksSource[difficulty].filter(t => !usedQuitTasks.has(t));
    if (availableTasks.length === 0) availableTasks = quitTasksSource[difficulty];
    const task1 = availableTasks[Math.floor(Math.random() * availableTasks.length)];
    dayQuitTasks.push(task1);
    usedQuitTasks.add(task1);
    
    // Second Task
    availableTasks = quitTasksSource[difficulty].filter(t => !usedQuitTasks.has(t) && t !== task1);
    if (availableTasks.length === 0) {
      availableTasks = quitTasksSource[difficulty].filter(t => t !== task1);
      if (availableTasks.length === 0) availableTasks = [task1];
    }
    const task2 = availableTasks[Math.floor(Math.random() * availableTasks.length)];
    dayQuitTasks.push(task2);
    usedQuitTasks.add(task2);
    
    tasks.push({
      id: `day-${day}-quit-1`,
      day,
      order: 1,
      type: 'quit',
      title: task1,
      description: `Primary focus for Day ${day}`,
      completed: false,
    });
    
    tasks.push({
      id: `day-${day}-quit-2`,
      day,
      order: 2,
      type: 'quit',
      title: task2,
      description: `Secondary focus for Day ${day}`,
      completed: false,
    });
    
    plan.push({
      day,
      tasks,
      unlocked: day <= FREE_DAYS,
    });
  }
  
  return plan;
}
