import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSignUp } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Mail, Lock, ArrowRight, KeyRound } from "lucide-react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignUp">;

export function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = useCallback(async () => {
    console.log("Sign Up button pressed", { email, isLoaded, hasSignUp: !!signUp });
    if (!isLoaded || !signUp) {
      Toast.show({
        type: "info",
        text1: "Clerk Loading",
        text2: "Authentication service is still initializing...",
      });
      return;
    }

    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please provide both an email and a password.",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("1. Creating sign up attempt...");
      // Check if there is an existing attempt that we shouldn't overwrite if it's already in a good state
      // but usually for fresh sign up we call create.
      const attempt = await signUp.create({ emailAddress: email, password });
      
      console.log("2. Sign up success, status:", attempt.status);

      console.log("3. Preparing email verification...");
      // Using the result of create directly to ensure we have the latest version of the attempt
      await attempt.prepareEmailAddressVerification({ strategy: "email_code" });
      
      console.log("4. Verification prepared successfully.");
      setPendingVerification(true);
      
      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: "Verification code sent to your email.",
      });
    } catch (err: any) {
      console.error("Sign up error:", err);
      const errorMessage = err.errors?.[0]?.longMessage || err.message || "Failed to sign up";
      
      // Specifically handle the "No sign up attempt found" error which is common on Web due to session sync issues
      const isSessionError = 
        errorMessage.toLowerCase().includes("no sign up attempt") || 
        errorMessage.toLowerCase().includes("unable to complete a get request");
      
      Toast.show({
        type: "error",
        text1: isSessionError ? "Session Error" : "Error",
        text2: isSessionError ? "Please refresh the page (F5) and try again." : errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signUp]);

  const handleVerify = useCallback(async () => {
    console.log("Verify button pressed", { code, isLoaded, hasSignUp: !!signUp });
    if (!isLoaded || !signUp) {
      Toast.show({
        type: "info",
        text1: "Clerk Loading",
        text2: "Wait a moment...",
      });
      return;
    }

    if (code.length < 6) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Please enter the 6-digit verification code.",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting verification...");
      // Using signUp correctly from the hook
      const result = await signUp.attemptEmailAddressVerification({ code });
      console.log("Verification result status:", result.status);
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Toast.show({
          type: "success",
          text1: "Account Verified!",
          text2: "Successfully signed in. Welcome!",
        });
      } else {
        console.warn("Verification in-progress but not complete:", result.status);
        Toast.show({
          type: "info",
          text1: "Incomplete",
          text2: `Verification status: ${result.status}`,
        });
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const errorMessage = err.errors?.[0]?.longMessage || err.message || "Failed to verify email";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, signUp, setActive]);

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <LinearGradient
          colors={[colors.background, colors.backgroundSecondary, "#E0F2FE"]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 700 }}
              style={styles.header}
            >
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={styles.logoIcon}
                />
              </View>
              <Text style={styles.logo}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a verification code to
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 600, delay: 200 }}
            >
              <BlurView intensity={60} tint="light" style={styles.formCard}>
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Verification Code</Text>
                    <View style={styles.inputContainer}>
                      <KeyRound
                        color={colors.primary}
                        size={20}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor={colors.textTertiary}
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleVerify}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.button,
                        loading && styles.buttonDisabled,
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Verify Account</Text>
                          <ArrowRight color="#fff" size={20} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary, "#E0F2FE"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 700 }}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.logoIcon}
              />
            </View>
            <Text style={styles.logo}>Resetify</Text>
            <Text style={styles.subtitle}>Start your transformation</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 800, delay: 200 }}
          >
            <BlurView intensity={60} tint="light" style={styles.formCard}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputContainer}>
                    <Mail
                      color={colors.primary}
                      size={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Lock
                      color={colors.primary}
                      size={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Create a secure password"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoComplete="new-password"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.button,
                      (loading || !email || !password) && styles.buttonDisabled,
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Create Account</Text>
                        <ArrowRight color="#fff" size={20} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </MotiView>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 600, delay: 600 }}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => {
              console.log("Navigating to SignIn");
              navigation.navigate("SignIn");
            }}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
    marginTop: spacing.xl,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoIcon: {
    flex: 1,
  },
  logo: {
    fontSize: fontSize.hero,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  emailText: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  formCard: {
    borderRadius: 24,
    padding: spacing.xl,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    overflow: "hidden",
  },
  form: {
    gap: spacing.xl,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    height: 56,
  },
  inputIcon: {
    marginLeft: spacing.lg,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    paddingRight: spacing.lg,
  },
  button: {
    borderRadius: borderRadius.lg,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    gap: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
});
