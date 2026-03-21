import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

export function PricingSection() {
  const { setCurrentView } = useAppStore();
  const { isAuthenticated } = useAuthContext();
  const [_, setSearchParams] = useSearchParams();

  const handleStart = () => {
    if (isAuthenticated) {
      setCurrentView("onboarding");
      return;
    }
    setSearchParams({ auth_mode: "signup" });
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Try it out, no commitment",
      icon: Sparkles,
      color: "from-gray-500 to-gray-600",
      features: [
        "3-day roadmap preview",
        "5 AI coach messages",
        "Daily motivation quotes",
        "Basic habit tracking",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Starter",
      price: "$9.99",
      originalPrice: "$19.99",
      discount: "50% OFF",
      period: "forever",
      description: "Best value, one-time",
      icon: Zap,
      color: "from-primary to-accent",
      features: [
        "Full 30-day life plan",
        "Much more AI coach messages usage",
        "Unlimited quote generation",
        "Advanced habit tracking",
        "Smart reminders & notifications",
        "Standard analytics",
      ],
      cta: "Get Starter",
      popular: true,
    },
    {
      name: "Premium",
      price: "$19.99",
      originalPrice: "$49.99",
      discount: "60% OFF",
      period: "forever",
      description: "Full experience",
      icon: Crown,
      color: "from-amber-500 to-orange-500",
      features: [
        "Everything in Starter",
        "Unlimited AI coach messages",
        "AI Companion (Girlfriend/Family/BFF)",
        "Advanced behavior analytics",
        "Priority 24/7 support",
        "Early access to new features",
      ],
      cta: "Get Premium",
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
            Invest in your{" "}
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
              className={`relative glass-card p-6 lg:p-8 rounded-2xl flex flex-col ${
                plan.popular
                  ? "ring-2 ring-primary shadow-xl scale-105 z-10"
                  : ""
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
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}
              >
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.discount && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                    {plan.discount}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through opacity-60">
                      {plan.originalPrice}
                    </span>
                  )}
                </div>
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
                className={`w-full py-3 rounded-xl font-medium transition-all mt-auto ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25"
                    : "border-2 border-border hover:border-primary/50 text-foreground"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
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
            🔒 One-time payment • No subscriptions • No hidden fees
          </p>
        </motion.div>
      </div>
    </section>
  );
}
