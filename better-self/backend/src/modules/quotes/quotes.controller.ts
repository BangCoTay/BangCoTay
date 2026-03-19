import { Controller, Get, Post } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  async getQuotes(@CurrentUser() user: AuthenticatedUser) {
    return this.quotesService.getQuotes(user.id, user.subscriptionTier);
  }

  @Post('regenerate')
  async regenerateQuotes(@CurrentUser() user: AuthenticatedUser) {
    return this.quotesService.regenerateQuotes(user.id, user.subscriptionTier);
  }
}
