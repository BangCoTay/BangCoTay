import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock, CheckCircle2, ChevronDown, ChevronUp, Check, Unlock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useCurrentPlan } from "@/hooks/usePlans";
import { useCompleteTask, useUncompleteTask } from "@/hooks/useTasks";
import { useProgress } from "@/hooks/useProgress";
import { useUserSubscription } from "@/hooks/useUsers";
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface DayPlan {
  dayNumber: number;
  unlocked: boolean;
  tasks: Task[];
}

const TaskItem = React.memo(
  ({
    task,
    onToggle,
    delay,
  }: {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
    delay: number;
  }) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay }}
    >
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => onToggle(task.id, task.completed)}
        accessibilityLabel={`${task.completed ? "Completed" : "Incomplete"}: ${task.title}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        activeOpacity={0.7}
      >
        <MotiView 
          animate={{
            backgroundColor: task.completed ? colors.primary : "transparent",
            borderColor: task.completed ? colors.primary : "rgba(255, 255, 255, 0.5)",
          }}
          transition={{ type: "timing", duration: 200 }}
          style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        >
          {task.completed && <Check size={14} color="#fff" strokeWidth={3} />}
        </MotiView>
        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.taskTitleCompleted,
            ]}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text style={styles.taskDescription}>{task.description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </MotiView>
  ),
);

const DayCard = React.memo(
  ({
    dayPlan,
    isExpanded,
    isLocked,
    onToggleExpand,
    onToggleTask,
    onNavigateUpgrade,
    index,
  }: {
    dayPlan: DayPlan;
    isExpanded: boolean;
    isLocked: boolean;
    onToggleExpand: (dayNumber: number) => void;
    onToggleTask: (taskId: string, completed: boolean) => void;
    onNavigateUpgrade: () => void;
    index: number;
  }) => {
    const dayCompleted = dayPlan.tasks?.every((t) => t.completed) && dayPlan.tasks?.length > 0;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400, delay: index * 100 }}
        style={styles.dayCardContainer}
      >
        <BlurView intensity={40} tint="light" style={[styles.dayCard, isExpanded && styles.dayCardExpanded]}>
          <TouchableOpacity
            style={[styles.dayHeader, isLocked && styles.dayHeaderLocked]}
            onPress={() => {
              if (isLocked) {
                onNavigateUpgrade();
              } else {
                onToggleExpand(dayPlan.dayNumber);
              }
            }}
            activeOpacity={0.7}
            accessibilityLabel={`Day ${dayPlan.dayNumber}${isLocked ? ", locked" : dayCompleted ? ", completed" : ""}`}
            accessibilityRole="button"
          >
            <View style={styles.dayHeaderLeft}>
              {isLocked ? (
                <View style={styles.iconCircleLocked}>
                  <Lock size={16} color={colors.textTertiary} />
                </View>
              ) : dayCompleted ? (
                <View style={styles.iconCircleSuccess}>
                  <CheckCircle2 size={16} color={colors.success} />
                </View>
              ) : (
                <View style={styles.dayCircle}>
                  <Text style={styles.dayCircleText}>{dayPlan.dayNumber}</Text>
                </View>
              )}
              <Text style={[styles.dayTitle, isLocked && styles.dayTitleLocked]}>
                Day {dayPlan.dayNumber}
              </Text>
            </View>
            {isLocked ? (
              <Lock size={20} color={colors.textTertiary} />
            ) : isExpanded ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          <AnimatePresence>
            {isExpanded && !isLocked && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "timing", duration: 300 }}
                style={{ overflow: "hidden" }}
              >
                <View style={styles.tasksContainer}>
                  <View style={styles.taskDivider} />
                  {(dayPlan.tasks ?? []).map((task, idx) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={onToggleTask} 
                      delay={idx * 100} 
                    />
                  ))}
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </BlurView>
      </MotiView>
    );
  },
);

export function PlanScreen() {
  const { data: planData, isLoading } = useCurrentPlan();
  const { data: progress } = useProgress();
  const { data: subscription } = useUserSubscription();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const navigation = useNavigation<any>();
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const dayPlans: DayPlan[] = planData?.dayPlans ?? [];
  const totalTasks = dayPlans.reduce(
    (acc, dp) => acc + (dp.tasks?.length ?? 0),
    0,
  );
  const completedTasks = dayPlans.reduce(
    (acc, dp) => acc + (dp.tasks?.filter((t) => t.completed)?.length ?? 0),
    0,
  );
  const progressPercent =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleToggleTask = useCallback(
    async (taskId: string, completed: boolean) => {
      try {
        if (completed) {
          await uncompleteTask.mutateAsync(taskId);
        } else {
          const result = await completeTask.mutateAsync(taskId);
          if (result?.celebrationMessage) {
            Toast.show({
              type: "success",
              text1: "Task completed!",
              text2: result.celebrationMessage,
              visibilityTime: 3000,
            });
          }
        }
      } catch {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to update task",
        });
      }
    },
    [completeTask, uncompleteTask],
  );

  const handleToggleExpand = useCallback(
    (dayNumber: number) => {
      setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
    },
    [expandedDay],
  );

  const handleNavigateUpgrade = useCallback(() => {
    navigation.navigate("Upgrade");
  }, [navigation]);

  const isFree = subscription?.tier === "free";

  const renderDayCard = useCallback(
    ({ item: dayPlan, index }: { item: DayPlan, index: number }) => (
      <DayCard
        dayPlan={dayPlan}
        isExpanded={expandedDay === dayPlan.dayNumber}
        isLocked={!dayPlan.unlocked && isFree}
        onToggleExpand={handleToggleExpand}
        onToggleTask={handleToggleTask}
        onNavigateUpgrade={handleNavigateUpgrade}
        index={index}
      />
    ),
    [
      expandedDay,
      isFree,
      handleToggleExpand,
      handleToggleTask,
      handleNavigateUpgrade,
    ],
  );

  const keyExtractor = useCallback(
    (item: DayPlan) => String(item.dayNumber),
    [],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.background, colors.backgroundSecondary, "#E0F2FE"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary, "#E0F2FE"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Your 30-Day Plan</Text>
          <Text style={styles.headerSubtitle}>
            Day {progress?.currentDay ?? 1} - {completedTasks}/{totalTasks} tasks
          </Text>
        </MotiView>

        {/* Progress Bar */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200 }}
          style={styles.progressSection}
        >
          <BlurView intensity={40} tint="light" style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressText}>
                {Math.round(progressPercent)}% complete
              </Text>
            </View>
            <View style={styles.progressBar}>
              <MotiView
                from={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "timing", duration: 1000, delay: 500 }}
                style={styles.progressFillWrapper}
              >
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </MotiView>
            </View>
          </BlurView>
        </MotiView>

        {/* Day Cards */}
        <FlatList
          data={dayPlans}
          renderItem={renderDayCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isFree ? (
              <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 800 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleNavigateUpgrade}
                  accessibilityLabel="Upgrade to unlock all 30 days"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={["rgba(168, 85, 247, 0.15)", "rgba(168, 85, 247, 0.05)"]}
                    style={styles.upgradeCard}
                  >
                    <View style={styles.upgradeIconWrapper}>
                      <Unlock size={24} color="#A855F7" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.upgradeTitle}>Unlock All 30 Days</Text>
                      <Text style={styles.upgradeText}>
                        Upgrade to access your full personalized plan
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressSection: { 
    paddingHorizontal: spacing.xl, 
    paddingVertical: spacing.md,
  },
  progressCard: {
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
  },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  progressFillWrapper: {
    height: "100%",
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  progressText: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  dayCardContainer: {
    marginBottom: spacing.md,
  },
  dayCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  dayCardExpanded: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
  },
  dayHeaderLocked: { opacity: 0.6 },
  dayHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  iconCircleLocked: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleSuccess: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleText: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  dayTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  dayTitleLocked: { color: colors.textTertiary },
  taskDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  tasksContainer: {
    paddingBottom: spacing.xl,
  },
  taskItem: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskContent: { flex: 1 },
  taskTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    fontFamily: typography.fontFamily.semibold,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: colors.textTertiary,
  },
  taskDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    marginTop: 4,
  },
  upgradeCard: {
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  upgradeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: "#A855F7",
    marginBottom: 4,
  },
  upgradeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
});
