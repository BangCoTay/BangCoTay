import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuotes, useRegenerateQuotes } from "../../hooks/useQuotes";
import { RefreshCw, Sparkles, Quote } from "lucide-react-native";

export const QuotesScreen = ({ navigation }: any) => {
  const { data: quotesData, isLoading } = useQuotes();
  const regenerateMutation = useRegenerateQuotes();

  const quotes = quotesData?.quotes || [];
  const regenerationsRemaining = quotesData?.regenerationsRemaining ?? 0;
  const canRegenerate = regenerationsRemaining > 0;

  const handleAction = async () => {
    if (!canRegenerate) {
      navigation.navigate("Profile");
      return;
    }

    if (regenerateMutation.isPending) return;

    try {
      await regenerateMutation.mutateAsync();
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.quoteCard}>
      <View style={styles.quoteHeader}>
        <Quote color="#2563EB" size={24} />
      </View>
      <Text style={styles.quoteText}>"{item.content}"</Text>
      <View
        style={[
          styles.badge,
          item.category === "emotional"
            ? styles.badgeEmotional
            : styles.badgePractical,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            item.category === "emotional"
              ? styles.badgeTextEmotional
              : styles.badgeTextPractical,
          ]}
        >
          {item.category === "emotional" ? "💫 Emotional" : "🎯 Practical"}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconBg}>
          <Sparkles color="#2563EB" size={24} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Daily Motivation</Text>
          <Text style={styles.headerSubtitle}>Quotes to keep you going</Text>
        </View>
      </View>

      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No quotes available</Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleAction}
          disabled={regenerateMutation.isPending}
        >
          {regenerateMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : canRegenerate ? (
            <View style={styles.actionContent}>
              <RefreshCw color="#ffffff" size={20} />
              <Text style={styles.actionText}>New Quotes</Text>
            </View>
          ) : (
            <View style={styles.actionContent}>
              <Sparkles color="#ffffff" size={20} />
              <Text style={styles.actionText}>Upgrade for more</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 16,
  },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontFamily: "Caveat_700Bold", fontSize: 28, color: "#18181B" },
  headerSubtitle: {
    fontFamily: "Quicksand_500Medium",
    fontSize: 14,
    color: "#475569",
  },

  listContent: { padding: 16, gap: 16 },
  quoteCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quoteHeader: { marginBottom: 12 },
  quoteText: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 18,
    lineHeight: 28,
    color: "#18181B",
    fontStyle: "italic",
    marginBottom: 16,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEmotional: { backgroundColor: "#FCE7F3" },
  badgePractical: { backgroundColor: "#DBEAFE" },
  badgeText: { fontFamily: "Quicksand_600SemiBold", fontSize: 12 },
  badgeTextEmotional: { color: "#BE185D" },
  badgeTextPractical: { color: "#1D4ED8" },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 40,
    fontFamily: "Quicksand_500Medium",
  },

  footer: {
    padding: 24,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#ffffff",
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 16,
  },
});
