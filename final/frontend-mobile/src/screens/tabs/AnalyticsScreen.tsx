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
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { Flame, CheckCircle, BarChart2, MessageCircle, TrendingUp } from "lucide-react-native";

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
    icon: Icon,
    value,
    label,
    delay,
    iconColor,
  }: {
    icon: any;
    value: string;
    label: string;
    delay: number;
    iconColor: string;
  }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500, delay }}
      style={{ width: "48%", marginBottom: spacing.md }}
    >
      <BlurView intensity={40} tint="light" style={styles.statCard}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
          <Icon color={iconColor} size={24} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </BlurView>
    </MotiView>
  ),
);

const WeekRow = React.memo(({ week, index }: { week: WeekProgress, index: number }) => (
  <MotiView
    from={{ opacity: 0, translateX: -20 }}
    animate={{ opacity: 1, translateX: 0 }}
    transition={{ type: "timing", duration: 400, delay: 300 + index * 100 }}
    style={styles.weekRowContainer}
  >
    <BlurView intensity={40} tint="light" style={styles.weekRow}>
      <Text style={styles.weekLabel}>Week {week.week}</Text>
      <View style={styles.weekBarContainer}>
        <MotiView
          from={{ width: "0%" }}
          animate={{ width: `${week.percentage}%` }}
          transition={{ type: "timing", duration: 1000, delay: 500 + index * 100 }}
          style={styles.weekBarWrapper}
        >
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </MotiView>
      </View>
      <Text style={styles.weekPercent}>{Math.round(week.percentage)}%</Text>
    </BlurView>
  </MotiView>
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
            icon={Flame}
            iconColor="#F97316"
            value={String(progress?.streakDays ?? 0)}
            label="Day Streak"
            delay={100}
          />
          <StatCard
            icon={CheckCircle}
            iconColor={colors.success}
            value={String(progress?.totalTasksCompleted ?? 0)}
            label="Tasks Done"
            delay={200}
          />
          <StatCard
            icon={BarChart2}
            iconColor={colors.primary}
            value={`${Math.round(progress?.completionRate ?? 0)}%`}
            label="Completion"
            delay={300}
          />
          <StatCard
            icon={MessageCircle}
            iconColor="#8B5CF6"
            value={String(progress?.aiMessagesUsed ?? 0)}
            label="AI Chats"
            delay={400}
          />
        </View>

        {/* Weekly Progress */}
        {weeklyProgress.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            {weeklyProgress.map((week, index) => (
              <WeekRow key={week.week} week={week} index={index} />
            ))}
          </MotiView>
        )}

        {/* Streak History */}
        {recentStreak.length > 0 ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 700 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <BlurView intensity={40} tint="light" style={styles.streakCard}>
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
                    {day.tasksCompleted > 0 && <View style={styles.streakDotInner} />}
                  </View>
                ))}
              </View>
            </BlurView>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 700 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <BlurView intensity={40} tint="light" style={styles.emptyCard}>
              <Flame size={32} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Start your streak by completing daily tasks</Text>
            </BlurView>
          </MotiView>
        )}
      </View>
    );
  }, [progress, weeklyProgress, recentStreak]);

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
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Track your transformation</Text>
        </MotiView>

        <FlatList
          data={[1]}
          renderItem={renderSection}
          keyExtractor={() => "analytics-content"}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
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
    paddingVertical: spacing.lg,
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
  scrollContent: {
    padding: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  statLabel: { 
    fontSize: fontSize.sm, 
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary 
  },
  section: { 
    gap: spacing.md, 
    marginTop: spacing.xl 
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  weekRowContainer: {
    marginBottom: spacing.sm,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  weekLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textSecondary,
    width: 60,
  },
  weekBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  weekBarWrapper: {
    height: "100%",
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  weekPercent: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
    width: 40,
    textAlign: "right",
  },
  streakCard: {
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  streakGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  streakDotActive: { 
    backgroundColor: colors.primary + "30",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  streakDotInactive: { 
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  streakDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});
