import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatMessages, useSendMessage } from '@/hooks/useChat';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProgress } from '@/hooks/useProgress';
import { useUserSubscription } from '@/hooks/useUsers';
import { COACHES, PERSONAS, type Persona } from '@/types';
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
  const [selectedPersona, setSelectedPersona] = useState<Persona>('coach');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coach = onboardingData?.niche ? COACHES[onboardingData.niche] : COACHES.health;
  const isPremium = subscription?.tier === 'premium';
  const hasAICompanion = subscription?.features?.hasAICompanion;

  const chatMessages = useMemo(
    () => chatData?.messages || [],
    [chatData],
  );

  const filteredMessages = useMemo(() => {
    if (selectedPersona === 'coach') {
      return chatMessages;
    }
    // The chat feed uses `role: 'user' | 'assistant'`. Celebration/persona messages
    // are modeled as assistant messages in the current API typing.
    return chatMessages.filter((m) => m.role === 'assistant');
  }, [chatMessages, selectedPersona]);

  useEffect(() => {
    if (!subscription || !progress) {
      return;
    }

    const limit = subscription.features.aiMessagesTotal;

    if (limit === null || limit === -1) {
      setMessagesRemaining(null);
      return;
    }

    const used = progress.aiMessagesUsed ?? 0;
    const remaining = Math.max(0, limit - used);
    setMessagesRemaining(remaining);
  }, [subscription, progress]);

  const canSendMessage =
    messagesRemaining === null || (messagesRemaining ?? 0) > 0;
  const canAccessPersona = selectedPersona === 'coach' || isPremium;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !canSendMessage || sendMessage.isPending) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    try {
      const result = await sendMessage.mutateAsync(userMessage);

      if (typeof result.messagesRemaining === 'number') {
        setMessagesRemaining(
          result.messagesRemaining < 0 ? null : result.messagesRemaining,
        );
      }

      if (
        result.messagesRemaining !== null &&
        result.messagesRemaining >= 0 &&
        result.messagesRemaining <= 2
      ) {
        toast({
          title: '⚠️ Message limit',
          description: `You have ${result.messagesRemaining} message${result.messagesRemaining !== 1 ? 's' : ''} remaining.`,
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

  const handlePersonaChange = (persona: Persona) => {
    if (persona !== 'coach' && !isPremium) {
      toast({
        title: '🔒 Premium Feature',
        description: 'AI Companion is available for Premium users only!',
      });
      return;
    }
    setSelectedPersona(persona);
  };

  const currentPersona = PERSONAS[selectedPersona];
  const showInput = selectedPersona === 'coach' && canAccessPersona;

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
      {/* Persona Toggle (Premium only) */}
      <div className="p-3 border-b bg-secondary/30">
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
          {Object.entries(PERSONAS).map(([key, persona]) => (
            <button
              key={key}
              onClick={() => handlePersonaChange(key as Persona)}
              className={cn(
                "flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all flex flex-col items-center gap-1",
                selectedPersona === key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <span className="text-base">{persona.avatar}</span>
              <span className="hidden sm:inline">{persona.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
            selectedPersona === 'coach'
              ? "bg-gradient-to-br from-primary to-accent"
              : selectedPersona === 'friend'
              ? "bg-gradient-to-br from-blue-500 to-cyan-500"
              : selectedPersona === 'family'
              ? "bg-gradient-to-br from-green-500 to-emerald-500"
              : "bg-gradient-to-br from-pink-500 to-rose-500"
          )}>
            {currentPersona.avatar}
          </div>
          <div>
            <h3 className="font-semibold">{currentPersona.name}</h3>
            <p className="text-xs text-muted-foreground">{currentPersona.title}</p>
          </div>
        </div>
        {selectedPersona !== 'coach' && isPremium && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            {currentPersona.description}
          </p>
        )}
        {!isPremium && selectedPersona !== 'coach' && (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-amber-500">
              Upgrade to Premium to unlock AI Companion
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Sparkles className="w-12 h-12 text-primary mx-auto" />
              {selectedPersona === 'coach' ? (
                <p className="text-sm text-muted-foreground">
                  Start a conversation with {coach.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Messages from {currentPersona.name} will appear here when you complete tasks
                </p>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredMessages.map((message) => (
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
                        {selectedPersona === 'coach' ? coach.name : currentPersona.name}
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
                      : selectedPersona === 'girlfriend'
                      ? 'bg-pink-500/20 border border-pink-500/30'
                      : selectedPersona === 'friend'
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : selectedPersona === 'family'
                      ? 'bg-green-500/20 border border-green-500/30'
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
      {showInput && (
        <div className="p-4 border-t">
          {messagesRemaining !== null && (
            <div className="mb-2 text-center">
              <span className="text-xs text-muted-foreground">
                {messagesRemaining > 0 ? (
                  `${messagesRemaining} message${messagesRemaining > 1 ? 's' : ''} remaining`
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
      )}

      {selectedPersona !== 'coach' && isPremium && (
        <div className="p-4 border-t bg-secondary/20">
          <p className="text-xs text-muted-foreground text-center">
            💡 {currentPersona.name} sends you celebration messages when you complete tasks!
          </p>
        </div>
      )}
    </div>
  );
}