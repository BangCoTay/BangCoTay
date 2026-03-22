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
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { MotiView, AnimatePresence } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { ArrowLeft, ArrowRight, Check } from "lucide-react-native";

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

  useEffect(() => {
    if (
      ["social-proof", "outcome-preview", "relatability"].includes(currentStep)
    ) {
      const timer = setTimeout(goNext, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, goNext]);

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
          setCurrentStepIndex(7);
          setIsSubmitting(false);
        }
      })();
    }
  }, [currentStep]);

  const filteredAddictions = ADDICTIONS.filter(
    (a) => a.niche === tempOnboardingData.niche,
  );

  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const PageWrapper = ({ children, keyId }: { children: React.ReactNode, keyId: string }) => (
    <MotiView
      key={keyId}
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -20 }}
      transition={{ type: "timing", duration: 400 }}
      style={styles.stepContainer}
    >
      {children}
    </MotiView>
  );

  const renderStep = () => {
    switch (currentStep) {
      case "identity":
        return (
          <PageWrapper keyId="identity">
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
              <Text style={styles.stepTitle}>What do you want to change?</Text>
              <Text style={styles.stepSubtitle}>
                Select the area that matters most to you
              </Text>
            </MotiView>
            <View style={styles.optionsGrid}>
              {NICHES.map((niche, i) => {
                const isSelected = tempOnboardingData.niche === niche.id;
                return (
                  <MotiView
                    key={niche.id}
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 200 + i * 50 }}
                    style={{ width: "48%" }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setNiche(niche.id);
                        setTimeout(goNext, 400);
                      }}
                    >
                      <BlurView
                        intensity={isSelected ? 80 : 40}
                        tint="light"
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                        ]}
                      >
                        <Text style={styles.optionEmoji}>{niche.icon}</Text>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {niche.label}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkBadgeBorder}>
                            <Check color={colors.primary} size={14} />
                          </View>
                        )}
                      </BlurView>
                    </TouchableOpacity>
                  </MotiView>
                );
              })}
            </View>
          </PageWrapper>
        );

      case "social-proof":
        return (
          <PageWrapper keyId="social-proof">
            <View style={styles.interstitialContainer}>
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 100 }}
              >
                <Text style={styles.interstitialEmoji}>🌟</Text>
              </MotiView>
              <Text style={styles.interstitialTitle}>You're not alone</Text>
              <Text style={styles.interstitialText}>
                Over 120,000+ people have started their journey with Resetify
              </Text>
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: spacing.xl }}
              />
            </View>
          </PageWrapper>
        );

      case "habit":
        return (
          <PageWrapper keyId="habit">
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
              <Text style={styles.stepTitle}>What's your specific challenge?</Text>
              <Text style={styles.stepSubtitle}>
                Choose what you want to overcome
              </Text>
            </MotiView>
            <View style={styles.optionsList}>
              {filteredAddictions.map((addiction, i) => {
                const isSelected = tempOnboardingData.addiction === addiction.id;
                return (
                  <MotiView
                    key={addiction.id}
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 150 + i * 50 }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setAddiction(addiction.id);
                        setTimeout(goNext, 400);
                      }}
                    >
                      <BlurView
                        intensity={isSelected ? 80 : 40}
                        tint="light"
                        style={[
                          styles.listOption,
                          isSelected && styles.listOptionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.listOptionText,
                            isSelected && styles.listOptionTextSelected,
                          ]}
                        >
                          {addiction.label}
                        </Text>
                        {isSelected && <Check color={colors.primary} size={20} />}
                      </BlurView>
                    </TouchableOpacity>
                  </MotiView>
                );
              })}
            </View>
          </PageWrapper>
        );

      case "outcome-preview":
        return (
          <PageWrapper keyId="outcome-preview">
            <View style={styles.interstitialContainer}>
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 100 }}
              >
                <Text style={styles.interstitialEmoji}>📈</Text>
              </MotiView>
              <Text style={styles.interstitialTitle}>In 30 days, you could...</Text>
              <View style={styles.outcomeList}>
                {["Break free from the cycle", "Build lasting healthy habits", "Feel more in control of your life"].map((item, i) => (
                  <MotiView
                    key={i}
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 300 + i * 200 }}
                    style={styles.outcomeRow}
                  >
                    <View style={styles.outcomeCheck}>
                      <Check color={colors.primary} size={16} />
                    </View>
                    <Text style={styles.outcomeItem}>{item}</Text>
                  </MotiView>
                ))}
              </View>
            </View>
          </PageWrapper>
        );

      case "intensity":
        return (
          <PageWrapper keyId="intensity">
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
              <Text style={styles.stepTitle}>How severe is it?</Text>
              <Text style={styles.stepSubtitle}>
                Be honest - this helps us personalize your plan
              </Text>
            </MotiView>
            <View style={styles.optionsList}>
              {SEVERITIES.map((sev, i) => {
                const isSelected = tempOnboardingData.severity === sev.id;
                return (
                  <MotiView
                    key={sev.id}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 150 + i * 100 }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setSeverity(sev.id);
                        setTimeout(goNext, 400);
                      }}
                    >
                      <BlurView
                        intensity={isSelected ? 80 : 40}
                        tint="light"
                        style={[
                          styles.severityCard,
                          isSelected && styles.severityCardSelected,
                        ]}
                      >
                        <Text style={styles.severityEmoji}>{sev.emoji}</Text>
                        <View style={styles.severityContent}>
                          <Text
                            style={[
                              styles.severityLabel,
                              isSelected && styles.severityLabelSelected,
                            ]}
                          >
                            {sev.label}
                          </Text>
                          <Text style={styles.severityDesc}>{sev.desc}</Text>
                        </View>
                        {isSelected && <Check color={colors.primary} size={20} />}
                      </BlurView>
                    </TouchableOpacity>
                  </MotiView>
                );
              })}
            </View>
          </PageWrapper>
        );

      case "pain-points":
        return (
          <PageWrapper keyId="pain-points">
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
              <Text style={styles.stepTitle}>What's being affected?</Text>
              <Text style={styles.stepSubtitle}>Select all that apply</Text>
            </MotiView>
            <View style={styles.optionsGrid}>
              {PAIN_POINTS.map((pp, i) => {
                const isSelected = tempOnboardingData.painPoints.includes(pp.id);
                return (
                  <MotiView
                    key={pp.id}
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 150 + i * 50 }}
                    style={{ width: "48%" }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => togglePainPoint(pp.id)}
                    >
                      <BlurView
                        intensity={isSelected ? 80 : 40}
                        tint="light"
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                        ]}
                      >
                        <Text style={styles.optionEmoji}>{pp.icon}</Text>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {pp.label}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkBadgeBorder}>
                            <Check color={colors.primary} size={14} />
                          </View>
                        )}
                      </BlurView>
                    </TouchableOpacity>
                  </MotiView>
                );
              })}
            </View>
            {tempOnboardingData.painPoints.length > 0 && (
              <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
                <TouchableOpacity onPress={goNext} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.continueButtonGradient}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <ArrowRight color="#fff" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>
            )}
          </PageWrapper>
        );

      case "relatability":
        return (
          <PageWrapper keyId="relatability">
            <View style={styles.interstitialContainer}>
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 100 }}
              >
                <Text style={styles.interstitialEmoji}>💬</Text>
              </MotiView>
              <Text style={styles.interstitialTitle}>
                "I was exactly where you are..."
              </Text>
              <View style={styles.quoteCard}>
                <Text style={styles.interstitialText}>
                  "After 30 days with Resetify, I finally feel in control. The daily
                  tasks and AI coach made all the difference."
                </Text>
                <Text style={styles.quoteAuthor}>- Sarah, 24</Text>
              </View>
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: spacing.xl }}
              />
            </View>
          </PageWrapper>
        );

      case "commitment":
        return (
          <PageWrapper keyId="commitment">
            <View style={styles.interstitialContainer}>
              <MotiView
                from={{ scale: 0, rotate: "-15deg" }}
                animate={{ scale: 1, rotate: "0deg" }}
                transition={{ type: "spring", damping: 12, delay: 100 }}
              >
                <Text style={styles.interstitialEmoji}>🎯</Text>
              </MotiView>
              <Text style={styles.interstitialTitle}>Your plan is ready!</Text>
              <Text style={styles.interstitialText}>
                We've built a personalized 30-day plan based on your responses. Are you ready to transform your life?
              </Text>
              
              <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }} style={{ width: "100%" }}>
                <TouchableOpacity onPress={goNext} activeOpacity={0.8} style={{ width: "100%" }}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>Let's Do This!</Text>
                    <ArrowRight color="#fff" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>
            </View>
          </PageWrapper>
        );

      case "loading":
        return (
          <PageWrapper keyId="loading">
            <View style={styles.interstitialContainer}>
              <MotiView
                from={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "timing", duration: 1000, loop: true }}
                style={styles.loadingLogoContainer}
              >
                <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.loadingLogo} />
              </MotiView>
              <Text style={styles.interstitialTitle}>Building your plan...</Text>
              <Text style={styles.interstitialText}>
                Personalizing your 30-day transformation journey
              </Text>
            </View>
          </PageWrapper>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary, "#E0F2FE"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header / Progress Bar */}
      <View style={styles.headerArea}>
        {currentStepIndex > 0 &&
          ![
            "social-proof",
            "outcome-preview",
            "relatability",
            "loading",
            "commitment",
          ].includes(currentStep) ? (
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <ArrowLeft color={colors.textSecondary} size={24} />
            </TouchableOpacity>
        ) : <View style={styles.backButtonPlaceholder} />}
        
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBar}>
            <MotiView 
              animate={{ width: `${progress}%` }} 
              transition={{ type: "timing", duration: 500 }}
              style={styles.progressFill} 
            >
              <LinearGradient colors={[colors.primaryLight, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </MotiView>
          </View>
        </View>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AnimatePresence exitBeforeEnter>
          {renderStep()}
        </AnimatePresence>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    justifyContent: "space-between",
  },
  progressBarWrapper: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius.full,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  progressFill: {
    height: "100%",
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xxxl,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  optionCard: {
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  checkBadgeBorder: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  optionEmoji: {
    fontSize: 36,
  },
  optionLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
    textAlign: "center",
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionsList: {
    gap: spacing.lg,
  },
  listOption: {
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  listOptionText: {
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
  },
  listOptionTextSelected: {
    color: colors.primary,
  },
  severityCard: {
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  severityCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  severityEmoji: {
    fontSize: 32,
  },
  severityContent: {
    flex: 1,
  },
  severityLabel: {
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
  },
  severityLabelSelected: {
    color: colors.primary,
  },
  severityDesc: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 4,
  },
  continueButton: {
    borderRadius: borderRadius.lg,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xxl,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  interstitialContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  interstitialEmoji: {
    fontSize: 72,
    marginBottom: spacing.xl,
  },
  interstitialTitle: {
    fontSize: fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  interstitialText: {
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 28,
  },
  outcomeList: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
    width: "100%",
  },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  outcomeCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  outcomeItem: {
    fontSize: fontSize.md,
    color: colors.text,
    fontFamily: typography.fontFamily.semibold,
  },
  quoteCard: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: spacing.xxl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    marginTop: spacing.xl,
    width: "100%",
  },
  quoteAuthor: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginTop: spacing.md,
    textAlign: "right",
  },
  startButton: {
    borderRadius: borderRadius.lg,
    height: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xxxl,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  loadingLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: spacing.xxl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  loadingLogo: {
    flex: 1,
  },
});
