import {
  Injectable,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { OpenAIService } from './openai.service';
import { SendMessageDto } from './dto/send-message.dto';
import { SUBSCRIPTION_LIMITS } from '../../common/constants/subscription-limits';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private supabaseService: SupabaseService,
    private openaiService: OpenAIService,
  ) {}

  async sendMessage(
    userId: string,
    dto: SendMessageDto,
    subscriptionTier: string,
  ) {
    try {
      // Check message limits
      const limits =
        SUBSCRIPTION_LIMITS[subscriptionTier] || SUBSCRIPTION_LIMITS.free;

      // Get user progress to check AI messages used today
      const { data: progress } = await this.supabaseService
        .getAdminClient()
        .from('user_progress')
        .select('ai_messages_used, last_activity_date')
        .eq('user_id', userId)
        .single();

      if (progress) {
        const today = new Date().toISOString().split('T')[0];
        const lastActivityDate = progress.last_activity_date;

        // Reset counter if it's a new day
        let messagesUsedToday = progress.ai_messages_used;
        if (lastActivityDate !== today) {
          messagesUsedToday = 0;
        }

        // Check if user has exceeded limit (unless unlimited)
        if (
          limits.aiMessagesPerDay !== -1 &&
          messagesUsedToday >= limits.aiMessagesPerDay
        ) {
          throw new ForbiddenException(
            `Daily AI message limit reached (${limits.aiMessagesPerDay} messages). Upgrade to send more messages.`,
          );
        }
      }

      // Save user message
      const { data: userMessage, error: userMessageError } =
        await this.supabaseService
          .getAdminClient()
          .from('chat_messages')
          .insert({
            user_id: userId,
            role: 'user',
            content: dto.content,
          })
          .select()
          .single();

      if (userMessageError) {
        this.logger.error(
          `Save user message failed: ${userMessageError.message}`,
        );
        throw new BadRequestException('Failed to save message');
      }

      // Get recent chat history (last 10 messages)
      const { data: recentMessages } = await this.supabaseService
        .getAdminClient()
        .from('chat_messages')
        .select('role, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Reverse to get chronological order
      const chatHistory = recentMessages?.reverse() || [];

      // Get user context for personalized response
      const { data: onboarding } = await this.supabaseService
        .getAdminClient()
        .from('onboarding_data')
        .select('niche, addiction, severity')
        .eq('user_id', userId)
        .single();

      const { data: userProgress } = await this.supabaseService
        .getAdminClient()
        .from('user_progress')
        .select('current_day, total_tasks_completed, streak_days')
        .eq('user_id', userId)
        .single();

      const userContext = {
        niche: onboarding?.niche,
        addiction: onboarding?.addiction,
        severity: onboarding?.severity,
        currentDay: userProgress?.current_day,
        recentProgress: userProgress
          ? `${userProgress.total_tasks_completed} tasks completed, ${userProgress.streak_days} day streak`
          : 'just starting',
      };

      // Generate AI response
      const aiResponse = await this.openaiService.generateCoachResponse(
        chatHistory,
        dto.coachPersona || 'Alex',
        userContext,
        subscriptionTier,
      );

      // Save AI response
      const { data: assistantMessage, error: assistantMessageError } =
        await this.supabaseService
          .getAdminClient()
          .from('chat_messages')
          .insert({
            user_id: userId,
            role: 'assistant',
            content: aiResponse.content,
            sender_name: dto.coachPersona || 'Alex',
            tokens_used: aiResponse.tokensUsed,
            model: aiResponse.model,
          })
          .select()
          .single();

      if (assistantMessageError) {
        this.logger.error(
          `Save assistant message failed: ${assistantMessageError.message}`,
        );
      }

      // Update AI messages used count
      if (progress) {
        const today = new Date().toISOString().split('T')[0];
        const lastActivityDate = progress.last_activity_date;
        const messagesUsedToday =
          lastActivityDate === today ? progress.ai_messages_used + 1 : 1;

        await this.supabaseService
          .getAdminClient()
          .from('user_progress')
          .update({
            ai_messages_used: messagesUsedToday,
          })
          .eq('user_id', userId);

        const messagesRemaining =
          limits.aiMessagesPerDay === -1
            ? -1
            : limits.aiMessagesPerDay - messagesUsedToday;

        return {
          userMessage,
          assistantMessage,
          messagesRemaining,
        };
      }

      return {
        userMessage,
        assistantMessage,
      };
    } catch (error) {
      this.logger.error(`Send message failed: ${error.message}`);
      throw error;
    }
  }

  async getMessages(userId: string, limit: number = 50, offset: number = 0) {
    try {
      const { data, error, count } = await this.supabaseService
        .getAdminClient()
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error(`Get messages failed: ${error.message}`);
        throw new Error('Failed to fetch messages');
      }

      const totalCount = count ?? 0;

      return {
        messages: data,
        total: totalCount,
        hasMore: totalCount > offset + limit,
      };
    } catch (error) {
      this.logger.error(`Get messages failed: ${error.message}`);
      throw error;
    }
  }

  async deleteMessages(userId: string) {
    try {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) {
        this.logger.error(`Delete messages failed: ${error.message}`);
        throw new Error('Failed to delete messages');
      }

      return { success: true, message: 'Chat history cleared' };
    } catch (error) {
      this.logger.error(`Delete messages failed: ${error.message}`);
      throw error;
    }
  }
}
