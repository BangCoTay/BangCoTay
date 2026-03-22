import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useUserSubscription } from "../../hooks/useUsers";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Star, User, Shield, CreditCard } from "lucide-react-native";

export const ProfileScreen = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const { data: subscription } = useUserSubscription();
  const queryClient = useQueryClient();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isPremium = subscription?.tier === "premium";

  const handleSignOut = () => {
    signOut();
  };

  const handleFakeUpgrade = () => {
    if (isPremium) {
      Alert.alert("Already Premium", "You are already on the Premium plan!");
      return;
    }

    Alert.alert(
      "Upgrade to Premium",
      "This is a fake payment for testing. Do you want to upgrade for $0.00?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          style: "default",
          onPress: () => {
            setIsUpgrading(true);
            setTimeout(() => {
              // Mock cache update
              queryClient.setQueryData(["subscription"], {
                tier: "premium",
                status: "active",
                features: {
                  hasAICompanion: true,
                  aiMessagesTotal: -1,
                  monthlyQuotesTotal: -1,
                },
              });

              // Unlock plan locally as well
              const currentPlan = queryClient.getQueryData([
                "currentPlan",
              ]) as any;
              if (currentPlan && currentPlan.dayPlans) {
                const unlockedPlans = currentPlan.dayPlans.map((dp: any) => ({
                  ...dp,
                  unlocked: true,
                }));
                queryClient.setQueryData(["currentPlan"], {
                  ...currentPlan,
                  dayPlans: unlockedPlans,
                });
              }

              setIsUpgrading(false);
              Alert.alert(
                "Payment Successful",
                "Welcome to Premium! All features are now unlocked. 🎉",
              );
            }, 1000);
          },
        },
      ],
    );
  };

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User color="#2563EB" size={40} />
        </View>
        <Text style={styles.name}>{user?.fullName || "User"}</Text>
        <Text style={styles.email}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.planTitle}>Current Plan</Text>
            <Text style={styles.planTier}>
              {isPremium ? "Premium Plan" : "Free Starter"}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              isPremium ? styles.badgePremium : styles.badgeFree,
            ]}
          >
            {isPremium ? (
              <Star color="#D97706" size={14} />
            ) : (
              <Shield color="#64748B" size={14} />
            )}
            <Text
              style={[
                styles.badgeText,
                isPremium ? styles.badgeTextPremium : styles.badgeTextFree,
              ]}
            >
              {isPremium ? "PRO" : "FREE"}
            </Text>
          </View>
        </View>

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={handleFakeUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <View style={styles.upgradeBtnContent}>
                <CreditCard color="#ffffff" size={18} />
                <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconBg, { backgroundColor: "#FEE2E2" }]}>
              <LogOut color="#EF4444" size={20} />
            </View>
            <Text style={styles.menuItemTextLogout}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 32 },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: { fontFamily: "Caveat_700Bold", fontSize: 32, color: "#18181B" },
  email: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  planCard: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 32,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  planTitle: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  planTier: { fontFamily: "Quicksand_700Bold", fontSize: 20, color: "#18181B" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgePremium: { backgroundColor: "#FEF3C7" },
  badgeFree: { backgroundColor: "#F1F5F9" },
  badgeText: { fontFamily: "Quicksand_700Bold", fontSize: 12 },
  badgeTextPremium: { color: "#D97706" },
  badgeTextFree: { color: "#64748B" },

  upgradeBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  upgradeBtnContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  upgradeBtnText: {
    color: "#ffffff",
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 16,
  },

  settingsSection: {},
  sectionTitle: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 14,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 8,
  },
  menuItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemTextLogout: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 16,
    color: "#EF4444",
  },
});
