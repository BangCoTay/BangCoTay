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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useQuotes, useRegenerateQuotes } from "@/hooks/useQuotes";
import { useUserSubscription } from "@/hooks/useUsers";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "@/theme";

interface Quote {
  id: string;
  content: string;
  category: "practical" | "emotional";
}

const QuoteCard = React.memo(({ quote }: { quote: Quote }) => (
  <View style={styles.quoteCard}>
    <Text style={styles.quoteIcon}>{"💬"}</Text>
    <Text style={styles.quoteText}>{quote.content}</Text>
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
          {quote.category === "practical" ? "Practical" : "Emotional"}
        </Text>
      </View>
    </View>
  </View>
));

export function QuotesScreen() {
  const { data: quotesData, isLoading } = useQuotes();
  const regenerateQuotes = useRegenerateQuotes();
  const { data: subscription } = useUserSubscription();
  const navigation = useNavigation<any>();

  const quotes: Quote[] = quotesData?.quotes ?? [];
  const remaining = quotesData?.regenerationsRemaining ?? null;

  const handleRegenerate = async () => {
    if (remaining !== null && remaining <= 0) {
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
    ({ item }: { item: Quote }) => <QuoteCard quote={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Quote) => item.id, []);

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
      <View style={styles.header}>
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
        >
          {regenerateQuotes.isPending ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Ionicons name="refresh" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {remaining !== null && (
        <View style={styles.remainingBadge}>
          <Text style={styles.remainingText}>
            {remaining} regenerations remaining today
          </Text>
        </View>
      )}

      <FlatList
        data={quotes}
        renderItem={renderQuote}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  remainingBadge: {
    margin: spacing.lg,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
  },
  remainingText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  quoteCard: {
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quoteIcon: { fontSize: 24 },
  quoteText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: fontWeight.medium,
    lineHeight: 28,
    fontStyle: "italic",
  },
  quoteFooter: { flexDirection: "row", justifyContent: "flex-end" },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  emotionalBadge: { backgroundColor: "#FEE2E2" },
  practicalBadge: { backgroundColor: "#DBEAFE" },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  emotionalText: { color: "#DC2626" },
  practicalText: { color: "#2563EB" },
});
