import { Controller, Post, Get, Body } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  async createOnboarding(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createOnboardingDto: CreateOnboardingDto,
  ) {
    return this.onboardingService.createOnboarding(
      user.id,
      createOnboardingDto,
    );
  }

  @Get()
  async getOnboarding(@CurrentUser() user: AuthenticatedUser) {
    return this.onboardingService.getOnboarding(user.id);
  }
}
