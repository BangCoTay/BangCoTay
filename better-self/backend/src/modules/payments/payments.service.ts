import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private stripeService: StripeService,
  ) {}

  async createCheckout(userId: string, dto: CreateCheckoutDto) {
    try {
      // Get user email
      const { data: user, error: userError } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new BadRequestException('User not found');
      }

      // Create Stripe checkout session
      const session = await this.stripeService.createCheckoutSession(
        userId,
        dto.priceId,
        user.email,
        dto.tier,
      );

      return session;
    } catch (error) {
      this.logger.error(`Create checkout failed: ${error.message}`);
      throw error;
    }
  }

  async getPortal(userId: string) {
    try {
      // Get user's Stripe customer ID
      const { data: user, error: userError } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (userError || !user || !user.stripe_customer_id) {
        throw new BadRequestException(
          'No active subscription found. Please subscribe first.',
        );
      }

      // Create customer portal session
      const portal = await this.stripeService.createCustomerPortalSession(
        user.stripe_customer_id,
      );

      return portal;
    } catch (error) {
      this.logger.error(`Get portal failed: ${error.message}`);
      throw error;
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = await this.stripeService.handleWebhook(signature, payload);

      this.logger.log(`Webhook received: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook handling failed: ${error.message}`);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    try {
      const userId = session.client_reference_id || session.metadata?.userId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!userId) {
        this.logger.error('No user ID in checkout session');
        return;
      }

      // Update user with Stripe customer ID
      await this.supabaseService
        .getAdminClient()
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);

      // Get subscription details from Stripe
      const subscription = (await this.stripeService
        .getStripeClient()
        .subscriptions.retrieve(subscriptionId)) as Stripe.Subscription;

      const tier = session.metadata?.tier || 'starter';

      // Create subscription record
      await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: subscription.items.data[0].price.id,
          tier,
          status: subscription.status,
          current_period_start: new Date(
            (subscription as any).current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            (subscription as any).current_period_end * 1000,
          ).toISOString(),
        });

      // Update user subscription tier
      await this.supabaseService
        .getAdminClient()
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', userId);

      this.logger.log(`Subscription created for user ${userId}`);
    } catch (error) {
      this.logger.error(`Handle checkout completed failed: ${error.message}`);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      const { data: existingSubscription } = await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .select('user_id, tier')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (!existingSubscription) {
        this.logger.error(`Subscription not found: ${subscription.id}`);
        return;
      }

      // Update subscription record
      await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(
            (subscription as any).current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            (subscription as any).current_period_end * 1000,
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        })
        .eq('stripe_subscription_id', subscription.id);

      // Update user tier if subscription is active
      if (subscription.status === 'active') {
        await this.supabaseService
          .getAdminClient()
          .from('users')
          .update({ subscription_tier: existingSubscription.tier })
          .eq('id', existingSubscription.user_id);
      }

      this.logger.log(`Subscription updated: ${subscription.id}`);
    } catch (error) {
      this.logger.error(`Handle subscription updated failed: ${error.message}`);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      const { data: existingSubscription } = await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (!existingSubscription) {
        this.logger.error(`Subscription not found: ${subscription.id}`);
        return;
      }

      // Update subscription status
      await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      // Downgrade user to free tier
      await this.supabaseService
        .getAdminClient()
        .from('users')
        .update({ subscription_tier: 'free' })
        .eq('id', existingSubscription.user_id);

      this.logger.log(`Subscription deleted: ${subscription.id}`);
    } catch (error) {
      this.logger.error(`Handle subscription deleted failed: ${error.message}`);
    }
  }

  private async handlePaymentSucceeded(
    invoice: Stripe.Invoice & {
      subscription?: string;
      payment_intent?: string;
    },
  ) {
    try {
      const subscriptionId = invoice.subscription as string;

      const { data: subscription } = await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .select('user_id, id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (!subscription) {
        this.logger.error(`Subscription not found for invoice: ${invoice.id}`);
        return;
      }

      // Record payment
      await this.supabaseService
        .getAdminClient()
        .from('payment_history')
        .insert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          stripe_payment_intent_id: invoice.payment_intent as string,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'succeeded',
          payment_method: invoice.payment_intent ? 'card' : 'unknown',
        });

      this.logger.log(`Payment succeeded for invoice: ${invoice.id}`);
    } catch (error) {
      this.logger.error(`Handle payment succeeded failed: ${error.message}`);
    }
  }

  private async handlePaymentFailed(
    invoice: Stripe.Invoice & {
      subscription?: string;
      payment_intent?: string;
    },
  ) {
    try {
      const subscriptionId = invoice.subscription as string;

      const { data: subscription } = await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .select('user_id, id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (!subscription) {
        this.logger.error(`Subscription not found for invoice: ${invoice.id}`);
        return;
      }

      // Record failed payment
      await this.supabaseService
        .getAdminClient()
        .from('payment_history')
        .insert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          stripe_payment_intent_id: invoice.payment_intent as string,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          payment_method: 'card',
        });

      // Update subscription status
      await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', subscriptionId);

      this.logger.log(`Payment failed for invoice: ${invoice.id}`);
    } catch (error) {
      this.logger.error(`Handle payment failed failed: ${error.message}`);
    }
  }
}
