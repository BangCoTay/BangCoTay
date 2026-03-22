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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useCurrentPlan } from "@/hooks/usePlans";
import { useCompleteTask, useUncompleteTask } from "@/hooks/useTasks";
import { useProgress } from "@/hooks/useProgress";
import { useUserSubscription } from "@/hooks/useUsers";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "@/theme";

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
  }: {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
  }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => onToggle(task.id, task.completed)}
      accessibilityLabel={`${task.completed ? "Completed" : "Incomplete"}: ${task.title}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.completed }}
    >
      <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
        {task.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
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
  }: {
    dayPlan: DayPlan;
    isExpanded: boolean;
    isLocked: boolean;
    onToggleExpand: (dayNumber: number) => void;
    onToggleTask: (taskId: string, completed: boolean) => void;
    onNavigateUpgrade: () => void;
  }) => {
    const dayCompleted = dayPlan.tasks?.every((t) => t.completed);

    return (
      <View style={styles.dayCard}>
        <TouchableOpacity
          style={[styles.dayHeader, isLocked && styles.dayHeaderLocked]}
          onPress={() => {
            if (isLocked) {
              onNavigateUpgrade();
            } else {
              onToggleExpand(dayPlan.dayNumber);
            }
          }}
          accessibilityLabel={`Day ${dayPlan.dayNumber}${isLocked ? ", locked" : dayCompleted ? ", completed" : ""}`}
          accessibilityRole="button"
        >
          <View style={styles.dayHeaderLeft}>
            {isLocked ? (
              <Ionicons
                name="lock-closed"
                size={18}
                color={colors.textTertiary}
              />
            ) : dayCompleted ? (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.success}
              />
            ) : (
              <View style={styles.dayCircle}>
                <Text style={styles.dayCircleText}>{dayPlan.dayNumber}</Text>
              </View>
            )}
            <Text style={[styles.dayTitle, isLocked && styles.dayTitleLocked]}>
              Day {dayPlan.dayNumber}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={isLocked ? colors.textTertiary : colors.textSecondary}
          />
        </TouchableOpacity>

        {isExpanded && !isLocked && (
          <View style={styles.tasksContainer}>
            {(dayPlan.tasks ?? []).map((task) => (
              <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
            ))}
          </View>
        )}
      </View>
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
    ({ item: dayPlan }: { item: DayPlan }) => (
      <DayCard
        dayPlan={dayPlan}
        isExpanded={expandedDay === dayPlan.dayNumber}
        isLocked={!dayPlan.unlocked && isFree}
        onToggleExpand={handleToggleExpand}
        onToggleTask={handleToggleTask}
        onNavigateUpgrade={handleNavigateUpgrade}
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your 30-Day Plan</Text>
        <Text style={styles.headerSubtitle}>
          Day {progress?.currentDay ?? 1} - {completedTasks}/{totalTasks} tasks
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progressPercent)}% complete
        </Text>
      </View>

      {/* Day Cards */}
      <FlatList
        data={dayPlans}
        renderItem={renderDayCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isFree ? (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={handleNavigateUpgrade}
              accessibilityLabel="Upgrade to unlock all 30 days"
              accessibilityRole="button"
            >
              <Text style={styles.upgradeEmoji}>{"🔓"}</Text>
              <Text style={styles.upgradeTitle}>Unlock All 30 Days</Text>
              <Text style={styles.upgradeText}>
                Upgrade to access your full plan
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressSection: { padding: spacing.lg, gap: spacing.sm },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "right",
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 100,
  },
  dayCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  dayHeaderLocked: { opacity: 0.5 },
  dayHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  dayTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  dayTitleLocked: { color: colors.textTertiary },
  tasksContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  taskItem: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    minHeight: 48,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskContent: { flex: 1 },
  taskTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: colors.textTertiary,
  },
  taskDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  upgradeCard: {
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + "10",
    borderWidth: 1,
    borderColor: colors.primary + "30",
    alignItems: "center",
    gap: spacing.sm,
  },
  upgradeEmoji: { fontSize: 32 },
  upgradeTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  upgradeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
