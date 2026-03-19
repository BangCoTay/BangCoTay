import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { QuoteGeneratorService } from './quote-generator.service';
import { SUBSCRIPTION_LIMITS } from '../../common/constants/subscription-limits';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private supabaseService: SupabaseService,
    private quoteGeneratorService: QuoteGeneratorService,
  ) {}

  async getQuotes(userId: string, subscriptionTier: string) {
    try {
      // Get active quotes for user
      const { data: quotes, error } = await this.supabaseService
        .getAdminClient()
        .from('quotes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        this.logger.error(`Get quotes failed: ${error.message}`);
      }

      // If no quotes exist, generate initial set
      if (!quotes || quotes.length === 0) {
        return this.generateInitialQuotes(userId, subscriptionTier);
      }

      // Get regeneration count for today
      const { data: progress } = await this.supabaseService
        .getAdminClient()
        .from('user_progress')
        .select('quote_regenerations, last_activity_date')
        .eq('user_id', userId)
        .single();

      const limits =
        SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;
      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = progress?.last_activity_date;

      // Reset counter if it's a new day
      const regenerationsToday =
        progress && lastActivityDate === today
          ? progress.quote_regenerations
          : 0;

      const regenerationsRemaining =
        limits.quoteRegenerationsPerDay === -1
          ? -1
          : limits.quoteRegenerationsPerDay - regenerationsToday;

      return {
        quotes,
        regenerationsRemaining,
      };
    } catch (error) {
      this.logger.error(`Get quotes failed: ${error.message}`);
      throw error;
    }
  }

  async regenerateQuotes(userId: string, subscriptionTier: string) {
    try {
      // Check regeneration limits
      const limits =
        SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;

      // Get user progress to check regenerations used today
      const { data: progress } = await this.supabaseService
        .getAdminClient()
        .from('user_progress')
        .select('quote_regenerations, last_activity_date')
        .eq('user_id', userId)
        .single();

      if (progress) {
        const today = new Date().toISOString().split('T')[0];
        const lastActivityDate = progress.last_activity_date;

        // Reset counter if it's a new day
        let regenerationsToday = progress.quote_regenerations;
        if (lastActivityDate !== today) {
          regenerationsToday = 0;
        }

        // Check if user has exceeded limit (unless unlimited)
        if (
          limits.quoteRegenerationsPerDay !== -1 &&
          regenerationsToday >= limits.quoteRegenerationsPerDay
        ) {
          throw new ForbiddenException(
            `Daily quote regeneration limit reached (${limits.quoteRegenerationsPerDay} regenerations). Upgrade for more.`,
          );
        }
      }

      // Deactivate old quotes
      await this.supabaseService
        .getAdminClient()
        .from('quotes')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Get user's niche
      const { data: onboarding } = await this.supabaseService
        .getAdminClient()
        .from('onboarding_data')
        .select('niche')
        .eq('user_id', userId)
        .single();

      // Generate new quotes
      const newQuotes = this.quoteGeneratorService.generateQuotes(
        onboarding?.niche || null,
      );

      // Save new quotes to database
      const quotesToInsert = newQuotes.map((quote) => ({
        user_id: userId,
        text: quote.text,
        category: quote.category,
        niche: quote.niche,
        is_active: true,
      }));

      const { data: savedQuotes, error: saveError } = await this.supabaseService
        .getAdminClient()
        .from('quotes')
        .insert(quotesToInsert)
        .select();

      if (saveError) {
        this.logger.error(`Save quotes failed: ${saveError.message}`);
        throw new Error('Failed to save quotes');
      }

      // Update regeneration count
      if (progress) {
        const today = new Date().toISOString().split('T')[0];
        const lastActivityDate = progress.last_activity_date;
        const regenerationsToday =
          lastActivityDate === today ? progress.quote_regenerations + 1 : 1;

        await this.supabaseService
          .getAdminClient()
          .from('user_progress')
          .update({
            quote_regenerations: regenerationsToday,
          })
          .eq('user_id', userId);

        const regenerationsRemaining =
          limits.quoteRegenerationsPerDay === -1
            ? -1
            : limits.quoteRegenerationsPerDay - regenerationsToday;

        return {
          quotes: savedQuotes,
          regenerationsRemaining,
        };
      }

      return {
        quotes: savedQuotes,
      };
    } catch (error) {
      this.logger.error(`Regenerate quotes failed: ${error.message}`);
      throw error;
    }
  }

  private async generateInitialQuotes(
    userId: string,
    subscriptionTier: string,
  ) {
    try {
      // Get user's niche
      const { data: onboarding } = await this.supabaseService
        .getAdminClient()
        .from('onboarding_data')
        .select('niche')
        .eq('user_id', userId)
        .single();

      // Generate quotes
      const newQuotes = this.quoteGeneratorService.generateQuotes(
        onboarding?.niche || null,
      );

      // Save quotes to database
      const quotesToInsert = newQuotes.map((quote) => ({
        user_id: userId,
        text: quote.text,
        category: quote.category,
        niche: quote.niche,
        is_active: true,
      }));

      const { data: savedQuotes, error: saveError } = await this.supabaseService
        .getAdminClient()
        .from('quotes')
        .insert(quotesToInsert)
        .select();

      if (saveError) {
        this.logger.error(`Save initial quotes failed: ${saveError.message}`);
        throw new Error('Failed to save quotes');
      }

      const limits =
        SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;

      return {
        quotes: savedQuotes,
        regenerationsRemaining: limits.quoteRegenerationsPerDay,
      };
    } catch (error) {
      this.logger.error(`Generate initial quotes failed: ${error.message}`);
      throw error;
    }
  }
}
