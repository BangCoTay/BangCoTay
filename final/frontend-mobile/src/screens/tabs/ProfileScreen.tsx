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
import { LogOut, ChevronRight, Crown, Settings, CircleDashed } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProfile, useUserSubscription } from "@/hooks/useUsers";
import { useProgress } from "@/hooks/useProgress";
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";

const TIER_CONFIG = {
  premium: { label: "Premium Pro", color: "#A855F7" },
  starter: { label: "Starter", color: colors.primary },
  free: { label: "Free Plan", color: colors.textSecondary },
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
  const tierColor = tierConfig.color;
  const tierLabel = tierConfig.label;

  const isFree = tier === "free";
  const avatarInitial = (profile?.fullName ||
    profile?.email ||
    "U")[0]?.toUpperCase() ?? "U";

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings color={colors.textSecondary} size={24} />
            </TouchableOpacity>
          </MotiView>

          {/* Profile Header Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 100 }}
          >
            <BlurView intensity={40} tint="light" style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
              <Text style={styles.profileName}>{profile?.fullName || "User"}</Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
              <View
                style={[styles.tierBadge, { backgroundColor: tierColor + "15", borderColor: tierColor + "30" }]}
              >
                {tier === 'premium' && <Crown size={12} color={tierColor} style={{ marginRight: 4 }} />}
                <Text style={[styles.tierText, { color: tierColor }]}>
                  {tierLabel}
                </Text>
              </View>
            </BlurView>
          </MotiView>

          {/* Stats */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
          >
            <BlurView intensity={40} tint="light" style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{progress?.streakDays ?? 0}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {progress?.totalTasksCompleted ?? 0}
                </Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round(progress?.completionRate ?? 0)}%
                </Text>
                <Text style={styles.statLabel}>Rate</Text>
              </View>
            </BlurView>
          </MotiView>

          {/* Subscription Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Subscription</Text>

            {isFree && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("Upgrade")}
                style={styles.upgradeCardContainer}
              >
                <LinearGradient
                  colors={["rgba(168, 85, 247, 0.15)", "rgba(168, 85, 247, 0.05)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upgradeCard}
                >
                  <View style={styles.upgradeContent}>
                    <View style={styles.upgradeTitleRow}>
                      <Crown size={20} color="#A855F7" />
                      <Text style={styles.upgradeTitle}>Upgrade to Premium Pro</Text>
                    </View>
                    <Text style={styles.upgradeDesc}>
                      Unlock all 30 days, unlimited AI messages & companion
                    </Text>
                  </View>
                  <ChevronRight size={24} color="#A855F7" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            <BlurView intensity={40} tint="light" style={styles.limitsCard}>
              <View style={styles.limitRow}>
                <Text style={styles.limitLabel}>Days Unlocked</Text>
                <View style={styles.limitProgress}>
                  <Text style={styles.limitValue}>
                    {subscription?.features?.daysUnlocked ?? 3} / 30
                  </Text>
                  <CircleDashed size={16} color={colors.primary} style={{ marginLeft: 8 }} />
                </View>
              </View>
              <View style={styles.limitDivider} />
              <View style={styles.limitRow}>
                <Text style={styles.limitLabel}>AI Messages left</Text>
                <View style={styles.limitProgress}>
                  <Text style={styles.limitValue}>
                    {Math.max(0, (subscription?.features?.aiMessagesTotal ?? 5) - (progress?.aiMessagesUsed ?? 0))}
                  </Text>
                </View>
              </View>
              <View style={styles.limitDivider} />
              <View style={styles.limitRow}>
                <Text style={styles.limitLabel}>AI Companion</Text>
                <View style={[styles.statusBadge, { backgroundColor: subscription?.features?.hasAICompanion ? colors.success + "20" : colors.textTertiary + "20" }]}>
                  <Text style={[styles.statusText, { color: subscription?.features?.hasAICompanion ? colors.success : colors.textSecondary }]}>
                    {subscription?.features?.hasAICompanion ? "Active" : "Locked"}
                  </Text>
                </View>
              </View>
            </BlurView>
          </MotiView>

          {/* Actions */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.section}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSignOut}
            >
              <BlurView intensity={40} tint="light" style={styles.menuItem}>
                <LogOut size={22} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>
                  Sign Out
                </Text>
              </BlurView>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: spacing.xxl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: typography.fontFamily.bold,
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  tierText: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  statsRow: {
    flexDirection: "row",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: { width: 1, backgroundColor: "rgba(255, 255, 255, 0.4)" },
  section: { gap: spacing.md, marginBottom: spacing.xxxl },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  upgradeCardContainer: {
    marginBottom: spacing.sm,
    borderRadius: 24,
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
  },
  upgradeContent: { flex: 1 },
  upgradeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  upgradeTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: "#A855F7",
  },
  upgradeDesc: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    paddingRight: spacing.lg,
    lineHeight: 20,
  },
  limitsCard: {
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  limitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  limitDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  limitLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  limitProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  limitValue: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  menuItemText: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
});
