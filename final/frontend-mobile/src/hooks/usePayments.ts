import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api-client';

export function useFakePayments() {
  const [isLoading, setIsLoading] = useState(false);
  const queryHookQueryClient = useQueryClient();

  const purchasePlan = async (tier: 'free' | 'starter' | 'premium') => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await api.post('/users/upgrade-fake', { tier });
      
      // Invalidate subscription queries to refresh from backend
      queryHookQueryClient.invalidateQueries({ queryKey: ['users', 'subscription'] });
      queryHookQueryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      queryHookQueryClient.invalidateQueries({ queryKey: ['plans'] });
      
      return response.data;
    } catch (error) {
      console.error('Fake payment error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    // For fake payments, restore to free plan
    return purchasePlan('free');
  };

  return {
    isLoading,
    purchasePlan,
    restorePurchases,
  };
}
