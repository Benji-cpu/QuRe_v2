import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PREMIUM_STATUS: 'qure_premium_status',
};

interface PremiumStatus {
  isPremium: boolean;
  expiryDate: number | null;
}

const defaultPremiumStatus: PremiumStatus = {
  isPremium: false,
  expiryDate: null,
};

export const getPremiumStatus = async (): Promise<PremiumStatus> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
    if (jsonValue === null) {
      return defaultPremiumStatus;
    }
    
    const status = JSON.parse(jsonValue) as PremiumStatus;
    
    if (status.expiryDate && status.expiryDate < Date.now()) {
      return defaultPremiumStatus;
    }
    
    return status;
  } catch (error) {
    console.error('Error loading premium status:', error);
    return defaultPremiumStatus;
  }
};

export const setPremiumStatus = async (status: PremiumStatus): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(status);
    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, jsonValue);
  } catch (error) {
    console.error('Error saving premium status:', error);
    throw error;
  }
};

export const checkFeatureAccess = async (
  feature: 'secondarySlot' | 'advancedStyles' | 'allGradients'
): Promise<boolean> => {
  const status = await getPremiumStatus();
  
  if (!status.isPremium) {
    return false;
  }
  
  return true;
};