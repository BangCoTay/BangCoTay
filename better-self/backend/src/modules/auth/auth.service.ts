import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private supabaseService: SupabaseService) {}

  async signup(signupDto: SignupDto) {
    const { email, password, fullName } = signupDto;

    try {
      // Sign up user with Supabase Auth
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

      if (error) {
        this.logger.error(`Signup error: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      // Create user profile in public.users table
      if (data.user) {
        const { error: profileError } = await this.supabaseService
          .getAdminClient()
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            subscription_tier: 'free',
            onboarding_completed: false,
          });

        if (profileError) {
          this.logger.error(`Profile creation error: ${profileError.message}`);
          // Don't throw here - user is created in auth, profile can be created later
        }
      }

      return {
        user: data.user,
        session: data.session,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      };
    } catch (error) {
      this.logger.error(`Signup failed: ${error.message}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        this.logger.error(`Login error: ${error.message}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Fetch user profile
      const { data: profile } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        user: data.user,
        profile,
        session: data.session,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.refreshSession({ refresh_token: refreshToken });

      if (error || !data.session) {
        this.logger.error(
          `Token refresh error: ${error?.message ?? 'Unknown error'}`,
        );
        throw new UnauthorizedException('Invalid refresh token');
      }

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw error;
    }
  }

  async logout(accessToken: string) {
    try {
      const client = this.supabaseService.setUserContext(accessToken);
      await client.auth.signOut();

      return { success: true };
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`);
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error) {
        throw new UnauthorizedException('Invalid token');
      }

      return data.user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getMe(userId: string) {
    try {
      // Get user from auth
      const { data: authUser, error: authError } = await this.supabaseService
        .getAdminClient()
        .auth.admin.getUserById(userId);

      if (authError) {
        throw new UnauthorizedException('User not found');
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        this.logger.error(`Profile fetch error: ${profileError.message}`);
      }

      // Get subscription info
      const { data: subscription } = await this.supabaseService
        .getAdminClient()
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      return {
        user: authUser.user,
        profile,
        subscription,
      };
    } catch (error) {
      this.logger.error(`Get me failed: ${error.message}`);
      throw error;
    }
  }
}
