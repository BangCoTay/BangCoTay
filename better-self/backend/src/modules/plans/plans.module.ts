import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlanGeneratorService } from './plan-generator.service';

@Module({
  controllers: [PlansController],
  providers: [PlansService, PlanGeneratorService],
  exports: [PlansService, PlanGeneratorService],
})
export class PlansModule {}
