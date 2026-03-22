import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProgress, useAnalytics } from "@/hooks/useProgress";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "@/theme";

interface WeekProgress {
  week: number;
  percentage: number;
}

interface StreakDay {
  tasksCompleted: number;
}

const ANALYTICS_DAYS = 30;

const StatCard = React.memo(
  ({
    emoji,
    value,
    label,
  }: {
    emoji: string;
    value: string;
    label: string;
  }) => (
    <View style={styles.statCard} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  ),
);

const WeekRow = React.memo(({ week }: { week: WeekProgress }) => (
  <View style={styles.weekRow}>
    <Text style={styles.weekLabel}>Week {week.week}</Text>
    <View style={styles.weekBarContainer}>
      <View style={[styles.weekBar, { width: `${week.percentage}%` }]} />
    </View>
    <Text style={styles.weekPercent}>{Math.round(week.percentage)}%</Text>
  </View>
));

export function AnalyticsScreen() {
  const { data: progress, isLoading: progressLoading } = useProgress();
  const { data: analytics, isLoading: analyticsLoading } =
    useAnalytics(ANALYTICS_DAYS);

  const isLoading = progressLoading || analyticsLoading;

  const weeklyProgress: WeekProgress[] = analytics?.weeklyProgress ?? [];
  const streakHistory: StreakDay[] = analytics?.streakHistory ?? [];
  const recentStreak = streakHistory.slice(-14);

  const renderSection = useCallback(() => {
    return (
      <View style={styles.scrollContent}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            emoji="🔥"
            value={String(progress?.streakDays ?? 0)}
            label="Day Streak"
          />
          <StatCard
            emoji="✅"
            value={String(progress?.totalTasksCompleted ?? 0)}
            label="Tasks Done"
          />
          <StatCard
            emoji="📊"
            value={`${Math.round(progress?.completionRate ?? 0)}%`}
            label="Completion"
          />
          <StatCard
            emoji="💬"
            value={String(progress?.aiMessagesUsed ?? 0)}
            label="AI Chats"
          />
        </View>

        {/* Weekly Progress */}
        {weeklyProgress.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            {weeklyProgress.map((week) => (
              <WeekRow key={week.week} week={week} />
            ))}
          </View>
        )}

        {/* Streak History */}
        {recentStreak.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.streakGrid}>
              {recentStreak.map((day, index) => (
                <View
                  key={index}
                  style={[
                    styles.streakDot,
                    day.tasksCompleted > 0
                      ? styles.streakDotActive
                      : styles.streakDotInactive,
                  ]}
                  accessibilityLabel={
                    day.tasksCompleted > 0
                      ? `Day active, ${day.tasksCompleted} tasks`
                      : "Day inactive"
                  }
                >
                  <Text style={styles.streakDotText}>
                    {day.tasksCompleted > 0 ? "✓" : "·"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }, [progress, weeklyProgress, recentStreak]);

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your transformation</Text>
      </View>

      <FlatList
        data={[1]}
        renderItem={renderSection}
        keyExtractor={() => "analytics-content"}
        showsVerticalScrollIndicator={false}
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
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xxl,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: spacing.xs,
  },
  statEmoji: { fontSize: 24 },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  section: { gap: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  weekLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 60,
  },
  weekBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  weekBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  weekPercent: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    width: 35,
    textAlign: "right",
  },
  streakGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  streakDotActive: { backgroundColor: colors.primary + "20" },
  streakDotInactive: { backgroundColor: colors.surfaceSecondary },
  streakDotText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
