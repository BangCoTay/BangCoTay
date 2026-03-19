import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        API_PREFIX: Joi.string().default('api/v1'),

        // Supabase
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_ANON_KEY: Joi.string().required(),
        SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),

        // Stripe
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
        STRIPE_PRICE_ID_STARTER: Joi.string().optional(),
        STRIPE_PRICE_ID_PREMIUM: Joi.string().optional(),

        // OpenAI
        OPENAI_API_KEY: Joi.string().required(),

        // Frontend
        FRONTEND_URL: Joi.string().default('http://localhost:8080'),
      }),
    }),
  ],
})
export class ConfigModule {}
