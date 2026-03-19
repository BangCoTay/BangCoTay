import { motion } from 'framer-motion';
import { MessageCircle, Heart, Smile, Sparkles } from 'lucide-react';

export function AICoachSection() {
  const chatMessages = [
    { from: 'coach', text: "Hey! I noticed you're having a tough day. That's okay — progress isn't linear. 💙" },
    { from: 'user', text: "I almost relapsed today..." },
    { from: 'coach', text: "The fact that you're here talking about it means you're still fighting. That takes real strength. What triggered the urge?" },
    { from: 'user', text: "I was stressed about work and reached for my phone" },
    { from: 'coach', text: "Stress is a common trigger. Next time, try the 5-minute rule: wait 5 minutes before acting on the urge. Usually, it passes. You've got this! 🙌" },
  ];

  const coachPersonalities = [
    { name: 'Alex', role: 'Focus Coach', emoji: '🎯', color: 'from-blue-500 to-cyan-500' },
    { name: 'Luna', role: 'Wellness Coach', emoji: '🧘', color: 'from-purple-500 to-pink-500' },
    { name: 'Max', role: 'Fitness Coach', emoji: '💪', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              AI Coach
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              A coach that{' '}
              <span className="text-gradient-primary">actually gets you</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your AI coach is supportive, not judgmental. It feels like texting a real friend who genuinely cares about your progress — not perfection.
            </p>

            <div className="space-y-4">
              {[
                { icon: Heart, text: 'Empathetic and understanding' },
                { icon: Smile, text: 'Celebrates every small win' },
                { icon: Sparkles, text: 'Personalized to your journey' },
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Coach Avatars */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Choose your coach personality:</p>
              <div className="flex gap-3">
                {coachPersonalities.map((coach) => (
                  <motion.div
                    key={coach.name}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/50 cursor-pointer transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${coach.color} flex items-center justify-center text-sm`}>
                      {coach.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{coach.name}</p>
                      <p className="text-xs text-muted-foreground">{coach.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Chat Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="glass-card p-6 rounded-3xl shadow-2xl">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-card" />
                </div>
                <div>
                  <h4 className="font-semibold">Alex — Your AI Coach</h4>
                  <p className="text-xs text-success">Online now</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input Preview */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-secondary text-sm text-muted-foreground">
                    Type a message...
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
