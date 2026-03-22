import { useState } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AICoachPanel } from "@/components/AICoachPanel";
import { PlanPanel } from "@/components/PlanPanel";
import { QuotesPanel } from "@/components/QuotesPanel";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UserButton } from "@clerk/clerk-react";
import { useUserProfile } from "@/hooks/useUsers";
import { Sparkles, Crown, Loader2, Zap } from "lucide-react";

export function Dashboard() {
  const { data: userProfile, isLoading } = useUserProfile();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const showUpgradeButton = userProfile?.subscriptionTier === "free";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">
                Resetify
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Upgrade button */}
              {showUpgradeButton && (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade</span>
                </button>
              )}

              {/* Subscription badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                {userProfile?.subscriptionTier === "premium" && (
                  <Crown className="w-4 h-4 text-accent" />
                )}
                <span className="text-sm font-medium capitalize">
                  {userProfile?.subscriptionTier || "free"}
                </span>
              </div>

              <ThemeToggle />

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 rounded-xl",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content - 3 column layout */}
      <main className="flex-1 min-h-0 max-w-[1800px] w-full mx-auto px-4 sm:px-6 py-6 overflow-hidden">
        <div className="grid lg:grid-cols-[3.5fr_5fr_3.5fr] gap-3 h-full">
          {/* Left panel - AI Coach */}
          <motion.div
            className="h-full min-h-0 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AICoachPanel onUpgrade={() => setIsUpgradeModalOpen(true)} />
          </motion.div>

          {/* Center panel - Plan */}
          <motion.div
            className="h-full min-h-0 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PlanPanel onUpgrade={() => setIsUpgradeModalOpen(true)} />
          </motion.div>

          {/* Right panel - Quotes */}
          <motion.div
            className="h-full min-h-0 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <QuotesPanel onUpgrade={() => setIsUpgradeModalOpen(true)} />
          </motion.div>
        </div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
