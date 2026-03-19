import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatMessages, useSendMessage } from '@/hooks/useChat';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProgress } from '@/hooks/useProgress';
import { useUserSubscription } from '@/hooks/useUsers';
import { COACHES } from '@/types';
import { Send, Lock, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function AICoachPanel() {
  const { data: onboardingData } = useOnboarding();
  const { data: chatData, isLoading: chatLoading } = useChatMessages();
  const { data: progress } = useProgress();
  const { data: subscription } = useUserSubscription();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const [inputValue, setInputValue] = useState('');
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coach = onboardingData?.niche ? COACHES[onboardingData.niche] : COACHES.health;
  const chatMessages = useMemo(
    () => chatData?.messages || [],
    [chatData],
  );

  // Derive remaining messages from subscription limits + progress when available
  useEffect(() => {
    if (!subscription || !progress) {
      return;
    }

    const limit = subscription.features.aiMessagesPerDay;

    if (limit === null) {
      // Unlimited for this tier
      setMessagesRemaining(null);
      return;
    }

    const used = progress.aiMessagesUsed ?? 0;
    const remaining = Math.max(0, limit - used);
    setMessagesRemaining(remaining);
  }, [subscription, progress]);

  const canSendMessage =
    messagesRemaining === null || (messagesRemaining ?? 0) > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !canSendMessage || sendMessage.isPending) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    try {
      const result = await sendMessage.mutateAsync({
        content: userMessage,
        coachPersona: coach.name,
      });

      // Update remaining messages from API response (already accounts for this message)
      if (typeof result.messagesRemaining === 'number') {
        setMessagesRemaining(
          result.messagesRemaining < 0 ? null : result.messagesRemaining,
        );
      }

      // Show remaining messages notification if applicable
      if (
        result.messagesRemaining !== null &&
        result.messagesRemaining >= 0 &&
        result.messagesRemaining <= 2
      ) {
        toast({
          title: '⚠️ Message limit',
          description: `You have ${result.messagesRemaining} message${result.messagesRemaining !== 1 ? 's' : ''} remaining today.`,
        });
      }
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast({
        title: 'Error',
        description: apiError.response?.data?.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'girlfriend': return 'bg-chat-girlfriend';
      case 'friend': return 'bg-chat-friend';
      case 'family': return 'bg-chat-family';
      default: return '';
    }
  };

  if (chatLoading) {
    return (
      <div className="flex flex-col h-full bg-card rounded-2xl border overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
            {coach.avatar}
          </div>
          <div>
            <h3 className="font-semibold">{coach.name}</h3>
            <p className="text-xs text-muted-foreground">{coach.title}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Sparkles className="w-12 h-12 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                Start a conversation with {coach.name}
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  "max-w-[85%]",
                  message.role === 'user' ? 'order-2' : 'order-1'
                )}>
                  {message.role !== 'user' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {coach.name}
                      </span>
                      {message.model && (
                        <span className="text-xs text-muted-foreground/50">
                          • {message.model}
                        </span>
                      )}
                    </div>
                  )}
                  <div className={cn(
                    message.role === 'user'
                      ? 'chat-bubble-user'
                      : 'chat-bubble-assistant'
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {sendMessage.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="chat-bubble-assistant flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {messagesRemaining !== null && (
          <div className="mb-2 text-center">
            <span className="text-xs text-muted-foreground">
              {messagesRemaining > 0 ? (
                `${messagesRemaining} message${messagesRemaining > 1 ? 's' : ''} remaining today`
              ) : (
                <span className="text-accent">Upgrade to continue chatting</span>
              )}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={canSendMessage ? "Ask your coach anything..." : "Upgrade to chat more"}
            disabled={!canSendMessage || sendMessage.isPending}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-primary outline-none text-sm transition-all",
              (!canSendMessage || sendMessage.isPending) && "opacity-50 cursor-not-allowed"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!canSendMessage || !inputValue.trim() || sendMessage.isPending}
            className={cn(
              "p-3 rounded-xl transition-all",
              canSendMessage && inputValue.trim() && !sendMessage.isPending
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : canSendMessage ? (
              <Send className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
