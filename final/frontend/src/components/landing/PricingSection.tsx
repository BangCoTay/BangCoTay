import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export function PricingSection() {
  const { setCurrentView } = useAppStore();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Try it out, no commitment',
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      features: [
        '3-day plan preview',
        '5 AI coach messages',
        'Basic motivation quotes',
        'Progress tracking',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Starter',
      price: '$4.99',
      period: '/month',
      description: 'Most popular choice',
      icon: Zap,
      color: 'from-primary to-accent',
      features: [
        'Full 30-day plan',
        '20 AI messages/month',
        'All motivation quotes',
        'Detailed progress analytics',
        'Habit tracking',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      description: 'For serious commitment',
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      features: [
        'Everything in Starter',
        'Unlimited AI chat',
        'Social support (GF/Friends/Family)',
        'Custom habit plans',
        'Early access to features',
        'Lifetime member badge',
      ],
      cta: 'Go Premium',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Invest in your{' '}
            <span className="text-gradient-primary">future self</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Less than the cost of one coffee per week to change your life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative glass-card p-6 lg:p-8 rounded-2xl ${
                plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              {/* Header */}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                    : 'border-2 border-border hover:border-primary/50 text-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('onboarding')}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground">
            🔒 30-day money-back guarantee • Cancel anytime • No hidden fees
          </p>
        </motion.div>
      </div>
    </section>
  );
}
