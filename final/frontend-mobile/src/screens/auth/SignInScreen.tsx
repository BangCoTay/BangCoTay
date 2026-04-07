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
import { useSignIn } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Mail, Lock, ArrowRight, KeyRound } from "lucide-react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SignIn">;

export function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
  const [secondFactorCode, setSecondFactorCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    console.log("Sign In button pressed", { email, isLoaded });
    if (!isLoaded) {
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
        text2: "Please fill in both email and password.",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting sign in...");
      const result = await signIn.create({ identifier: email, password });
      console.log("Sign in result:", result.status);
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Toast.show({
          type: "success",
          text1: "Welcome back!",
          text2: "Successfully signed in.",
        });
      } else if (result.status === "needs_second_factor") {
        console.log("Sign in needs second factor");
        setPendingSecondFactor(true);
        Toast.show({
          type: "info",
          text1: "2FA Required",
          text2: "Please enter your verification code.",
        });
      } else {
        console.warn("Sign in status not complete:", result.status);
        Toast.show({
          type: "error",
          text1: "Incomplete",
          text2: `Sign in status: ${result.status}`,
        });
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      const errorMessage = err.errors?.[0]?.longMessage || "Failed to sign in";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signIn, setActive]);

  const handleSecondFactor = useCallback(async () => {
    console.log("2FA button pressed", { secondFactorCode, isLoaded });
    if (!isLoaded) return;

    if (secondFactorCode.length < 6) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Please enter the 6-digit code.",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting 2FA verification...");
      const result = await signIn.attemptSecondFactor({
        strategy: "totp", // Defaulting to totp, clerk will handle if it's different usually
        code: secondFactorCode,
      });
      console.log("2FA result:", result.status);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Toast.show({
          type: "success",
          text1: "Verified!",
          text2: "Welcome back.",
        });
      } else {
        console.warn("2FA status not complete:", result.status);
        Toast.show({
          type: "error",
          text1: "Incomplete",
          text2: `Status: ${result.status}`,
        });
      }
    } catch (err: any) {
      console.error("2FA error:", err);
      const errorMessage =
        err.errors?.[0]?.longMessage || "Failed to verify 2FA code";
      Toast.show({
        type: "error",
        text1: "2FA Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, secondFactorCode, signIn, setActive]);

  if (pendingSecondFactor) {
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
              <Text style={styles.logo}>Two-Factor Auth</Text>
              <Text style={styles.subtitle}>
                Enter the code from your authenticator app
              </Text>
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
                        placeholder="000000"
                        placeholderTextColor={colors.textTertiary}
                        value={secondFactorCode}
                        onChangeText={setSecondFactorCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSecondFactor}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.button, loading && styles.buttonDisabled]}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Verify & Sign In</Text>
                          <ArrowRight color="#fff" size={20} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setPendingSecondFactor(false)}
                    style={{ marginTop: spacing.md, alignItems: "center" }}
                  >
                    <Text style={[styles.footerText, { color: colors.primary }]}>
                      Back to Sign In
                    </Text>
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
            <Text style={styles.subtitle}>Welcome back to your journey</Text>
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
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoComplete="password"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, loading && styles.buttonDisabled]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Sign In</Text>
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
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => {
              console.log("Navigating to SignUp");
              navigation.navigate("SignUp");
            }}>
              <Text style={styles.linkText}>Create one</Text>
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
