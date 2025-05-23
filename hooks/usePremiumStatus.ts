import { useCallback, useEffect, useState } from 'react';
import * as PremiumService from '../services/premium';

export const usePremiumStatus = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [expiryDate, setExpiryDate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPremiumStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await PremiumService.getPremiumStatus();
      setIsPremium(status.isPremium);
      setExpiryDate(status.expiryDate);
    } catch (error) {
      console.error('Error loading premium status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPremiumStatus();
  }, [loadPremiumStatus]);

  const setPremiumStatus = useCallback(async (isPremium: boolean, expiryDate: number | null = null) => {
    try {
      await PremiumService.setPremiumStatus({ isPremium, expiryDate });
      setIsPremium(isPremium);
      setExpiryDate(expiryDate);
    } catch (error) {
      console.error('Error setting premium status:', error);
      throw error;
    }
  }, []);

  const checkFeatureAccess = useCallback(async (feature: 'secondarySlot' | 'advancedStyles' | 'allGradients') => {
    return await PremiumService.checkFeatureAccess(feature);
  }, []);

  return {
    isPremium,
    expiryDate,
    loading,
    setPremiumStatus,
    checkFeatureAccess,
    loadPremiumStatus,
  };
};