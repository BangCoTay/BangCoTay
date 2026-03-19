import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TIER_HIERARCHY } from '../constants/subscription-limits';

export const REQUIRED_TIER_KEY = 'requiredTier';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.get<string>(
      REQUIRED_TIER_KEY,
      context.getHandler(),
    );

    if (!requiredTier) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userTierLevel = TIER_HIERARCHY[user.subscriptionTier] || 0;
    const requiredTierLevel = TIER_HIERARCHY[requiredTier] || 0;

    if (userTierLevel < requiredTierLevel) {
      throw new ForbiddenException(
        `This feature requires ${requiredTier} subscription or higher`,
      );
    }

    return true;
  }
}
