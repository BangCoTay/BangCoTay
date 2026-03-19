import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      user.id,
      sendMessageDto,
      user.subscriptionTier,
    );
  }

  @Get('messages')
  async getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.chatService.getMessages(user.id, limit, offset);
  }

  @Delete('messages')
  async deleteMessages(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.deleteMessages(user.id);
  }
}
