import { Controller, Get } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getProgress(user.id);
  }

  @Get('analytics')
  async getAnalytics(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getAnalytics(user.id);
  }
}
