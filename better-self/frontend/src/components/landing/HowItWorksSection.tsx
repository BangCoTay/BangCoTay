import { motion } from 'framer-motion';
import { Search, Calendar, Bot, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      number: '01',
      title: 'Identify your addiction',
      description: 'Take a quick assessment to understand your habits and what triggers them.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Calendar,
      number: '02',
      title: 'Get a personalized 30-day plan',
      description: 'Receive a science-backed plan with daily tasks that gradually increase in difficulty.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Bot,
      number: '03',
      title: 'Build better habits with AI',
      description: 'Your AI coach guides you daily, celebrates wins, and keeps you accountable.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your habits and build a better you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full h-[2px] bg-gradient-to-r from-border to-transparent">
                  <ArrowRight className="absolute -right-2 -top-2 w-5 h-5 text-muted-foreground/30" />
                </div>
              )}

              <div className="relative glass-card p-8 h-full hover:shadow-xl transition-shadow duration-300">
                {/* Step Number */}
                <span className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center text-lg font-bold text-muted-foreground">
                  {step.number}
                </span>

                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
