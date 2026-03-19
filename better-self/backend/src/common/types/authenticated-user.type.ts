export interface AuthenticatedUser {
  id: string;
  email: string;
  subscriptionTier: string;
  onboardingCompleted: boolean;
}
