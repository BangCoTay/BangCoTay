const config = require('../config');
const OpenAI = require('openai');

let openai = null;
if (config.openaiApiKey) {
  openai = new OpenAI({ apiKey: config.openaiApiKey });
}

const coachPersonas = {
  Alex: { name: 'Alex', style: 'motivational and energetic', approach: 'tough love with encouragement' },
  Luna: { name: 'Luna', style: 'calm and empathetic', approach: 'gentle guidance and understanding' },
  Max: { name: 'Max', style: 'practical and strategic', approach: 'data-driven and goal-oriented' },
  Antony: { name: 'Antony', style: 'wise and philosophical', approach: 'deep reflection and mindfulness' },
  Mia: { name: 'Mia', style: 'friendly and supportive', approach: 'like a best friend who cares' },
  Kai: { name: 'Kai', style: 'disciplined and focused', approach: 'structured and systematic' },
};

const buildSystemPrompt = (coachPersona, userContext) => {
  const { niche, addiction, severity, currentDay, recentProgress } = userContext;
  const coach = coachPersonas[coachPersona] || coachPersonas.Alex;

  return `You are ${coach.name}, a supportive addiction recovery coach with a ${coach.style} personality. Your approach is ${coach.approach}.

User Context:
- Niche: ${niche || 'general'}
- Working on: ${addiction || 'habit change'}
- Severity: ${severity || 'moderate'}
- Current Day: ${currentDay || 1} of their 30-day journey
- Recent Progress: ${recentProgress || 'just starting'}

Your role:
1. Provide personalized, actionable advice for overcoming ${addiction}
2. Be encouraging but realistic about challenges
3. Reference their current day and progress when relevant
4. Keep responses concise (2-3 paragraphs max)
5. Use your unique coaching style consistently
6. Focus on practical strategies they can implement today
7. Celebrate their wins and help them learn from setbacks

Remember: You're here to support their recovery journey with empathy, expertise, and encouragement.`;
};

const generateCoachResponse = async (messages, coachPersona, userContext, subscriptionTier) => {
  if (!openai) {
    throw new Error('OpenAI not configured');
  }

  const model = 'gpt-5-nano';
  const systemPrompt = buildSystemPrompt(coachPersona, userContext);

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return {
    content: completion.choices[0].message.content,
    tokensUsed: completion.usage?.total_tokens || 0,
    model,
  };
};

module.exports = { generateCoachResponse };
