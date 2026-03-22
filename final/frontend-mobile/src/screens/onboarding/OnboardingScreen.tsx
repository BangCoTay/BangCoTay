import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@/store/appStore";
import { useSubmitOnboarding } from "@/hooks/useOnboarding";
import { useGeneratePlan } from "@/hooks/usePlans";
import { useAuthContext } from "@/contexts/AuthContext";
import { NICHES, ADDICTIONS, PAIN_POINTS } from "@/types";
import type { Niche, Severity, PainPoint } from "@/types";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "@/theme";

const { width } = Dimensions.get("window");

const STEPS = [
  "identity",
  "social-proof",
  "habit",
  "outcome-preview",
  "intensity",
  "pain-points",
  "relatability",
  "commitment",
  "loading",
] as const;

type Step = (typeof STEPS)[number];

const SEVERITIES: {
  id: Severity;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  {
    id: "mild",
    label: "Mild",
    emoji: "🌱",
    desc: "I know it's a problem, just starting",
  },
  {
    id: "moderate",
    label: "Moderate",
    emoji: "🔥",
    desc: "It's affecting my daily life",
  },
  {
    id: "severe",
    label: "Severe",
    emoji: "💥",
    desc: "I can't control it anymore",
  },
];

export function OnboardingScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STEPS[currentStepIndex];

  const {
    tempOnboardingData,
    setNiche,
    setAddiction,
    setSeverity,
    togglePainPoint,
    clearTempOnboardingData,
  } = useAppStore();

  const submitOnboarding = useSubmitOnboarding();
  const generatePlan = useGeneratePlan();
  const { refreshUser } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goNext = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Auto-advance for interstitial steps
  useEffect(() => {
    if (
      ["social-proof", "outcome-preview", "relatability"].includes(currentStep)
    ) {
      const timer = setTimeout(goNext, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, goNext]);

  // Submit on loading step
  useEffect(() => {
    if (currentStep === "loading" && !isSubmitting) {
      setIsSubmitting(true);
      (async () => {
        try {
          await submitOnboarding.mutateAsync(tempOnboardingData as any);
          await generatePlan.mutateAsync();
          clearTempOnboardingData();
          refreshUser();
        } catch (error) {
          console.error("Onboarding submission error:", error);
          setCurrentStepIndex(7); // Go back to commitment
          setIsSubmitting(false);
        }
      })();
    }
  }, [currentStep]);

  const filteredAddictions = ADDICTIONS.filter(
    (a) => a.niche === tempOnboardingData.niche,
  );

  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case "identity":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What do you want to change?</Text>
            <Text style={styles.stepSubtitle}>
              Select the area that matters most to you
            </Text>
            <View style={styles.optionsGrid}>
              {NICHES.map((niche) => (
                <TouchableOpacity
                  key={niche.id}
                  style={[
                    styles.optionCard,
                    tempOnboardingData.niche === niche.id &&
                      styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    setNiche(niche.id);
                    setTimeout(goNext, 300);
                  }}
                >
                  <Text style={styles.optionEmoji}>{niche.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      tempOnboardingData.niche === niche.id &&
                        styles.optionLabelSelected,
                    ]}
                  >
                    {niche.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "social-proof":
        return (
          <View style={styles.interstitialContainer}>
            <Text style={styles.interstitialEmoji}>🌟</Text>
            <Text style={styles.interstitialTitle}>You're not alone</Text>
            <Text style={styles.interstitialText}>
              Over 120,000+ people have started their journey with Resetify
            </Text>
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        );

      case "habit":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              What's your specific challenge?
            </Text>
            <Text style={styles.stepSubtitle}>
              Choose what you want to overcome
            </Text>
            <View style={styles.optionsList}>
              {filteredAddictions.map((addiction) => (
                <TouchableOpacity
                  key={addiction.id}
                  style={[
                    styles.listOption,
                    tempOnboardingData.addiction === addiction.id &&
                      styles.listOptionSelected,
                  ]}
                  onPress={() => {
                    setAddiction(addiction.id);
                    setTimeout(goNext, 300);
                  }}
                >
                  <Text
                    style={[
                      styles.listOptionText,
                      tempOnboardingData.addiction === addiction.id &&
                        styles.listOptionTextSelected,
                    ]}
                  >
                    {addiction.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "outcome-preview":
        return (
          <View style={styles.interstitialContainer}>
            <Text style={styles.interstitialEmoji}>📈</Text>
            <Text style={styles.interstitialTitle}>
              In 30 days, you could...
            </Text>
            <View style={styles.outcomeList}>
              <Text style={styles.outcomeItem}>Break free from the cycle</Text>
              <Text style={styles.outcomeItem}>
                Build lasting healthy habits
              </Text>
              <Text style={styles.outcomeItem}>
                Feel more in control of your life
              </Text>
            </View>
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        );

      case "intensity":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How severe is it?</Text>
            <Text style={styles.stepSubtitle}>
              Be honest - this helps us personalize your plan
            </Text>
            <View style={styles.optionsList}>
              {SEVERITIES.map((sev) => (
                <TouchableOpacity
                  key={sev.id}
                  style={[
                    styles.severityCard,
                    tempOnboardingData.severity === sev.id &&
                      styles.severityCardSelected,
                  ]}
                  onPress={() => {
                    setSeverity(sev.id);
                    setTimeout(goNext, 300);
                  }}
                >
                  <Text style={styles.severityEmoji}>{sev.emoji}</Text>
                  <View style={styles.severityContent}>
                    <Text
                      style={[
                        styles.severityLabel,
                        tempOnboardingData.severity === sev.id &&
                          styles.severityLabelSelected,
                      ]}
                    >
                      {sev.label}
                    </Text>
                    <Text style={styles.severityDesc}>{sev.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "pain-points":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's being affected?</Text>
            <Text style={styles.stepSubtitle}>Select all that apply</Text>
            <View style={styles.optionsGrid}>
              {PAIN_POINTS.map((pp) => (
                <TouchableOpacity
                  key={pp.id}
                  style={[
                    styles.optionCard,
                    tempOnboardingData.painPoints.includes(pp.id) &&
                      styles.optionCardSelected,
                  ]}
                  onPress={() => togglePainPoint(pp.id)}
                >
                  <Text style={styles.optionEmoji}>{pp.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      tempOnboardingData.painPoints.includes(pp.id) &&
                        styles.optionLabelSelected,
                    ]}
                  >
                    {pp.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {tempOnboardingData.painPoints.length > 0 && (
              <TouchableOpacity style={styles.continueButton} onPress={goNext}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case "relatability":
        return (
          <View style={styles.interstitialContainer}>
            <Text style={styles.interstitialEmoji}>💬</Text>
            <Text style={styles.interstitialTitle}>
              "I was exactly where you are..."
            </Text>
            <Text style={styles.interstitialText}>
              "After 30 days with Resetify, I finally feel in control. The daily
              tasks and AI coach made all the difference." - Sarah, 24
            </Text>
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        );

      case "commitment":
        return (
          <View style={styles.interstitialContainer}>
            <Text style={styles.interstitialEmoji}>🎯</Text>
            <Text style={styles.interstitialTitle}>Your plan is ready!</Text>
            <Text style={styles.interstitialText}>
              We've created a personalized 30-day plan just for you. Are you
              ready to start your transformation?
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={goNext}>
              <Text style={styles.startButtonText}>Let's Do This!</Text>
            </TouchableOpacity>
          </View>
        );

      case "loading":
        return (
          <View style={styles.interstitialContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.interstitialTitle}>Building your plan...</Text>
            <Text style={styles.interstitialText}>
              Personalizing your 30-day transformation journey
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        {currentStepIndex > 0 &&
          ![
            "social-proof",
            "outcome-preview",
            "relatability",
            "loading",
          ].includes(currentStep) && (
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xxl,
    justifyContent: "center",
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xxxl,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
  },
  optionCard: {
    width: (width - spacing.xxl * 2 - spacing.md) / 2 - 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionsList: {
    gap: spacing.md,
  },
  listOption: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  listOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  listOptionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    textAlign: "center",
  },
  listOptionTextSelected: {
    color: colors.primary,
  },
  severityCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  severityCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  severityEmoji: {
    fontSize: 28,
  },
  severityContent: {
    flex: 1,
  },
  severityLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  severityLabelSelected: {
    color: colors.primary,
  },
  severityDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  interstitialContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  interstitialEmoji: {
    fontSize: 64,
    marginBottom: spacing.xxl,
  },
  interstitialTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  interstitialText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  outcomeList: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  outcomeItem: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    marginTop: spacing.xxxl,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});
