import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { SUBSCRIPTION_LIMITS } from '../../common/constants/subscription-limits';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getCurrentSubscription(userId: string) {
    try {
      // Get user's subscription tier
      const { data: user } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      const tier = user?.subscription_tier || 'free';

      // Get active subscription details
      const { data: subscription } = await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      // Get subscription limits and features
      const limits = SUBSCRIPTION_LIMITS[tier];

      return {
        tier,
        status: subscription?.status || 'free',
        stripeSubscriptionId: subscription?.stripe_subscription_id,
        currentPeriodStart: subscription?.current_period_start,
        currentPeriodEnd: subscription?.current_period_end,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
        features: limits.features,
        limits: {
          daysUnlocked: limits.daysUnlocked,
          aiMessagesPerDay: limits.aiMessagesPerDay,
          quoteRegenerationsPerDay: limits.quoteRegenerationsPerDay,
        },
      };
    } catch (error) {
      this.logger.error(`Get current subscription failed: ${error.message}`);
      throw error;
    }
  }

  async cancelSubscription(userId: string) {
    try {
      // Get active subscription
      const { data: subscription, error } = await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !subscription) {
        throw new Error('No active subscription found');
      }

      // Mark subscription to cancel at period end
      await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
        })
        .eq('id', subscription.id);

      return {
        subscription: {
          ...subscription,
          cancel_at_period_end: true,
        },
        message:
          'Subscription will be canceled at the end of the billing period',
      };
    } catch (error) {
      this.logger.error(`Cancel subscription failed: ${error.message}`);
      throw error;
    }
  }
}
