import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getTasks(userId: string, dayNumber?: number, completed?: boolean) {
    try {
      let query = this.supabaseService
        .getAdminClient()
        .from('tasks')
        .select('*, day_plans!inner(day_number, unlocked)')
        .eq('user_id', userId);

      if (dayNumber !== undefined) {
        query = query.eq('day_plans.day_number', dayNumber);
      }

      if (completed !== undefined) {
        query = query.eq('completed', completed);
      }

      const { data, error } = await query.order('task_order', {
        ascending: true,
      });

      if (error) {
        this.logger.error(`Get tasks failed: ${error.message}`);
        throw new Error('Failed to fetch tasks');
      }

      return data;
    } catch (error) {
      this.logger.error(`Get tasks failed: ${error.message}`);
      throw error;
    }
  }

  async completeTask(userId: string, taskId: string) {
    try {
      // Get task and verify ownership
      const { data: task, error: taskError } = await this.supabaseService
        .getAdminClient()
        .from('tasks')
        .select('*, day_plans!inner(unlocked, plan_id)')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single();

      if (taskError || !task) {
        throw new NotFoundException('Task not found');
      }

      // Check if day is unlocked
      if (!task.day_plans.unlocked) {
        throw new ForbiddenException(
          'This day is locked. Upgrade to unlock more days.',
        );
      }

      // Check if already completed
      if (task.completed) {
        return {
          task,
          message: 'Task already completed',
        };
      }

      // Mark task as completed
      const { data: updatedTask, error: updateError } =
        await this.supabaseService
          .getAdminClient()
          .from('tasks')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', taskId)
          .select()
          .single();

      if (updateError) {
        this.logger.error(`Complete task failed: ${updateError.message}`);
        throw new Error('Failed to complete task');
      }

      // Update user progress
      const { data: progress } = await this.supabaseService
        .getAdminClient()
        .from('user_progress')
        .select('*')
        .eq('plan_id', task.day_plans.plan_id)
        .eq('user_id', userId)
        .single();

      if (progress) {
        const today = new Date().toISOString().split('T')[0];
        const lastActivityDate = progress.last_activity_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = progress.streak_days;

        // Update streak
        if (lastActivityDate === yesterdayStr) {
          // Continue streak
          newStreak += 1;
        } else if (lastActivityDate !== today) {
          // Reset streak if more than 1 day gap
          newStreak = 1;
        }

        await this.supabaseService
          .getAdminClient()
          .from('user_progress')
          .update({
            total_tasks_completed: progress.total_tasks_completed + 1,
            streak_days: newStreak,
            last_activity_date: today,
          })
          .eq('id', progress.id);

        // Check if this completes all tasks for the day
        const { data: dayTasks } = await this.supabaseService
          .getAdminClient()
          .from('tasks')
          .select('completed')
          .eq('day_plan_id', task.day_plan_id);

        const allCompleted = dayTasks?.every((t) => t.completed);

        return {
          task: updatedTask,
          progress: {
            totalTasksCompleted: progress.total_tasks_completed + 1,
            streakDays: newStreak,
          },
          streakUpdated: newStreak > progress.streak_days,
          celebrationMessage: allCompleted
            ? `🎉 Amazing! You completed all tasks for today! Streak: ${newStreak} days`
            : null,
        };
      }

      return {
        task: updatedTask,
        message: 'Task completed successfully',
      };
    } catch (error) {
      this.logger.error(`Complete task failed: ${error.message}`);
      throw error;
    }
  }

  async uncompleteTask(userId: string, taskId: string) {
    try {
      // Get task and verify ownership
      const { data: task, error: taskError } = await this.supabaseService
        .getAdminClient()
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single();

      if (taskError || !task) {
        throw new NotFoundException('Task not found');
      }

      // Mark task as not completed
      const { data: updatedTask, error: updateError } =
        await this.supabaseService
          .getAdminClient()
          .from('tasks')
          .update({
            completed: false,
            completed_at: null,
          })
          .eq('id', taskId)
          .select()
          .single();

      if (updateError) {
        this.logger.error(`Uncomplete task failed: ${updateError.message}`);
        throw new Error('Failed to uncomplete task');
      }

      return {
        task: updatedTask,
        message: 'Task marked as incomplete',
      };
    } catch (error) {
      this.logger.error(`Uncomplete task failed: ${error.message}`);
      throw error;
    }
  }
}
