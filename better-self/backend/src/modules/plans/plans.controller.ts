import { Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('generate')
  async generatePlan(@CurrentUser() user: AuthenticatedUser) {
    return this.plansService.generatePlan(user.id, user.subscriptionTier);
  }

  @Get('current')
  async getCurrentPlan(@CurrentUser() user: AuthenticatedUser) {
    return this.plansService.getCurrentPlan(user.id);
  }

  @Get(':planId/day/:dayNumber')
  async getDayPlan(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId') planId: string,
    @Param('dayNumber', ParseIntPipe) dayNumber: number,
  ) {
    return this.plansService.getDayPlan(user.id, planId, dayNumber);
  }
}
