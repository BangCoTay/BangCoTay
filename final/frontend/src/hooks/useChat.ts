import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@clerk/clerk-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  model?: string;
  tokensUsed?: number;
}

export interface SendMessageRequest {
  content: string;
  coachPersona?: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  messagesRemaining: number | null;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  total: number;
  hasMore: boolean;
}

function normalizeChatMessage(raw: any): ChatMessage {
  return {
    id: raw.id,
    role: raw.role,
    content: raw.content,
    createdAt: raw.createdAt ?? raw.created_at,
    model: raw.model,
    tokensUsed: raw.tokensUsed ?? raw.tokens_used,
  };
}

function normalizeChatMessagesResponse(raw: any): ChatMessagesResponse {
  return {
    messages: (raw?.messages ?? raw ?? []).map(normalizeChatMessage),
    total: raw?.total ?? 0,
    hasMore: raw?.hasMore ?? false,
  };
}

function normalizeSendMessageResponse(raw: any): SendMessageResponse {
  let messagesRemaining =
    typeof raw?.messagesRemaining === 'number'
      ? raw.messagesRemaining
      : null;

  // Backend uses -1 to represent "unlimited"
  if (messagesRemaining === -1) {
    messagesRemaining = null;
  }

  return {
    userMessage: normalizeChatMessage(raw.userMessage),
    assistantMessage: normalizeChatMessage(raw.assistantMessage),
    messagesRemaining,
  };
}

export function useChatMessages(limit = 50, offset = 0) {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['chat', 'messages', { limit, offset }],
    queryFn: async () => {
      const response = await apiClient.get(
        `/chat/messages?limit=${limit}&offset=${offset}`,
      );
      return normalizeChatMessagesResponse(response.data);
    },
    enabled: isLoaded && !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await apiClient.post('/chat/messages', { content });
      return normalizeSendMessageResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useClearChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/chat/messages');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
}
