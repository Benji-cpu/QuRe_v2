import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { QRStorage } from '../services/QRStorage';
import { UserPreferencesService } from '../services/UserPreferences';
import { QRCodeData } from '../types/QRCode';

interface AppState {
  primaryQR: QRCodeData | null;
  secondaryQR: QRCodeData | null;
  isPremium: boolean;
  selectedGradientId: string;
  isPremiumModalOpen: boolean;
  refreshData: () => Promise<void>;
  updatePrimaryQR: (qrId: string | undefined) => Promise<void>;
  updateSecondaryQR: (qrId: string | undefined) => Promise<void>;
  setPremium: (isPremium: boolean) => Promise<void>;
  navigateToPremium: () => void;
  setPremiumModalOpen: (isOpen: boolean) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [primaryQR, setPrimaryQR] = useState<QRCodeData | null>(null);
  const [secondaryQR, setSecondaryQR] = useState<QRCodeData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedGradientId, setSelectedGradientId] = useState('sunset');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const refreshData = async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      
      setSelectedGradientId(preferences.selectedGradientId);
      setIsPremium(premium);

      if (preferences.primaryQRCodeId) {
        const primaryQRData = await QRStorage.getQRCodeById(preferences.primaryQRCodeId);
        setPrimaryQR(primaryQRData);
      } else {
        setPrimaryQR(null);
      }

      if (preferences.secondaryQRCodeId && premium) {
        const secondaryQRData = await QRStorage.getQRCodeById(preferences.secondaryQRCodeId);
        setSecondaryQR(secondaryQRData);
      } else if (!premium) {
        setSecondaryQR(null);
      }
    } catch (error) {
      console.error('Error refreshing app data:', error);
    }
  };

  const updatePrimaryQR = async (qrId: string | undefined) => {
    await UserPreferencesService.updatePrimaryQR(qrId);
    await refreshData();
  };

  const updateSecondaryQR = async (qrId: string | undefined) => {
    await UserPreferencesService.updateSecondaryQR(qrId);
    await refreshData();
  };

  const setPremiumStatus = async (premium: boolean) => {
    await UserPreferencesService.setPremium(premium);
    await refreshData();
  };

  const navigateToPremium = () => {
    // Only navigate if the modal is not already open
    if (!isPremiumModalOpen) {
      setIsPremiumModalOpen(true);
      router.push('/modal/premium');
    }
  };

  const setPremiumModalOpen = (isOpen: boolean) => {
    setIsPremiumModalOpen(isOpen);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AppStateContext.Provider 
      value={{
        primaryQR,
        secondaryQR,
        isPremium,
        selectedGradientId,
        isPremiumModalOpen,
        refreshData,
        updatePrimaryQR,
        updateSecondaryQR,
        setPremium: setPremiumStatus,
        navigateToPremium,
        setPremiumModalOpen,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}