import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getProgress(userId: string) {
    try {
      // Get active plan
      const { data: plan } = await this.supabaseService
        .getAdminClient()
        .from('plans')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!plan) {
        return null;
      }

      // Get user progress
      const { data: progress, error } = await this.supabaseService
        .getAdminClient()
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_id', plan.id)
        .single();

      if (error) {
        this.logger.error(`Get progress failed: ${error.message}`);
        return null;
      }

      // Calculate completion rate
      const { data: tasks } = await this.supabaseService
        .getAdminClient()
        .from('tasks')
        .select('completed')
        .eq('user_id', userId);

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter((t) => t.completed).length || 0;
      const completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        currentDay: progress.current_day,
        totalTasksCompleted: progress.total_tasks_completed,
        streakDays: progress.streak_days,
        completionRate: Math.round(completionRate),
        aiMessagesUsed: progress.ai_messages_used,
        quoteRegenerations: progress.quote_regenerations,
        lastActivityDate: progress.last_activity_date,
      };
    } catch (error) {
      this.logger.error(`Get progress failed: ${error.message}`);
      throw error;
    }
  }

  async getAnalytics(userId: string) {
    try {
      // Get active plan
      const { data: plan } = await this.supabaseService
        .getAdminClient()
        .from('plans')
        .select('id, started_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!plan) {
        return null;
      }

      // Get all tasks with completion data
      const { data: tasks } = await this.supabaseService
        .getAdminClient()
        .from('tasks')
        .select('*, day_plans!inner(day_number)')
        .eq('user_id', userId)
        .order('day_plans(day_number)', { ascending: true });

      // Calculate weekly progress
      const weeklyProgress: {
        week: number;
        completed: number;
        total: number;
        percentage: number;
      }[] = [];
      for (let week = 1; week <= 4; week++) {
        const startDay = (week - 1) * 7 + 1;
        const endDay = week * 7;

        const weekTasks = tasks?.filter(
          (t) =>
            t.day_plans.day_number >= startDay &&
            t.day_plans.day_number <= endDay,
        );

        const completed = weekTasks?.filter((t) => t.completed).length || 0;
        const total = weekTasks?.length || 0;

        weeklyProgress.push({
          week,
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }

      // Task completion by type
      const quitTasks = tasks?.filter((t) => t.task_type === 'quit') || [];
      const adoptTasks = tasks?.filter((t) => t.task_type === 'adopt') || [];

      const taskCompletionByType = {
        quit: {
          completed: quitTasks.filter((t) => t.completed).length,
          total: quitTasks.length,
        },
        adopt: {
          completed: adoptTasks.filter((t) => t.completed).length,
          total: adoptTasks.length,
        },
      };

      // Streak history (simplified - last 7 days)
      const streakHistory: { date: string; tasksCompleted: number }[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Check if any tasks were completed on this date
        const dayTasks = tasks?.filter(
          (t) => t.completed_at?.split('T')[0] === dateStr,
        );

        streakHistory.push({
          date: dateStr,
          tasksCompleted: dayTasks?.length || 0,
        });
      }

      return {
        weeklyProgress,
        taskCompletionByType,
        streakHistory,
      };
    } catch (error) {
      this.logger.error(`Get analytics failed: ${error.message}`);
      throw error;
    }
  }
}
