import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useChatMessages, useSendMessage } from "@/hooks/useChat";
import { useUserSubscription } from "@/hooks/useUsers";
import { useOnboarding } from "@/hooks/useOnboarding";
import { COACHES, PERSONAS } from "@/types";
import type { Persona, ChatMessage } from "@/types";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "@/theme";

const PERSONA_TABS: Persona[] = ["coach", "friend", "family", "girlfriend"];

const getPersonaColor = (persona: Persona) => {
  switch (persona) {
    case "friend":
      return colors.friend;
    case "family":
      return colors.family;
    case "girlfriend":
      return colors.girlfriend;
    default:
      return colors.primary;
  }
};

const MessageBubble = React.memo(
  ({ item, activePersona }: { item: ChatMessage; activePersona: Persona }) => {
    const isUser = item.role === "user";
    const bubbleColor = isUser
      ? colors.primary
      : getPersonaColor(activePersona);

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <View
          style={[
            styles.bubbleInner,
            {
              backgroundColor: isUser ? bubbleColor : colors.surfaceSecondary,
            },
          ]}
        >
          {!isUser && item.senderName && (
            <Text style={[styles.senderName, { color: bubbleColor }]}>
              {item.senderName}
            </Text>
          )}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  },
);

export function AICoachScreen() {
  const [activePersona, setActivePersona] = useState<Persona>("coach");
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const roleFilter = activePersona === "coach" ? "coach" : activePersona;
  const { data: chatData, isLoading: messagesLoading } =
    useChatMessages(roleFilter);
  const sendMessage = useSendMessage();
  const { data: subscription } = useUserSubscription();
  const { data: onboarding } = useOnboarding();

  const messages = chatData?.messages ?? [];
  const niche = onboarding?.niche ?? "digital";
  const coach = COACHES[niche as keyof typeof COACHES] ?? COACHES.digital;

  const isCoachTab = activePersona === "coach";
  const hasCompanion = subscription?.features?.hasAICompanion;

  const handleSend = async () => {
    if (!message.trim() || sendMessage.isPending) return;
    const text = message.trim();
    setMessage("");
    await sendMessage.mutateAsync(text);
  };

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble item={item} activePersona={activePersona} />
    ),
    [activePersona],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const handleContentSizeChange = useCallback(() => {
    flatListRef.current?.scrollToEnd();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>
          {isCoachTab ? coach.avatar : PERSONAS[activePersona].avatar}
        </Text>
        <View>
          <Text style={styles.headerTitle}>
            {isCoachTab ? coach.name : PERSONAS[activePersona].name}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isCoachTab ? coach.title : PERSONAS[activePersona].title}
          </Text>
        </View>
      </View>

      {/* Persona Tabs */}
      <View style={styles.tabsContainer}>
        {PERSONA_TABS.map((persona) => (
          <TouchableOpacity
            key={persona}
            style={[
              styles.tab,
              activePersona === persona && {
                borderBottomColor: getPersonaColor(persona),
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActivePersona(persona)}
            accessibilityLabel={`${PERSONAS[persona].name} tab`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activePersona === persona }}
          >
            <Text style={styles.tabEmoji}>{PERSONAS[persona].avatar}</Text>
            <Text
              style={[
                styles.tabLabel,
                activePersona === persona && {
                  color: getPersonaColor(persona),
                  fontWeight: fontWeight.semibold,
                },
              ]}
            >
              {PERSONAS[persona].name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
        keyboardVerticalOffset={90}
      >
        {messagesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>
              {isCoachTab ? coach.avatar : PERSONAS[activePersona].avatar}
            </Text>
            <Text style={styles.emptyText}>
              {isCoachTab
                ? coach.greeting
                : !hasCompanion
                  ? `Unlock ${PERSONAS[activePersona].name} with Premium! Complete tasks to receive encouragement.`
                  : `Complete tasks to receive messages from ${PERSONAS[activePersona].name}!`}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={handleContentSizeChange}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input (only for coach tab) */}
        {isCoachTab && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              accessibilityLabel="Chat message input"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || sendMessage.isPending) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              {sendMessage.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerEmoji: { fontSize: 36 },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: 2,
  },
  tabEmoji: { fontSize: 18 },
  tabLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  chatContainer: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxxl,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.lg },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  messagesList: { padding: spacing.lg, gap: spacing.md },
  messageBubble: { maxWidth: "80%" },
  userBubble: { alignSelf: "flex-end" },
  assistantBubble: { alignSelf: "flex-start" },
  bubbleInner: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  senderName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: 4,
  },
  messageText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  userMessageText: { color: "#FFFFFF" },
  inputContainer: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 100,
    backgroundColor: colors.surfaceSecondary,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  sendButtonDisabled: { opacity: 0.5 },
});
