import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SUBSCRIPTION_LIMITS } from '../../common/constants/subscription-limits';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getProfile(userId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        throw new NotFoundException('User profile not found');
      }

      return data;
    } catch (error) {
      this.logger.error(`Get profile failed: ${error.message}`);
      throw error;
    }
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .update({
          full_name: updateUserDto.fullName,
          avatar_url: updateUserDto.avatarUrl,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        this.logger.error(`Update profile failed: ${error.message}`);
        throw new Error('Failed to update profile');
      }

      return data;
    } catch (error) {
      this.logger.error(`Update profile failed: ${error.message}`);
      throw error;
    }
  }

  async getSubscription(userId: string) {
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
      this.logger.error(`Get subscription failed: ${error.message}`);
      throw error;
    }
  }
}
