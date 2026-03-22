import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProfile, useUserSubscription } from "@/hooks/useUsers";
import { useProgress } from "@/hooks/useProgress";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "@/theme";

const TIER_CONFIG = {
  premium: { label: "Premium", color: "#A855F7" },
  starter: { label: "Starter", color: "" }, // will use colors.primary
  free: { label: "Free", color: "" }, // will use colors.textSecondary
} as const;

export function ProfileScreen() {
  const { signOut } = useAuthContext();
  const { data: profile, isLoading } = useUserProfile();
  const { data: subscription } = useUserSubscription();
  const { data: progress } = useProgress();
  const navigation = useNavigation<any>();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const tier = subscription?.tier ?? "free";
  const tierConfig =
    TIER_CONFIG[tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.free;
  const tierColor =
    tierConfig.color ||
    (tier === "starter" ? colors.primary : colors.textSecondary);
  const tierLabel = tierConfig.label;

  const isFree = tier === "free";
  const avatarInitial = (profile?.fullName ||
    profile?.email ||
    "?")[0].toUpperCase();

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={styles.avatarContainer}
            accessibilityLabel={`Profile avatar for ${profile?.fullName || "User"}`}
          >
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.fullName || "User"}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          <View
            style={[styles.tierBadge, { backgroundColor: tierColor + "20" }]}
          >
            <Text style={[styles.tierText, { color: tierColor }]}>
              {tierLabel}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View
            style={styles.statItem}
            accessibilityLabel={`${progress?.streakDays ?? 0} day streak`}
          >
            <Text style={styles.statNumber}>{progress?.streakDays ?? 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View
            style={styles.statItem}
            accessibilityLabel={`${progress?.totalTasksCompleted ?? 0} tasks completed`}
          >
            <Text style={styles.statNumber}>
              {progress?.totalTasksCompleted ?? 0}
            </Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View
            style={styles.statItem}
            accessibilityLabel={`${Math.round(progress?.completionRate ?? 0)} percent completion rate`}
          >
            <Text style={styles.statNumber}>
              {Math.round(progress?.completionRate ?? 0)}%
            </Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          {isFree && (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => navigation.navigate("Upgrade")}
              accessibilityLabel="Upgrade to Pro"
              accessibilityRole="button"
            >
              <View style={styles.upgradeContent}>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeDesc}>
                  Unlock all 30 days, more AI messages & AI companions
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}

          <View style={styles.limitsCard}>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Days Unlocked</Text>
              <Text style={styles.limitValue}>
                {subscription?.features?.daysUnlocked ?? 3} / 30
              </Text>
            </View>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>AI Messages</Text>
              <Text style={styles.limitValue}>
                {progress?.aiMessagesUsed ?? 0} /{" "}
                {subscription?.features?.aiMessagesTotal ?? 5}
              </Text>
            </View>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>AI Companion</Text>
              <Text style={styles.limitValue}>
                {subscription?.features?.hasAICompanion ? "Active" : "Locked"}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSignOut}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.menuItemText, { color: colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xxl,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  tierBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tierText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: colors.border },
  section: { gap: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + "10",
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  upgradeContent: { flex: 1 },
  upgradeTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  upgradeDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  limitsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  limitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 24,
  },
  limitLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  limitValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  menuItemText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
