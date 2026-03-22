import { motion } from 'framer-motion';
import { useQuotes, useRegenerateQuotes } from '@/hooks/useQuotes';
import { RefreshCw, Lock, Sparkles, Quote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuotesPanelProps {
  onUpgrade: () => void;
}

export function QuotesPanel({ onUpgrade }: QuotesPanelProps) {
  const { data: quotesData, isLoading } = useQuotes();
  const regenerateMutation = useRegenerateQuotes();

  const quotes = quotesData?.quotes || [];
  const regenerationsRemaining = quotesData?.regenerationsRemaining;
  const canRegenerate = regenerationsRemaining === null || regenerationsRemaining > 0;

  const handleAction = async () => {
    if (!canRegenerate) {
      onUpgrade();
      return;
    }

    if (regenerateMutation.isPending) return;

    try {
      await regenerateMutation.mutateAsync();
      toast.success('✨ New quotes generated!', {
        description: 'Your daily motivation has been refreshed.',
      });
    } catch (error) {
      toast.error('Failed to regenerate quotes. Please try again.');
    }
  };

  if (isLoading) {
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
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-warning flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Daily Motivation</h3>
            <p className="text-xs text-muted-foreground">Quotes to keep you going</p>
          </div>
        </div>
      </div>

      {/* Quotes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {quotes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No quotes available</p>
          </div>
        ) : (
          quotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              className="quote-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex gap-3">
                <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium leading-relaxed italic">
                    "{quote.content}"
                  </p>
                  <span className={cn(
                    "inline-block mt-2 text-xs px-2 py-0.5 rounded-full",
                    quote.category === 'emotional'
                      ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {quote.category === 'emotional' ? '💫 Emotional' : '🎯 Practical'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Regenerate button */}
      <div className="p-4 border-t">
        <button
          onClick={handleAction}
          disabled={regenerateMutation.isPending}
          className={cn(
            "w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
            canRegenerate && !regenerateMutation.isPending
              ? "bg-secondary hover:bg-secondary/80 text-foreground"
              : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          )}
        >
          {regenerateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : canRegenerate ? (
            <>
              <RefreshCw className="w-4 h-4" />
              New Quotes
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Upgrade
            </>
          )}
        </button>
      </div>
    </div>
  );
}
