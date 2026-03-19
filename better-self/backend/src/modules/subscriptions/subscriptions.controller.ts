import { Controller, Get, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  async getCurrentSubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getCurrentSubscription(user.id);
  }

  @Post('cancel')
  async cancelSubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }
}
