import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { GRADIENT_PRESETS } from '../constants/Gradients';
import { QRStorage } from '../services/QRStorage';
import { UserPreferencesService } from '../services/UserPreferences';
import { QRCodeData } from '../types/QRCode';

export interface AppState {
  currentGradientIndex: number;
  primaryQR: QRCodeData | null;
  secondaryQR: QRCodeData | null;
  isPremium: boolean;
  loading: boolean;
}

export function useAppState() {
  const [state, setState] = useState<AppState>({
    currentGradientIndex: 0,
    primaryQR: null,
    secondaryQR: null,
    isPremium: false,
    loading: true,
  });

  const loadUserData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      
      const gradientIndex = GRADIENT_PRESETS.findIndex(g => g.id === preferences.selectedGradientId);
      
      let primaryQRData: QRCodeData | null = null;
      let secondaryQRData: QRCodeData | null = null;

      if (preferences.primaryQRCodeId) {
        primaryQRData = await QRStorage.getQRCodeById(preferences.primaryQRCodeId);
      }

      if (preferences.secondaryQRCodeId && premium) {
        secondaryQRData = await QRStorage.getQRCodeById(preferences.secondaryQRCodeId);
      }

      setState({
        currentGradientIndex: gradientIndex >= 0 ? gradientIndex : 0,
        primaryQR: primaryQRData,
        secondaryQR: secondaryQRData,
        isPremium: premium,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const updateGradientIndex = useCallback((newIndex: number) => {
    setState(prev => ({ ...prev, currentGradientIndex: newIndex }));
  }, []);

  const updatePremiumStatus = useCallback((premium: boolean) => {
    setState(prev => ({ ...prev, isPremium: premium }));
  }, []);

  const removeQR = useCallback(async (slot: 'primary' | 'secondary') => {
    try {
      if (slot === 'primary') {
        await UserPreferencesService.updatePrimaryQR(undefined);
        setState(prev => ({ ...prev, primaryQR: null }));
      } else {
        await UserPreferencesService.updateSecondaryQR(undefined);
        setState(prev => ({ ...prev, secondaryQR: null }));
      }
    } catch (error) {
      console.error('Error removing QR code:', error);
    }
  }, []);

  return {
    state,
    loadUserData,
    updateGradientIndex,
    updatePremiumStatus,
    removeQR,
  };
} 