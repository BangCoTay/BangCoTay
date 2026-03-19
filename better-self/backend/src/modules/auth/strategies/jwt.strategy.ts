import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../../database/supabase.service';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';

interface JwtPayload {
  sub: string;
  email: string;
  [key: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    try {
      // Fetch user profile from database
      const { data: user, error } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('id, email, subscription_tier, onboarding_completed')
        .eq('id', payload.sub)
        .single();

      if (error || !user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier,
        onboardingCompleted: user.onboarding_completed,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
