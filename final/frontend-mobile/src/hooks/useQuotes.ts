import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Quote } from '@/types';

export interface QuotesResponse {
  quotes: Quote[];
  regenerationsRemaining: number | null;
}

interface RawQuote {
  id?: string;
  _id?: string;
  text?: string;
  content?: string;
  category: 'emotional' | 'practical';
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
}

function normalizeQuotesResponse(raw: any): QuotesResponse {
  const rawQuotes = Array.isArray(raw) ? raw : raw?.quotes ?? [];
  const quotes: Quote[] = rawQuotes.map((q: RawQuote) => ({
    id: q.id ?? q._id ?? '',
    content: q.text ?? q.content ?? '',
    category: q.category,
    isActive: q.isActive ?? q.is_active ?? true,
    createdAt: q.createdAt ?? q.created_at ?? new Date().toISOString(),
  }));

  let regenerationsRemaining: number | null =
    !Array.isArray(raw) && typeof raw?.regenerationsRemaining === 'number'
      ? raw.regenerationsRemaining
      : null;
  if (regenerationsRemaining === -1) regenerationsRemaining = null;

  return { quotes, regenerationsRemaining };
}

export function useQuotes() {
  const { user, isLoading } = useAuthContext();
  const userId = user?.id;
  const isLoaded = !isLoading;
  return useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const response = await apiClient.get('/quotes');
      return normalizeQuotesResponse(response.data.data);
    },
    enabled: isLoaded && !!userId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useRegenerateQuotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/quotes/regenerate');
      return normalizeQuotesResponse(response.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
