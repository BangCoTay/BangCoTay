import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Crown, Check } from "lucide-react";
import { useCreateCheckout } from "@/hooks/usePayments";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const createCheckout = useCreateCheckout();

  const STRIPE_PRICE_IDS = {
    starter: "price_1TCDROEImQN0mO8Hd5v88l0I",
    premium: "price_1TCDV4EImQN0mO8HEAErXGS6",
  };

  const getPriceId = (tier: "starter" | "premium") => STRIPE_PRICE_IDS[tier];

  const handleUpgrade = (tier: "starter" | "premium") => {
    const priceId = getPriceId(tier);
    if (priceId) {
      createCheckout.mutate({ tier, priceId });
    }
  };

  const plans = [
    {
      name: "Starter",
      price: "$9.99",
      originalPrice: "$19.99",
      discount: "50% OFF",
      period: "forever",
      description: "Best value, one-time payment",
      icon: Zap,
      color: "from-primary to-accent",
      tier: "starter" as const,
      features: [
        "Full 30-day life plan",
        "Much more AI coach messages usage",
        "Unlimited quote generation",
        "Advanced habit tracking",
        "Smart reminders & notifications",
        "Standard analytics",
      ],
    },
    {
      name: "Premium",
      price: "$19.99",
      originalPrice: "$49.99",
      discount: "60% OFF",
      period: "forever",
      description: "Full experience with AI Companion",
      icon: Crown,
      color: "from-amber-500 to-orange-500",
      tier: "premium" as const,
      features: [
        "Everything in Starter",
        "Unlimited AI coach messages",
        "AI Companion (Girlfriend/Family/BFF)",
        "Advanced behavior analytics",
        "Priority 24/7 support",
        "Early access to new features",
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-2xl bg-card rounded-3xl border shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="p-8 text-center border-b">
                <h2 className="text-2xl font-bold mb-2">
                  Choose Your{" "}
                  <span className="text-gradient-primary">Plan</span>
                </h2>
                <p className="text-muted-foreground">
                  One-time payment, forever access. No subscriptions.
                </p>
              </div>

              {/* Plans */}
              <div className="p-8 grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.name}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all flex flex-col",
                      plan.name === "Premium"
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-border hover:border-primary/50",
                    )}
                    whileHover={{ scale: 1.02 }}
                  >
                    {plan.name === "Premium" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium">
                        Best Value
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}
                    >
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Name & Price */}
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      {plan.discount && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                          {plan.discount}
                        </span>
                      )}
                    </div>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through opacity-60">
                          {plan.originalPrice}
                        </span>
                      )}
                      <span className="text-muted-foreground text-sm ml-1">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={
                        createCheckout.isPending || !getPriceId(plan.tier)
                      }
                      className={cn(
                        "w-full py-3 rounded-xl font-medium transition-all mt-auto",
                        plan.name === "Premium"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
                          : "bg-primary text-primary-foreground hover:opacity-90",
                      )}
                    >
                      {createCheckout.isPending
                        ? "Processing..."
                        : `Get ${plan.name}`}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 pb-6 text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 Secure payment via Stripe • 30-day money-back guarantee
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
