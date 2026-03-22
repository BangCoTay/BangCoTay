import React, { useState, useCallback } from "react";
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
import { useRevenueCat } from "@/hooks/usePayments";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "@/theme";

interface PlanDefinition {
  id: string;
  name: string;
  emoji: string;
  features: string[];
  fallbackPrice: string;
}

const PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    emoji: "⭐",
    fallbackPrice: "$9.99",
    features: [
      "Full 30-day plan",
      "30 AI coach messages",
      "Unlimited quote regenerations",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    emoji: "👑",
    fallbackPrice: "$19.99",
    features: [
      "Full 30-day plan",
      "100 AI coach messages",
      "Unlimited quote regenerations",
      "AI Companion personas",
      "Advanced analytics",
      "Priority support",
    ],
  },
];

const FeatureRow = React.memo(({ feature }: { feature: string }) => (
  <View style={styles.featureRow}>
    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
    <Text style={styles.featureText}>{feature}</Text>
  </View>
));

export function UpgradeScreen() {
  const navigation = useNavigation();
  const { packages, isLoading, purchasePackage, restorePurchases } =
    useRevenueCat();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = useCallback(
    async (planId: string) => {
      const pkg = packages.find((p: any) =>
        p.identifier.toLowerCase().includes(planId),
      );
      if (!pkg) {
        Alert.alert("Error", "Package not available. Please try again later.");
        return;
      }

      setPurchasing(true);
      try {
        const result = await purchasePackage(pkg);
        if (result) {
          Alert.alert("Success", "Welcome to your upgraded plan!", [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]);
        }
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.message || "Purchase failed. Please try again.",
        );
      } finally {
        setPurchasing(false);
      }
    },
    [packages, purchasePackage, navigation],
  );

  const handleRestore = useCallback(async () => {
    try {
      await restorePurchases();
      Alert.alert("Success", "Purchases restored successfully!");
    } catch {
      Alert.alert("Error", "Failed to restore purchases.");
    }
  }, [restorePurchases]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close upgrade screen"
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroEmoji}>{"🚀"}</Text>
        <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
        <Text style={styles.heroSubtitle}>
          Get access to all features and accelerate your transformation
        </Text>

        {isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={{ marginTop: spacing.xxxl }}
          />
        ) : (
          <View style={styles.plansContainer}>
            {PLANS.map((plan) => {
              const pkg = packages.find((p: any) =>
                p.identifier.toLowerCase().includes(plan.id),
              );
              const price = pkg?.product?.priceString ?? plan.fallbackPrice;

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    plan.id === "premium" && styles.planCardPremium,
                  ]}
                >
                  {plan.id === "premium" && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <Text style={styles.planEmoji}>{plan.emoji}</Text>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>{price}</Text>
                  <Text style={styles.planPriceNote}>one-time payment</Text>

                  <View style={styles.featuresList}>
                    {plan.features.map((feature) => (
                      <FeatureRow key={feature} feature={feature} />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.purchaseButton,
                      plan.id === "premium" && styles.purchaseButtonPremium,
                    ]}
                    onPress={() => handlePurchase(plan.id)}
                    disabled={purchasing}
                    accessibilityLabel={`Purchase ${plan.name} plan for ${price}`}
                    accessibilityRole="button"
                  >
                    {purchasing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.purchaseButtonText}>
                        Get {plan.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          accessibilityLabel="Restore previous purchases"
          accessibilityRole="button"
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.lg,
    alignItems: "center",
    paddingBottom: 50,
  },
  heroEmoji: { fontSize: 56, marginTop: spacing.xxl },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  plansContainer: {
    gap: spacing.lg,
    marginTop: spacing.xxxl,
    width: "100%",
  },
  planCard: {
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    gap: spacing.sm,
  },
  planCardPremium: { borderColor: colors.primary },
  popularBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: "#FFFFFF",
  },
  planEmoji: { fontSize: 36 },
  planName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  planPrice: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    color: colors.primary,
  },
  planPriceNote: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  featuresList: {
    width: "100%",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 28,
  },
  featureText: { fontSize: fontSize.sm, color: colors.text },
  purchaseButton: {
    width: "100%",
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.text,
    alignItems: "center",
    marginTop: spacing.md,
    minHeight: 48,
    justifyContent: "center",
  },
  purchaseButtonPremium: { backgroundColor: colors.primary },
  purchaseButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  restoreButton: {
    marginTop: spacing.xxl,
    padding: spacing.md,
    minHeight: 48,
    justifyContent: "center",
  },
  restoreText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
