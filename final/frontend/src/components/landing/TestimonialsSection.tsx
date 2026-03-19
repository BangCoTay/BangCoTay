import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'College Student, 21',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face',
      text: "I finally stopped doomscrolling at 3 AM. My sleep improved, my grades went up, and I actually have energy now. This app literally changed my life.",
      highlight: 'Sleep improved, grades up',
    },
    {
      name: 'Sarah Kim',
      role: 'Marketing Manager, 26',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      text: "The AI coach feels like texting a friend who actually cares. No judgment, just support. I've tried other apps but this one actually works.",
      highlight: 'Feels like a real friend',
    },
    {
      name: 'Marcus Johnson',
      role: 'Software Developer, 24',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      text: "Small steps, big change. I went from 6+ hours of gaming daily to just 1 hour as a reward. The habit replacement system is genius.",
      highlight: '6 hours → 1 hour gaming',
    },
    {
      name: 'Emma Wilson',
      role: 'Content Creator, 23',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
      text: "I was skeptical at first, but the 30-day structure made it so manageable. Day by day, I built better habits without even realizing it.",
      highlight: 'Manageable daily structure',
    },
    {
      name: 'James Lee',
      role: 'Freelancer, 28',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
      text: "The confetti when you complete a task sounds silly, but it's actually really motivating. Those little dopamine hits keep you coming back.",
      highlight: 'Motivating rewards',
    },
    {
      name: 'Mia Rodriguez',
      role: 'Student, 19',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face',
      text: "Finally broke my sugar addiction. Replaced snacking with drinking water and short walks. Down 15 lbs and feeling amazing.",
      highlight: 'Down 15 lbs',
    },
  ];

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Real stories, real{' '}
            <span className="text-gradient-primary">transformations</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands who've already changed their lives
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="glass-card p-6 rounded-2xl relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-current" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-4 leading-relaxed">"{testimonial.text}"</p>

              {/* Highlight Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium mb-4">
                {testimonial.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
