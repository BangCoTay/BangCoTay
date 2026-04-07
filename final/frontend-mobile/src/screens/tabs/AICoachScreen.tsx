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
import { Send, Sparkles } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useChatMessages, useSendMessage } from "@/hooks/useChat";
import { useUserSubscription } from "@/hooks/useUsers";
import { useOnboarding } from "@/hooks/useOnboarding";
import { COACHES, PERSONAS } from "@/types";
import type { Persona, ChatMessage } from "@/types";
import { colors, spacing, borderRadius, fontSize, typography } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";

const PERSONA_TABS: Persona[] = ["coach", "friend", "family", "girlfriend"];

const getPersonaColor = (role: ChatMessage["role"]) => {
  switch (role) {
    case "friend":
      return colors.friend;
    case "family":
      return colors.family;
    case "girlfriend":
      return colors.girlfriend;
    case "assistant":
      return colors.primary;
    default:
      return colors.primary;
  }
};

const MessageBubble = React.memo(
  ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.role === "user";
    const bubbleColor = isUser ? colors.primary : getPersonaColor(item.role);

    return (
      <MotiView
        from={{ opacity: 0, translateY: 10, scale: 0.95 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: "spring", delay: Math.min(index * 50, 500) }}
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <LinearGradient
          colors={
            isUser
              ? [colors.primaryLight, colors.primary]
              : ["rgba(255, 255, 255, 0.7)", "rgba(255, 255, 255, 0.4)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubbleInner,
            !isUser && {
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.6)",
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
        </LinearGradient>
      </MotiView>
    );
  },
);

export function AICoachScreen() {
  const [activePersona, setActivePersona] = useState<Persona>("coach");
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const roleFilter = activePersona;
  const { data: chatData, isLoading: messagesLoading } = useChatMessages(
    roleFilter as any,
  );
  const sendMessage = useSendMessage();
  const { data: subscription } = useUserSubscription();
  const { data: onboarding } = useOnboarding();
  const allMessages = chatData?.messages ?? [];

  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure measurements are correct after layout
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }, []),
  );
  const messages = allMessages.filter((msg) => {
    if (activePersona === "coach")
      return msg.role === "user" || msg.role === "assistant";
    return msg.role === activePersona;
  });
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
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <MessageBubble item={item} index={index} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const handleContentSizeChange = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary, "#E0F2FE"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.header}
        >
          <View style={styles.headerEmojiContainer}>
            <Text style={styles.headerEmoji}>
              {isCoachTab ? coach.avatar : PERSONAS[activePersona].avatar}
            </Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {isCoachTab ? coach.name : PERSONAS[activePersona].name}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isCoachTab ? coach.title : PERSONAS[activePersona].title}
            </Text>
          </View>
        </MotiView>

        {/* Persona Tabs */}
        <View style={styles.tabsContainerWrapper}>
          <BlurView intensity={20} tint="light" style={styles.tabsContainer}>
            {PERSONA_TABS.map((persona) => {
              const isActive = activePersona === persona;
              const color = getPersonaColor(persona);
              return (
                <TouchableOpacity
                  key={persona}
                  style={styles.tab}
                  onPress={() => setActivePersona(persona)}
                  accessibilityLabel={`${PERSONAS[persona].name} tab`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.tabContent,
                      isActive && { backgroundColor: color + "15" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabEmoji,
                        isActive && { transform: [{ scale: 1.1 }] },
                      ]}
                    >
                      {PERSONAS[persona].avatar}
                    </Text>
                    {isActive && (
                      <Text
                        style={[
                          styles.tabLabel,
                          {
                            color: color,
                            fontFamily: typography.fontFamily.bold,
                          },
                        ]}
                      >
                        {PERSONAS[persona].name}
                      </Text>
                    )}
                  </View>
                  {isActive && (
                    <MotiView
                      from={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ type: "timing", duration: 300 }}
                      style={[styles.tabIndicator, { backgroundColor: color }]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </BlurView>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {messagesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : messages.length === 0 ? (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 200 }}
              style={styles.emptyContainer}
            >
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyEmoji}>
                  {isCoachTab ? coach.avatar : PERSONAS[activePersona].avatar}
                </Text>
              </View>
              <Text style={styles.emptyText}>
                {isCoachTab
                  ? coach.greeting
                  : !hasCompanion
                    ? `Unlock ${PERSONAS[activePersona].name} with Premium! Complete tasks to receive encouragement.`
                    : `Complete tasks to receive messages from ${PERSONAS[activePersona].name}!`}
              </Text>
            </MotiView>
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
            <BlurView
              intensity={60}
              tint="light"
              style={styles.inputContainerWrapper}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
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
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primaryLight, colors.primary]}
                    style={styles.sendButtonGradient}
                  >
                    {sendMessage.isPending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Send size={18} color="#fff" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerEmojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  headerEmoji: { fontSize: 36, lineHeight: 42 },
  headerTitle: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabsContainerWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  tabContent: {
    width: "100%",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: 4,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: 3,
    borderRadius: 3,
  },
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
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },
  messagesList: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  messageBubble: {
    maxWidth: "85%",
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userBubble: { alignSelf: "flex-end" },
  assistantBubble: { alignSelf: "flex-start" },
  bubbleInner: {
    padding: spacing.lg,
    borderRadius: 24,
    overflow: "hidden",
  },
  senderName: {
    fontSize: fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  messageText: {
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    lineHeight: 22,
  },
  userMessageText: { color: "#FFFFFF" },
  inputContainerWrapper: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.5)",
    paddingBottom: Platform.OS === "ios" ? spacing.xxl : spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    maxHeight: 120,
    minHeight: 48,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { opacity: 0.5, shadowOpacity: 0 },
});
