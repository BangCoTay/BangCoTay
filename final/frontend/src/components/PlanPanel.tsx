import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentPlan } from "@/hooks/usePlans";
import { useCompleteTask, useUncompleteTask } from "@/hooks/useTasks";
import { useProgress } from "@/hooks/useProgress";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUserSubscription } from "@/hooks/useUsers";
import { COACHES, ADDICTIONS } from "@/types";
import {
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface PlanPanelProps {
  onUpgrade: () => void;
}

export function PlanPanel({ onUpgrade }: PlanPanelProps) {
  const { data: planData, isLoading: planLoading } = useCurrentPlan();
  const { data: progress } = useProgress();
  const { data: onboardingData } = useOnboarding();
  const { data: subscription } = useUserSubscription();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  const [expandedDay, setExpandedDay] = useState<number>(1);

  const coach = onboardingData?.niche
    ? COACHES[onboardingData.niche]
    : COACHES.health;
  const planDataNormalized = planData as any;
  const plan = planDataNormalized?.dayPlans || [];
  const subscriptionTier = subscription?.tier || "free";

  const handleToggleTask = async (
    taskId: string,
    currentCompleted: boolean,
  ) => {
    try {
      if (!currentCompleted) {
        // Trigger confetti ONLY on completion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#14b8a6", "#f97316", "#8b5cf6", "#ec4899"],
        });

        const result = await completeTask.mutateAsync(taskId) as any;
        toast.success("Task completed! 🚀");

        // Show toast notifications for companion messages if they exist (Premium)
        if (result?.companionMessages && Array.isArray(result.companionMessages)) {
          result.companionMessages.forEach((msg: any) => {
            setTimeout(() => {
              toast(`${msg.name} says:`, {
                description: msg.content,
                icon: "✨",
              });
            }, 500); // Slight delay for better UX
          });
        }
      } else {
        await uncompleteTask.mutateAsync(taskId);
      }
    } catch (error) {
      toast.error(
        `Failed to ${currentCompleted ? "uncomplete" : "complete"} task. Please try again.`,
      );
    }
  };

  const getDayProgress = (day: number) => {
    const dayPlan = plan.find((d) => d.dayNumber === day);
    if (!dayPlan || !dayPlan.tasks) return 0;
    const completed = dayPlan.tasks.filter((t) => t.completed).length;
    return (completed / dayPlan.tasks.length) * 100;
  };

  const totalProgress = progress?.completionRate || 0;

  const addiction = ADDICTIONS.find((a) => a.id === onboardingData?.addiction);

  if (planLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan || plan.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No plan available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Your 30-Day Plan</h2>
            <p className="text-sm text-muted-foreground">
              Quit {addiction?.label || "bad habits"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {Math.round(totalProgress)}%
            </p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="progress-bar h-3">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Days list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {plan.map((dayPlan) => {
          const isPaidTier = subscriptionTier === "starter" || subscriptionTier === "premium";
          const isLocked = !dayPlan.unlocked && !isPaidTier;
          const isExpanded = expandedDay === dayPlan.dayNumber;
          const dayProgress = getDayProgress(dayPlan.dayNumber);
          const isComplete = dayProgress === 100;

          return (
            <motion.div
              key={dayPlan.dayNumber}
              className={cn(
                "day-card",
                isLocked && "locked",
                isComplete && "border-success/50",
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayPlan.dayNumber * 0.02 }}
            >
              <button
                onClick={() =>
                  !isLocked &&
                  setExpandedDay(isExpanded ? 0 : dayPlan.dayNumber)
                }
                className="w-full flex items-center justify-between"
                disabled={isLocked}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                      isComplete
                        ? "bg-success text-success-foreground"
                        : isLocked
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary",
                    )}
                  >
                    {isComplete ? (
                      <Check className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      dayPlan.dayNumber
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Day {dayPlan.dayNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {isLocked
                        ? "Upgrade to unlock"
                        : `${dayPlan.tasks?.filter((t) => t.completed).length || 0}/${dayPlan.tasks?.length || 0} tasks`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isLocked && (
                    <>
                      <div className="w-20 progress-bar h-2">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${dayProgress}%` }}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && !isLocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {dayPlan.tasks?.map((task) => (
                        <button
                          key={task.id}
                          onClick={() =>
                            handleToggleTask(task.id, task.completed)
                          }
                          className={cn(
                            "task-card w-full text-left flex items-center justify-between gap-4 transition-all hover:bg-primary/5",
                            task.completed &&
                              "completed bg-success/5 border-success/20",
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm font-medium flex-1",
                              task.completed &&
                                "line-through text-muted-foreground",
                            )}
                          >
                            {task.title}
                          </p>
                          <div
                            className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0",
                              task.completed
                                ? "bg-success border-success text-success-foreground"
                                : "border-primary/30",
                            )}
                          >
                            {task.completed && <Check className="w-4 h-4" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Upgrade CTA for free users */}
      {subscriptionTier === "free" && (
        <motion.div
          className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Unlock all 30 days</p>
              <p className="text-xs text-muted-foreground">
                Get the full plan + unlimited AI coach
              </p>
            </div>
            <button onClick={onUpgrade} className="btn-accent text-sm">
              Upgrade
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
