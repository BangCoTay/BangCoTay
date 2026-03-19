import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { SubscriptionTier } from '../../../types/subscription-tier.enum';

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsEnum(SubscriptionTier)
  @IsNotEmpty()
  tier: SubscriptionTier;
}
