import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface CreateCheckoutRequest {
  priceId: string;
  tier: 'starter' | 'premium';
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface CustomerPortalResponse {
  portalUrl: string;
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (data: CreateCheckoutRequest) => {
      const response = await apiClient.post('/payments/create-checkout', data);
      return response.data as CreateCheckoutResponse;
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
    },
  });
}

export function useCustomerPortal() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.get('/payments/portal');
      return response.data as CustomerPortalResponse;
    },
    onSuccess: (data) => {
      // Redirect to Stripe customer portal
      window.location.href = data.portalUrl;
    },
  });
}
