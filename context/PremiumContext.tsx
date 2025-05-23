import React, { createContext, ReactNode, useCallback } from 'react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

interface PremiumContextProps {
  isPremium: boolean;
  expiryDate: number | null;
  loading: boolean;
  setPremiumStatus: (isPremium: boolean, expiryDate?: number | null) => Promise<void>;
  checkFeatureAccess: (feature: 'secondarySlot' | 'advancedStyles' | 'allGradients') => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export const PremiumContext = createContext<PremiumContextProps>({
  isPremium: false,
  expiryDate: null,
  loading: false,
  setPremiumStatus: async () => {},
  checkFeatureAccess: async () => false,
  refreshStatus: async () => {},
});

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    isPremium,
    expiryDate,
    loading,
    setPremiumStatus: setPremiumStatusHook,
    checkFeatureAccess,
    loadPremiumStatus,
  } = usePremiumStatus();

  const setPremiumStatus = useCallback(async (isPremium: boolean, expiryDate?: number | null) => {
    try {
      await setPremiumStatusHook(isPremium, expiryDate || null);
    } catch (error) {
      console.error('Error setting premium status:', error);
      throw error;
    }
  }, [setPremiumStatusHook]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        expiryDate,
        loading,
        setPremiumStatus,
        checkFeatureAccess,
        refreshStatus: loadPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};