import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshCw, MessageCircleHeart } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useQuotes, useRegenerateQuotes } from "@/hooks/useQuotes";
import { useUserSubscription } from "@/hooks/useUsers";
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";

interface Quote {
  id: string;
  content: string;
  category: "practical" | "emotional";
}

const QuoteCard = React.memo(({ quote, index }: { quote: Quote, index: number }) => (
  <MotiView
    from={{ opacity: 0, translateY: 30, scale: 0.95 }}
    animate={{ opacity: 1, translateY: 0, scale: 1 }}
    transition={{ type: "timing", duration: 500, delay: index * 100 }}
  >
    <BlurView intensity={50} tint="light" style={styles.quoteCard}>
      <View style={styles.quoteIconContainer}>
        <MessageCircleHeart size={24} color={colors.primary} />
      </View>
      <Text style={styles.quoteText}>"{quote.content}"</Text>
      <View style={styles.quoteFooter}>
        <View
          style={[
            styles.categoryBadge,
            quote.category === "practical"
              ? styles.practicalBadge
              : styles.emotionalBadge,
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              quote.category === "practical"
                ? styles.practicalText
                : styles.emotionalText,
            ]}
          >
            {quote.category === "practical" ? "Practical Action" : "Emotional Support"}
          </Text>
        </View>
      </View>
    </BlurView>
  </MotiView>
));

export function QuotesScreen() {
  const { data: quotesData, isLoading } = useQuotes();
  const regenerateQuotes = useRegenerateQuotes();
  const { data: subscription } = useUserSubscription();
  const navigation = useNavigation<any>();

  const quotes: Quote[] = quotesData?.quotes ?? [];
  const remaining = quotesData?.regenerationsRemaining ?? null;

  const handleRegenerate = async () => {
    const isUnlimited = subscription?.tier === "starter" || subscription?.tier === "premium";
    if (!isUnlimited && remaining !== null && remaining <= 0) {
      navigation.navigate("Upgrade");
      return;
    }
    try {
      await regenerateQuotes.mutateAsync();
      Toast.show({ type: "success", text1: "Quotes refreshed!" });
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to regenerate quotes",
      });
    }
  };

  const renderQuote = useCallback(
    ({ item, index }: { item: Quote, index: number }) => <QuoteCard quote={item} index={index} />,
    [],
  );

  const keyExtractor = useCallback((item: Quote) => item.id, []);

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
          <View>
            <Text style={styles.headerTitle}>Motivation</Text>
            <Text style={styles.headerSubtitle}>
              Daily quotes to keep you going
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.refreshButton,
              regenerateQuotes.isPending && { opacity: 0.5 },
            ]}
            onPress={handleRegenerate}
            disabled={regenerateQuotes.isPending}
            accessibilityLabel="Refresh quotes"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            {regenerateQuotes.isPending ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <RefreshCw size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </MotiView>

        {remaining !== null && subscription?.tier !== "starter" && subscription?.tier !== "premium" && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 200 }}
            style={styles.remainingBadgeContainer}
          >
            <View style={styles.remainingBadge}>
              <Text style={styles.remainingText}>
                {remaining} regenerations remaining today
              </Text>
            </View>
          </MotiView>
        )}

        <FlatList
          data={quotes}
          renderItem={renderQuote}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  remainingBadgeContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  remainingBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  remainingText: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  quoteCard: {
    padding: spacing.xxl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  quoteIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  quoteText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 28,
  },
  quoteFooter: { 
    flexDirection: "row", 
    justifyContent: "flex-end",
    marginTop: spacing.lg, 
  },
  categoryBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  emotionalBadge: { 
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderColor: "rgba(220, 38, 38, 0.2)"
  },
  practicalBadge: { 
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    borderColor: "rgba(37, 99, 235, 0.2)"
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontFamily: typography.fontFamily.bold,
  },
  emotionalText: { color: "#DC2626" },
  practicalText: { color: "#2563EB" },
});
