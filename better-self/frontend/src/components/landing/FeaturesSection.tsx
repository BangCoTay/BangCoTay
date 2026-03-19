import { motion } from 'framer-motion';
import { Calendar, RefreshCw, Bot, BarChart3, PartyPopper, MessageCircle } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Calendar,
      title: '30-Day Structured Plan',
      description: 'Science-backed daily tasks that gradually increase in difficulty.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: RefreshCw,
      title: 'Habit Replacement System',
      description: "Don't just quit — replace bad habits with healthy alternatives.",
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Bot,
      title: 'AI Coach Support',
      description: 'Your personal AI companion that understands and guides you.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Daily Progress Tracking',
      description: 'Visual streaks and stats to keep you motivated.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: PartyPopper,
      title: 'Motivation & Celebration',
      description: 'Confetti, badges, and rewards for completing tasks.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: MessageCircle,
      title: 'Messenger-Style Chat',
      description: 'Feels like texting a real friend who cares about your progress.',
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need to{' '}
            <span className="text-gradient-primary">succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built on behavioral science, designed for Gen Z
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group glass-card p-6 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
