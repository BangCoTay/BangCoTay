import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { PlanGeneratorService } from './plan-generator.service';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    private supabaseService: SupabaseService,
    private planGeneratorService: PlanGeneratorService,
  ) {}

  async generatePlan(userId: string, subscriptionTier: string) {
    try {
      // Get user's onboarding data
      const { data: onboardingData, error: onboardingError } =
        await this.supabaseService
          .getAdminClient()
          .from('onboarding_data')
          .select('id')
          .eq('user_id', userId)
          .single();

      if (onboardingError || !onboardingData) {
        throw new NotFoundException(
          'Please complete onboarding before generating a plan',
        );
      }

      return this.planGeneratorService.generatePlan(
        userId,
        onboardingData.id,
        subscriptionTier,
      );
    } catch (error) {
      this.logger.error(`Generate plan failed: ${error.message}`);
      throw error;
    }
  }

  async getCurrentPlan(userId: string) {
    try {
      // Get active plan
      const { data: plan, error: planError } = await this.supabaseService
        .getAdminClient()
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        return null;
      }

      // Get day plans with tasks
      const { data: dayPlans, error: dayPlansError } =
        await this.supabaseService
          .getAdminClient()
          .from('day_plans')
          .select('*, tasks(*)')
          .eq('plan_id', plan.id)
          .order('day_number', { ascending: true });

      if (dayPlansError) {
        this.logger.error(`Get day plans failed: ${dayPlansError.message}`);
        throw new Error('Failed to fetch day plans');
      }

      // Get user progress
      const { data: progress } = await this.supabaseService
        .getAdminClient()
        .from('user_progress')
        .select('*')
        .eq('plan_id', plan.id)
        .single();

      return {
        plan,
        dayPlans,
        progress,
      };
    } catch (error) {
      this.logger.error(`Get current plan failed: ${error.message}`);
      throw error;
    }
  }

  async getDayPlan(userId: string, planId: string, dayNumber: number) {
    try {
      // Verify plan belongs to user
      const { data: plan, error: planError } = await this.supabaseService
        .getAdminClient()
        .from('plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (planError || !plan) {
        throw new NotFoundException('Plan not found');
      }

      // Get day plan with tasks
      const { data: dayPlan, error: dayPlanError } = await this.supabaseService
        .getAdminClient()
        .from('day_plans')
        .select('*, tasks(*)')
        .eq('plan_id', planId)
        .eq('day_number', dayNumber)
        .single();

      if (dayPlanError || !dayPlan) {
        throw new NotFoundException('Day plan not found');
      }

      return dayPlan;
    } catch (error) {
      this.logger.error(`Get day plan failed: ${error.message}`);
      throw error;
    }
  }
}
