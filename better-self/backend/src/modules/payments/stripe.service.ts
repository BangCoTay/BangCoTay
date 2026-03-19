import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('Stripe secret key not configured');
    } else {
      this.stripe = new Stripe(secretKey);
    }
  }

  async createCheckoutSession(
    userId: string,
    priceId: string,
    email: string,
    tier: string,
  ) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const session = await this.stripe.checkout.sessions.create({
        customer_email: email,
        client_reference_id: userId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${this.configService.get('FRONTEND_URL')}/dashboard?payment=success`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/dashboard?payment=canceled`,
        metadata: {
          userId,
          tier,
        },
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.error(`Create checkout session failed: ${error.message}`);
      throw error;
    }
  }

  async createCustomerPortalSession(customerId: string) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${this.configService.get('FRONTEND_URL')}/dashboard`,
      });

      return {
        portalUrl: session.url,
      };
    } catch (error) {
      this.logger.error(
        `Create customer portal session failed: ${error.message}`,
      );
      throw error;
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const webhookSecret =
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      return event;
    } catch (error) {
      this.logger.error(`Webhook verification failed: ${error.message}`);
      throw error;
    }
  }

  getStripeClient(): Stripe {
    return this.stripe;
  }
}
