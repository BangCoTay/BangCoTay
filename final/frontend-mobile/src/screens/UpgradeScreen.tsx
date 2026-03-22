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
import { X, CheckCircle2, Sparkles, Rocket } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useFakePayments } from "../hooks/usePayments";
import { useUserSubscription } from "@/hooks/useUsers";
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";

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
      "Full 30-day life plan",
      "More AI coach messages",
      "Unlimited quote generation",
      "Advanced habit tracking",
      "Smart notifications",
      "Standard analytics",
    ],
  },
  {
    id: "premium",
    name: "Premium Pro",
    emoji: "👑",
    fallbackPrice: "$19.99",
    features: [
      "Everything in Starter",
      "Unlimited AI coach messages",
      "AI Companion personas",
      "Behavior analytics",
      "Priority 24/7 support",
      "Early access to new features",
    ],
  },
];

const FeatureRow = React.memo(({ feature }: { feature: string }) => (
  <View style={styles.featureRow}>
    <CheckCircle2 size={18} color={colors.success} style={{ marginTop: 2 }} />
    <Text style={styles.featureText}>{feature}</Text>
  </View>
));

export function UpgradeScreen() {
  const navigation = useNavigation<any>();
  const {
    purchasePlan,
    isLoading: paymentsLoading,
    restorePurchases,
  } = useFakePayments();
  const { data: subscription, isLoading: subLoading } = useUserSubscription();
  const [purchasing, setPurchasing] = useState(false);

  const currentTier = subscription?.tier || "free";
  const isLoading = paymentsLoading || subLoading;

  const handlePurchase = useCallback(
    async (planId: string) => {
      setPurchasing(true);
      try {
        await purchasePlan(planId as "starter" | "premium");
        const isDowngrade = planId === "starter" && currentTier === "premium";
        Alert.alert(
          "Success",
          isDowngrade
            ? "Switched to Starter plan."
            : "Welcome to your upgraded plan!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.message || "Purchase failed. Please try again.",
        );
      } finally {
        setPurchasing(false);
      }
    },
    [purchasePlan, navigation],
  );

  const handleRestore = useCallback(async () => {
    try {
      setPurchasing(true);
      await restorePurchases();
      Alert.alert("Success", "Restored to Free plan successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to restore plan.");
    } finally {
      setPurchasing(false);
    }
  }, [restorePurchases]);

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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Close upgrade screen"
            accessibilityRole="button"
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </MotiView>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 100 }}
            style={styles.heroContainer}
          >
            <View style={styles.heroIconWrapper}>
              <GradientIcon size={48} />
            </View>
            <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
            <Text style={styles.heroSubtitle}>
              Get access to all features and accelerate your transformation
            </Text>
          </MotiView>

          {isLoading ? (
            <ActivityIndicator
              color={colors.primary}
              size="large"
              style={{ marginTop: spacing.xxxl }}
            />
          ) : (
            <View style={styles.plansContainer}>
              {PLANS.map((plan, index) => {
                const price = plan.fallbackPrice;

                return (
                  <MotiView
                    key={plan.id}
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: "timing",
                      duration: 500,
                      delay: 200 + index * 100,
                    }}
                  >
                    <BlurView
                      intensity={plan.id === "premium" ? 60 : 40}
                      tint="light"
                      style={[
                        styles.planCard,
                        plan.id === "premium" && styles.planCardPremium,
                        currentTier === plan.id && styles.planCardActive,
                      ]}
                    >
                      {plan.id === "premium" && (
                        <View style={styles.popularBadge}>
                          <LinearGradient
                            colors={["#A855F7", "#8B5CF6"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                          />
                          <Text style={styles.popularText}>BEST VALUE</Text>
                        </View>
                      )}

                      <View style={styles.planHeaderContainer}>
                        <View
                          style={[
                            styles.planEmojiContainer,
                            plan.id === "premium" && {
                              backgroundColor: "rgba(168, 85, 247, 0.15)",
                            },
                          ]}
                        >
                          <Text style={styles.planEmoji}>{plan.emoji}</Text>
                        </View>
                        <View style={styles.planTitleContainer}>
                          <Text
                            style={[
                              styles.planName,
                              plan.id === "premium" && { color: "#A855F7" },
                            ]}
                          >
                            {plan.name}
                          </Text>
                          <Text style={styles.planPrice}>{price}</Text>
                          <Text style={styles.planPriceNote}>
                            one-time payment
                          </Text>
                        </View>
                      </View>

                      <View style={styles.planDivider} />

                      <View style={styles.featuresList}>
                        {plan.features.map((feature) => (
                          <FeatureRow key={feature} feature={feature} />
                        ))}
                      </View>

                      <TouchableOpacity
                        style={styles.purchaseButtonContainer}
                        onPress={() => handlePurchase(plan.id)}
                        disabled={purchasing}
                        accessibilityLabel={`Purchase ${plan.name} plan for ${price}`}
                        accessibilityRole="button"
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            currentTier === plan.id
                              ? ["#CBD5E1", "#94A3B8"]
                              : plan.id === "premium"
                                ? ["#A855F7", "#8B5CF6"]
                                : [colors.primaryLight, colors.primary]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.purchaseButton}
                        >
                          {purchasing ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.purchaseButtonText}>
                              {currentTier === plan.id
                                ? "Current Plan"
                                : `Get ${plan.name}`}
                            </Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </BlurView>
                  </MotiView>
                );
              })}
            </View>
          )}

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 600 }}
          >
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              accessibilityLabel="Restore previous purchases"
              accessibilityRole="button"
            >
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const GradientIcon = ({ size }: { size: number }) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <LinearGradient
      colors={["#A855F7", colors.primary]}
      style={StyleSheet.absoluteFillObject}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
    <Rocket size={size * 0.55} color="#fff" />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  heroContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  heroIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  plansContainer: {
    gap: spacing.xl,
    width: "100%",
  },
  planCard: {
    padding: spacing.xl,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  planCardPremium: {
    borderColor: "rgba(168, 85, 247, 0.5)",
    borderWidth: 2,
  },
  planCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "rgba(8, 145, 178, 0.05)",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  popularText: {
    fontSize: fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  planHeaderContainer: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  planEmojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  planEmoji: { fontSize: 32 },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  planPriceNote: {
    fontSize: fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  planDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginVertical: spacing.md,
  },
  featuresList: {
    width: "100%",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    lineHeight: 20,
  },
  purchaseButtonContainer: {
    width: "100%",
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  purchaseButton: {
    width: "100%",
    padding: spacing.lg,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
  restoreButton: {
    marginTop: spacing.xxl,
    padding: spacing.md,
    alignItems: "center",
  },
  restoreText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    textDecorationLine: "underline",
  },
});
