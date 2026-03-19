import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, Flame } from 'lucide-react';

export function SocialProofSection() {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Active users' },
    { icon: TrendingUp, value: '89%', label: 'Complete 30 days' },
    { icon: Star, value: '4.9/5', label: 'Average rating' },
    { icon: Flame, value: '72%', label: 'Reduced screen time' },
  ];

  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face',
  ];

  return (
    <section className="py-20 px-4 sm:px-6 border-y border-border bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Avatar Stack */}
          <div className="flex justify-center mb-6">
            <div className="flex -space-x-3">
              {avatars.map((avatar, i) => (
                <motion.img
                  key={i}
                  src={avatar}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
              <motion.div
                className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                +9k
              </motion.div>
            </div>
          </div>

          <p className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            Trusted by thousands of Gen Z users worldwide
          </p>
          <div className="flex items-center justify-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-background border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <stat.icon className="w-6 h-6 mx-auto mb-3 text-primary" />
              <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
