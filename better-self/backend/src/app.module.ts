import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { PlansModule } from './modules/plans/plans.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ChatModule } from './modules/chat/chat.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { MigrationModule } from './modules/migration/migration.module';
import { JwtAuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),
    // Configuration
    ConfigModule,
    // Database
    DatabaseModule,
    // Feature modules
    AuthModule,
    UsersModule,
    OnboardingModule,
    PlansModule,
    TasksModule,
    ProgressModule,
    ChatModule,
    QuotesModule,
    PaymentsModule,
    SubscriptionsModule,
    MigrationModule,
  ],
  providers: [
    // Global auth guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
