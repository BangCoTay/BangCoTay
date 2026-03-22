import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@clerk/clerk-expo';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'friend' | 'family' | 'girlfriend';
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

interface RawChatMessage {
  id?: string;
  _id?: string;
  role?: ChatMessage['role'] | string;
  content?: string;
  createdAt?: string;
  created_at?: string;
  model?: string;
  tokensUsed?: number;
  tokens_used?: number;
}

interface RawChatMessagesResponse {
  messages?: RawChatMessage[];
  total?: number;
  hasMore?: boolean;
}

interface RawSendMessageResponse {
  userMessage?: RawChatMessage;
  assistantMessage?: RawChatMessage;
  messagesRemaining?: number;
  messages_remaining?: number;
}

const VALID_ROLES: ChatMessage['role'][] = ['user', 'assistant', 'friend', 'family', 'girlfriend'];

function normalizeChatMessage(raw: unknown): ChatMessage {
  const r = raw as RawChatMessage | undefined;
  // Preserve ALL valid roles — friend/family/girlfriend are persona celebration messages
  const rawRole = r?.role as string | undefined;
  const role: ChatMessage['role'] = VALID_ROLES.includes(rawRole as ChatMessage['role'])
    ? (rawRole as ChatMessage['role'])
    : 'user';

  return {
    id: r?.id ?? r?._id ?? '',
    role,
    content: r?.content ?? '',
    createdAt: r?.createdAt ?? r?.created_at ?? new Date().toISOString(),
    model: r?.model,
    tokensUsed: r?.tokensUsed ?? r?.tokens_used,
  };
}

function normalizeChatMessagesResponse(raw: unknown): ChatMessagesResponse {
  const r = raw as RawChatMessagesResponse | RawChatMessage[] | undefined;
  const messagesRaw = Array.isArray(r) ? r : r?.messages ?? [];

  return {
    messages: messagesRaw.map(normalizeChatMessage),
    total: !Array.isArray(r) && typeof r?.total === 'number' ? r.total : 0,
    hasMore:
      !Array.isArray(r) && typeof r?.hasMore === 'boolean' ? r.hasMore : false,
  };
}

function normalizeSendMessageResponse(raw: unknown): SendMessageResponse {
  const r = raw as RawSendMessageResponse | undefined;
  let messagesRemaining: number | null =
    typeof r?.messagesRemaining === 'number'
      ? r.messagesRemaining
      : typeof r?.messages_remaining === 'number'
        ? r.messages_remaining
        : null;

  // Backend uses -1 to represent "unlimited"
  if (messagesRemaining === -1) {
    messagesRemaining = null;
  }

  return {
    userMessage: normalizeChatMessage(r?.userMessage),
    assistantMessage: normalizeChatMessage(r?.assistantMessage),
    messagesRemaining,
  };
}

// role: 'coach' | 'friend' | 'family' | 'girlfriend' — or undefined to fetch all
export function useChatMessages(role?: string, limit = 50, offset = 0) {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['chat', 'messages', role ?? 'all', { limit, offset }],
    queryFn: async () => {
      const roleParam = role ? `&role=${role}` : '';
      const response = await apiClient.get(
        `/chat/messages?limit=${limit}&offset=${offset}${roleParam}`,
      );
      return normalizeChatMessagesResponse(response.data.data);
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
      return normalizeSendMessageResponse(response.data.data);
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
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
}
