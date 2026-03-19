import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface RawQuote {
  id: string;
  text?: string;
  content?: string;
  category: 'emotional' | 'practical';
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
}

export interface Quote {
  id: string;
  content: string;
  category: 'emotional' | 'practical';
  isActive: boolean;
  createdAt: string;
}

export interface QuotesResponse {
  quotes: Quote[];
  regenerationsRemaining: number | null;
}

// API uses snake_case fields and -1 for "unlimited"; normalize for the UI
function normalizeQuotesResponse(raw: { quotes?: RawQuote[]; regenerationsRemaining?: number } | RawQuote[]): QuotesResponse {
  const rawQuotes = Array.isArray(raw) ? raw : raw.quotes ?? [];

  const quotes: Quote[] = rawQuotes.map((q: RawQuote) => ({
    id: q.id,
    content: q.text ?? q.content,
    category: q.category,
    isActive: q.isActive ?? q.is_active ?? true,
    createdAt: q.createdAt ?? q.created_at,
  }));

  let regenerationsRemaining: number | null =
    !Array.isArray(raw) && typeof raw.regenerationsRemaining === 'number'
      ? raw.regenerationsRemaining
      : null;

  // Backend uses -1 to represent "unlimited"
  if (regenerationsRemaining === -1) {
    regenerationsRemaining = null;
  }

  return { quotes, regenerationsRemaining };
}

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const response = await apiClient.get('/quotes');
      return normalizeQuotesResponse(response.data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRegenerateQuotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/quotes/regenerate');
      return normalizeQuotesResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
