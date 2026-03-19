import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, RotateCcw, MessageCircle, Heart, Users } from 'lucide-react';
import { useState } from 'react';

export function ProductPreviewSection() {
  const [completedTasks, setCompletedTasks] = useState<number[]>([0]);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleTaskClick = (index: number) => {
    if (completedTasks.includes(index)) return;
    
    setCompletedTasks([...completedTasks, index]);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const tasks = [
    { text: 'No social media before noon', time: '9:30 AM' },
    { text: '10-minute morning meditation', time: 'Pending' },
    { text: 'Read 10 pages of a book', time: 'Pending' },
  ];

  const quotes = [
    { text: "You don't quit addiction. You outgrow it.", type: 'emotional' },
    { text: 'Discipline today buys freedom tomorrow.', type: 'practical' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-secondary/30 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Interactive Demo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            See it in action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Click on a task to experience the satisfaction
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 relative">
          {/* Confetti Effect */}
          {showConfetti && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '30%',
                    background: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'][i % 4],
                  }}
                  initial={{ y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    y: [0, -100, 200],
                    x: (Math.random() - 0.5) * 200,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          )}

          {/* AI Coach Panel */}
          <motion.div
            className="glass-card p-5 rounded-2xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">Alex — AI Coach</h4>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="chat-bubble-assistant">
                <p className="text-sm">Hey! I'm your personal coach. Ready to crush Day 5? 💪</p>
              </div>
              
              {completedTasks.length > 1 && (
                <motion.div
                  className="chat-bubble-assistant"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm">Amazing work! You're building real discipline. Keep going! 🔥</p>
                </motion.div>
              )}
            </div>

            {/* Premium Social Messages Preview */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Premium: Social Support</p>
              <div className="space-y-2 opacity-60">
                <div className="flex items-center gap-2 text-xs">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Girlfriend: "Proud of you ❤️"</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Friends: "Keep it up bro 🔥"</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Task Panel */}
          <motion.div
            className="glass-card p-5 rounded-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Day 5 of 30</p>
                <h4 className="font-semibold">Today's Tasks</h4>
              </div>
              <div className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                {completedTasks.length}/3 Done
              </div>
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.button
                  key={task.text}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                    completedTasks.includes(index)
                      ? 'bg-success/10 border border-success/20'
                      : 'bg-card border border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleTaskClick(index)}
                  whileHover={{ scale: completedTasks.includes(index) ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {completedTasks.includes(index) ? (
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${completedTasks.includes(index) ? 'line-through text-muted-foreground' : ''}`}>
                      {task.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {completedTasks.includes(index) ? `Completed at ${task.time}` : task.time}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Click a task to complete it!
            </p>
          </motion.div>

          {/* Quotes Panel */}
          <motion.div
            className="glass-card p-5 rounded-2xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Daily Motivation</h4>
              </div>
            </div>

            <div className="space-y-4">
              {quotes.map((quote, index) => (
                <motion.div
                  key={quote.text}
                  className="quote-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <p className="text-sm italic text-foreground">"{quote.text}"</p>
                  <p className="text-xs text-muted-foreground mt-2 capitalize">{quote.type}</p>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:border-primary/50 text-sm font-medium transition-colors">
              <RotateCcw className="w-4 h-4" />
              Regenerate Quotes
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
