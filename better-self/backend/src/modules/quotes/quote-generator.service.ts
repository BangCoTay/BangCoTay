import { Injectable, Logger } from '@nestjs/common';
import { Niche } from '../../types/niche.enum';

const QUOTES: Record<
  Niche | 'general',
  { emotional: string[]; practical: string[] }
> = {
  [Niche.DIGITAL]: {
    emotional: [
      'The phone in your pocket is not your life — your life is what happens when you put it down.',
      "You don't need to escape reality. You need to create one worth living in.",
      'Every minute offline is a minute invested in yourself.',
      "The best content you'll ever consume is the life you're actually living.",
      'Disconnect to reconnect — with yourself, with nature, with what matters.',
      'Your attention is your most precious resource. Guard it fiercely.',
    ],
    practical: [
      'Set boundaries with your devices before they set boundaries on your life.',
      'Replace doom scrolling with doom walking. Your mind will thank you.',
      'One hour of phone-free focus beats ten hours of distracted effort.',
      'The unfollow button is a tool for mental health. Use it liberally.',
      'Your screen time report is a map of where your life went. Choose better destinations.',
      "Notifications are other people's priorities. Silence them to hear your own.",
    ],
  },
  [Niche.MENTAL]: {
    emotional: [
      'Healing is not linear, but every step forward counts.',
      "Your mind is a garden. What you plant today, you'll harvest tomorrow.",
      'You are not your thoughts. You are the awareness behind them.',
      'The darkest nights produce the brightest stars. Keep going.',
      "Self-compassion isn't weakness — it's the foundation of real strength.",
      "Your struggles don't define you. Your courage to face them does.",
    ],
    practical: [
      'Start where you are. Use what you have. Do what you can.',
      'Progress in mental health is measured in moments, not milestones.',
      'One deep breath is sometimes all you need to reset everything.',
      'Journaling for 5 minutes can untangle hours of mental chaos.',
      "Ask for help. It's not giving up — it's leveling up.",
      'Your morning routine sets the tone for your entire day. Design it intentionally.',
    ],
  },
  [Niche.STUDY]: {
    emotional: [
      'Discipline is choosing between what you want now and what you want most.',
      "You don't have to be perfect. You just have to keep showing up.",
      'The compound effect of daily focus is unstoppable.',
      'Procrastination is the thief of dreams. Take your dreams back.',
      "Every expert was once a beginner who didn't quit.",
      'Your future is created by what you do today, not tomorrow.',
    ],
    practical: [
      'Start with 5 minutes. Momentum will take care of the rest.',
      'Break impossible tasks into possible pieces.',
      'The Pomodoro technique: 25 minutes of focus, 5 minutes of rest. Repeat.',
      'Your environment shapes your behavior. Design for success.',
      'Eliminate decisions, not tasks. Routines free up mental energy.',
      'Done is better than perfect. Ship it, then improve it.',
    ],
  },
  [Niche.HEALTH]: {
    emotional: [
      'Your body is your home. Treat it with respect.',
      "Health is not about being perfect. It's about being better than yesterday.",
      'The pain of discipline weighs ounces. The pain of regret weighs tons.',
      "You're one workout away from a better mood.",
      "Your body can stand almost anything. It's your mind you have to convince.",
      'Self-care is not selfish. Its essential.',
    ],
    practical: [
      'Move your body for 10 minutes. The hardest part is starting.',
      'Drink water before you reach for anything else.',
      'Sleep is not a luxury. Its a performance enhancer.',
      "You can't out-exercise a bad diet. Fuel yourself properly.",
      "Progress photos don't lie. Track your journey visually.",
      'Recovery is part of the workout. Rest without guilt.',
    ],
  },
  [Niche.FOOD]: {
    emotional: [
      'Food is fuel, not therapy. Find other ways to soothe your soul.',
      "You're not starting over. You're starting from experience.",
      'Every healthy meal is a vote for the person you want to become.',
      'Cravings are temporary. Health is permanent.',
      'You are stronger than your cravings. Prove it to yourself.',
      'Eating well is a form of self-respect.',
    ],
    practical: [
      'Drink a glass of water before every meal. It changes everything.',
      "Prep your meals. If it's ready, you'll eat it.",
      "Out of sight, out of mind. Don't keep junk food at home.",
      'Eat slowly. Your brain needs 20 minutes to feel full.',
      'Sugar is addictive. The first 3 days are the hardest. Push through.',
      'Read nutrition labels. Knowledge is power.',
    ],
  },
  [Niche.GAMING]: {
    emotional: [
      'Real life has better graphics. Go explore it.',
      'The achievements that matter cant be unlocked in a game.',
      'Balance is the ultimate game. Master it.',
      'Your real-life stats matter more than any leaderboard.',
      'The XP you gain in real life never resets.',
      'Level up in reality. The rewards are better.',
    ],
    practical: [
      'Set a hard stop time before you start playing.',
      'Game after responsibilities, not before.',
      'One hour of gaming feels better after a productive day.',
      'Uninstall the games that consume you. Keep the ones that refresh you.',
      'Track your gaming hours for a week. The numbers dont lie.',
      'Replace late-night gaming with early-morning wins.',
    ],
  },
  general: {
    emotional: [
      "You don't quit addiction. You outgrow it.",
      'The chains of habit are too weak to be felt until they are too strong to be broken.',
      'Every day is a new chance to rewrite your story.',
      'You are not what happened to you. You are what you choose to become.',
      'The secret of change is to focus all your energy on building the new.',
      "Believe you can and you're halfway there.",
    ],
    practical: [
      'Discipline today buys freedom tomorrow.',
      'Habits are the compound interest of self-improvement.',
      "You're one decision away from a completely different life.",
      'Start small. Stay consistent. Results will follow.',
      'Track your progress. What gets measured gets managed.',
      'Surround yourself with people who lift you higher.',
    ],
  },
};

@Injectable()
export class QuoteGeneratorService {
  private readonly logger = new Logger(QuoteGeneratorService.name);

  private getRandomQuotes(
    arr: string[],
    count: number,
    exclude: Set<string> = new Set(),
  ): string[] {
    const available = arr.filter((q) => !exclude.has(q));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  generateQuotes(niche: Niche | null): Array<{
    text: string;
    category: 'emotional' | 'practical';
    niche: string;
  }> {
    const source = niche && QUOTES[niche] ? QUOTES[niche] : QUOTES.general;
    const generalSource = QUOTES.general;

    const quotes: Array<{
      text: string;
      category: 'emotional' | 'practical';
      niche: string;
    }> = [];

    // Get 2 emotional quotes (1 from niche, 1 from general)
    const nicheEmotional = this.getRandomQuotes(source.emotional, 1);
    const generalEmotional = this.getRandomQuotes(
      generalSource.emotional,
      1,
      new Set(nicheEmotional),
    );

    // Get 1 practical quote
    const practical = this.getRandomQuotes(source.practical, 1);

    [...nicheEmotional, ...generalEmotional].forEach((text) => {
      quotes.push({
        text,
        category: 'emotional',
        niche: niche || 'general',
      });
    });

    practical.forEach((text) => {
      quotes.push({
        text,
        category: 'practical',
        niche: niche || 'general',
      });
    });

    return quotes;
  }
}
