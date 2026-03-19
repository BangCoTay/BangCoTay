import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { MigrateLocalStorageDto } from './dto/migrate-localstorage.dto';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private supabaseService: SupabaseService) {}

  async importLocalStorage(userId: string, dto: MigrateLocalStorageDto) {
    try {
      const imported = {
        onboarding: false,
        plan: false,
        tasks: 0,
        messages: 0,
        quotes: 0,
      };

      // Check if user already has data
      const { data: existingOnboarding } = await this.supabaseService
        .getAdminClient()
        .from('onboarding_data')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingOnboarding) {
        throw new BadRequestException(
          'User already has data. Migration can only be done once.',
        );
      }

      // Import onboarding data
      if (dto.onboardingData) {
        const { data: onboarding, error: onboardingError } =
          await this.supabaseService
            .getAdminClient()
            .from('onboarding_data')
            .insert({
              user_id: userId,
              niche: dto.onboardingData.niche,
              addiction: dto.onboardingData.addiction,
              severity: dto.onboardingData.severity,
              pain_points: dto.onboardingData.painPoints || [],
              healthy_habit: dto.onboardingData.healthyHabit,
            })
            .select()
            .single();

        if (!onboardingError && onboarding) {
          imported.onboarding = true;

          // Mark user as onboarding completed
          await this.supabaseService
            .getAdminClient()
            .from('users')
            .update({ onboarding_completed: true })
            .eq('id', userId);
        }
      }

      // Import plan and tasks
      if (dto.plan && dto.plan.length > 0) {
        // Create plan
        const { data: plan, error: planError } = await this.supabaseService
          .getAdminClient()
          .from('plans')
          .insert({
            user_id: userId,
            total_days: 30,
            current_day: dto.userProgress?.currentDay || 1,
            is_active: true,
          })
          .select()
          .single();

        if (!planError && plan) {
          imported.plan = true;

          // Import day plans and tasks
          for (const dayPlan of dto.plan) {
            const { data: createdDayPlan } = await this.supabaseService
              .getAdminClient()
              .from('day_plans')
              .insert({
                plan_id: plan.id,
                day_number: dayPlan.day,
                unlocked: dayPlan.unlocked || false,
              })
              .select()
              .single();

            if (createdDayPlan && Array.isArray(dayPlan.tasks)) {
              for (const task of dayPlan.tasks) {
                await this.supabaseService
                  .getAdminClient()
                  .from('tasks')
                  .insert({
                    day_plan_id: createdDayPlan.id,
                    user_id: userId,
                    task_order: task.order,
                    task_type: task.type,
                    title: task.title,
                    description: task.description,
                    completed: task.completed || false,
                    completed_at: task.completed
                      ? new Date().toISOString()
                      : null,
                  });

                if (task.completed) {
                  imported.tasks++;
                }
              }
            }
          }

          // Create user progress
          await this.supabaseService
            .getAdminClient()
            .from('user_progress')
            .insert({
              user_id: userId,
              plan_id: plan.id,
              current_day: dto.userProgress?.currentDay || 1,
              total_tasks_completed: imported.tasks,
              ai_messages_used: dto.userProgress?.aiMessagesUsed || 0,
              quote_regenerations: dto.userProgress?.quoteRegenerations || 0,
              streak_days: 0,
              last_activity_date: new Date().toISOString().split('T')[0],
            });
        }
      }

      // Import chat messages (optional)
      if (dto.chatMessages && dto.chatMessages.length > 0) {
        for (const message of dto.chatMessages) {
          await this.supabaseService
            .getAdminClient()
            .from('chat_messages')
            .insert({
              user_id: userId,
              role: message.role,
              content: message.content,
              sender_name: message.senderName,
            });

          imported.messages++;
        }
      }

      // Import quotes (optional)
      if (dto.quotes && dto.quotes.length > 0) {
        for (const quote of dto.quotes) {
          await this.supabaseService
            .getAdminClient()
            .from('quotes')
            .insert({
              user_id: userId,
              text: quote.text,
              author: quote.author,
              category: quote.category || 'emotional',
              niche: 'general',
              is_active: true,
            });

          imported.quotes++;
        }
      }

      return {
        success: true,
        imported,
        message:
          'Data migrated successfully. You can now use the app with your existing progress!',
      };
    } catch (error) {
      this.logger.error(`Import localStorage failed: ${error.message}`);
      throw error;
    }
  }
}
