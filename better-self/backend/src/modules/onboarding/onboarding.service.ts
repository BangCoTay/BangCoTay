import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private supabaseService: SupabaseService) {}

  async createOnboarding(userId: string, dto: CreateOnboardingDto) {
    try {
      // Check if user already has onboarding data
      const { data: existing } = await this.supabaseService
        .getAdminClient()
        .from('onboarding_data')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update existing onboarding data
        const { data, error } = await this.supabaseService
          .getAdminClient()
          .from('onboarding_data')
          .update({
            niche: dto.niche,
            addiction: dto.addiction,
            severity: dto.severity,
            pain_points: dto.painPoints,
            healthy_habit: dto.healthyHabit,
            completed_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          throw new BadRequestException('Failed to update onboarding data');
        }

        // Mark user as onboarding completed
        await this.supabaseService
          .getAdminClient()
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', userId);

        return { onboardingData: data, planGenerated: false };
      }

      // Create new onboarding data
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('onboarding_data')
        .insert({
          user_id: userId,
          niche: dto.niche,
          addiction: dto.addiction,
          severity: dto.severity,
          pain_points: dto.painPoints,
          healthy_habit: dto.healthyHabit,
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`Create onboarding failed: ${error.message}`);
        throw new BadRequestException('Failed to create onboarding data');
      }

      // Mark user as onboarding completed
      await this.supabaseService
        .getAdminClient()
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', userId);

      return {
        onboardingData: data,
        planGenerated: false,
        message: 'Onboarding completed. Please generate your plan.',
      };
    } catch (error) {
      this.logger.error(`Create onboarding failed: ${error.message}`);
      throw error;
    }
  }

  async getOnboarding(userId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('onboarding_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error(`Get onboarding failed: ${error.message}`);
      return null;
    }
  }
}
