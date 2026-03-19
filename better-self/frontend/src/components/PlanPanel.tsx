import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentPlan } from '@/hooks/usePlans';
import { useCompleteTask } from '@/hooks/useTasks';
import { useProgress } from '@/hooks/useProgress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useUserSubscription } from '@/hooks/useUsers';
import { COACHES, ADDICTIONS, HEALTHY_HABITS } from '@/types';
import {
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';

export function PlanPanel() {
  const { data: planData, isLoading: planLoading } = useCurrentPlan();
  const { data: progress } = useProgress();
  const { data: onboardingData } = useOnboarding();
  const { data: subscription } = useUserSubscription();
  const completeTask = useCompleteTask();
  const { toast } = useToast();

  const [expandedDay, setExpandedDay] = useState<number>(1);

  const coach = onboardingData?.niche ? COACHES[onboardingData.niche] : COACHES.health;
  const plan = planData?.dayPlans || [];
  const subscriptionTier = subscription?.tier || 'free';

  const handleTaskComplete = async (taskId: string, taskDay: number) => {
    try {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#f97316', '#8b5cf6', '#ec4899'],
      });

      const result = await completeTask.mutateAsync(taskId);

      // Show celebration message if provided
      if (result.celebrationMessage) {
        toast({
          title: '🎉 Amazing!',
          description: result.celebrationMessage,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getDayProgress = (day: number) => {
    const dayPlan = plan.find(d => d.dayNumber === day);
    if (!dayPlan || !dayPlan.tasks) return 0;
    const completed = dayPlan.tasks.filter(t => t.completed).length;
    return (completed / dayPlan.tasks.length) * 100;
  };

  const totalProgress = progress?.completionRate || 0;

  const addiction = ADDICTIONS.find(a => a.id === onboardingData?.addiction);
  const healthyHabit = HEALTHY_HABITS.find(h => h.id === onboardingData?.healthyHabit);

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
              Quit {addiction?.label || 'bad habits'}
              {healthyHabit && healthyHabit.id !== 'none' && ` • Build ${healthyHabit.label}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{Math.round(totalProgress)}%</p>
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
          const isLocked = !dayPlan.unlocked;
          const isExpanded = expandedDay === dayPlan.dayNumber;
          const dayProgress = getDayProgress(dayPlan.dayNumber);
          const isComplete = dayProgress === 100;

          return (
            <motion.div
              key={dayPlan.dayNumber}
              className={cn(
                "day-card",
                isLocked && "locked",
                isComplete && "border-success/50"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayPlan.dayNumber * 0.02 }}
            >
              <button
                onClick={() => !isLocked && setExpandedDay(isExpanded ? 0 : dayPlan.dayNumber)}
                className="w-full flex items-center justify-between"
                disabled={isLocked}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                    isComplete
                      ? "bg-success text-success-foreground"
                      : isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                  )}>
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
                      {isLocked ? 'Upgrade to unlock' : `${dayPlan.tasks?.filter(t => t.completed).length || 0}/${dayPlan.tasks?.length || 0} tasks`}
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
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {dayPlan.tasks?.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "task-card flex items-start gap-4",
                            task.completed && "completed"
                          )}
                        >
                          <button
                            onClick={() => !task.completed && handleTaskComplete(task.id, dayPlan.dayNumber)}
                            disabled={task.completed || completeTask.isPending}
                            className={cn(
                              "mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0",
                              task.completed
                                ? "bg-success border-success text-success-foreground"
                                : "border-primary/30 hover:border-primary hover:bg-primary/10"
                            )}
                          >
                            {task.completed && <Check className="w-4 h-4" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                task.type === 'quit'
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-success/10 text-success"
                              )}>
                                {task.type === 'quit' ? '🚫 Quit' : '✨ Build'}
                              </span>
                            </div>
                            <p className={cn(
                              "text-sm font-medium",
                              task.completed && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </p>
                          </div>
                        </div>
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
      {subscriptionTier === 'free' && (
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
              <p className="text-xs text-muted-foreground">Get the full plan + unlimited AI coach</p>
            </div>
            <button className="btn-accent text-sm">
              Upgrade
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

