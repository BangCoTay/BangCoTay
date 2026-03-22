import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useQueryClient } from '@tanstack/react-query';

let isConfigured = false;

export function useRevenueCat() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const configure = async () => {
      if (!isConfigured) {
        const apiKey = Platform.OS === 'ios'
          ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
          : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

        if (apiKey) {
          Purchases.configure({ apiKey });
          isConfigured = true;
        }
      }

      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current?.availablePackages) {
          setPackages(offerings.current.availablePackages);
        }
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
      } catch (error) {
        console.error('RevenueCat error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    configure();
  }, []);

  const purchasePackage = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedInfo);
      // Invalidate subscription queries to refresh from backend
      queryClient.invalidateQueries({ queryKey: ['users', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      return updatedInfo;
    } catch (error: any) {
      if (!error.userCancelled) {
        throw error;
      }
      return null;
    }
  };

  const restorePurchases = async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      queryClient.invalidateQueries({ queryKey: ['users', 'subscription'] });
      return info;
    } catch (error) {
      throw error;
    }
  };

  const isPro = customerInfo?.entitlements?.active?.['pro'] !== undefined;

  return {
    packages,
    customerInfo,
    isLoading,
    isPro,
    purchasePackage,
    restorePurchases,
  };
}
