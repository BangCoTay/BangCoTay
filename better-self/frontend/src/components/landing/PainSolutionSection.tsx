import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

export function PainSolutionSection() {
  const painPoints = [
    { text: 'Doomscrolling every night', emoji: '📱' },
    { text: 'No focus or motivation', emoji: '😵‍💫' },
    { text: 'Low energy all day', emoji: '🔋' },
    { text: 'Feeling stuck in life', emoji: '😔' },
  ];

  const solutions = [
    { text: 'Clear, focused mind', emoji: '🧠' },
    { text: 'Better daily habits', emoji: '✨' },
    { text: 'Daily momentum', emoji: '🚀' },
    { text: 'Real, visible progress', emoji: '📈' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            From <span className="text-destructive">struggle</span> to{' '}
            <span className="text-gradient-primary">strength</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your daily habits and break free from the cycle
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Pain Points */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-muted-foreground mb-6 flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              Where you are now
            </h3>
            {painPoints.map((point, index) => (
              <motion.div
                key={point.text}
                className="flex items-center gap-4 p-5 rounded-2xl bg-destructive/5 border border-destructive/20"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-2xl">{point.emoji}</span>
                <span className="text-foreground font-medium">{point.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Arrow (Desktop) */}
          <motion.div
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-destructive to-primary flex items-center justify-center shadow-lg">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-muted-foreground mb-6 flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              Where you'll be
            </h3>
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.text}
                className="flex items-center gap-4 p-5 rounded-2xl bg-success/5 border border-success/20"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-2xl">{solution.emoji}</span>
                <span className="text-foreground font-medium">{solution.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
