import { useEffect, useState } from 'react';
import { GRADIENT_PRESETS } from '../../constants/Gradients';
import { QRStorage } from '../../services/QRStorage';
import { UserPreferencesService } from '../../services/UserPreferences';
import { QRCodeData } from '../../types/QRCode';

export function useHomeScreenState() {
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [primaryQR, setPrimaryQR] = useState<QRCodeData | null>(null);
  const [secondaryQR, setSecondaryQR] = useState<QRCodeData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(true);

  useEffect(() => {
    loadUserData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadUserData = async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      
      const gradientIndex = GRADIENT_PRESETS.findIndex(g => g.id === preferences.selectedGradientId);
      setCurrentGradientIndex(gradientIndex >= 0 ? gradientIndex : 0);
      setIsPremium(premium);

      if (preferences.primaryQRCodeId) {
        const primaryQRData = await QRStorage.getQRCodeById(preferences.primaryQRCodeId);
        setPrimaryQR(primaryQRData);
      }

      if (preferences.secondaryQRCodeId && premium) {
        const secondaryQRData = await QRStorage.getQRCodeById(preferences.secondaryQRCodeId);
        setSecondaryQR(secondaryQRData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const changeGradient = (newIndex: number) => {
    setCurrentGradientIndex(newIndex);
  };

  const handleRemoveQR = async (slot: 'primary' | 'secondary') => {
    try {
      if (slot === 'primary') {
        await UserPreferencesService.updatePrimaryQR(undefined);
        setPrimaryQR(null);
      } else {
        await UserPreferencesService.updateSecondaryQR(undefined);
        setSecondaryQR(null);
      }
    } catch (error) {
      console.error('Error removing QR code:', error);
    }
  };

  const handleTestUpgrade = async () => {
    const newStatus = !isPremium;
    await UserPreferencesService.setPremium(newStatus);
    setIsPremium(newStatus);
    loadUserData();
  };

  // Update gradient preference when index changes
  useEffect(() => {
    const updateGradientPreference = async () => {
      try {
        await UserPreferencesService.updateGradient(GRADIENT_PRESETS[currentGradientIndex].id);
      } catch (error) {
        console.error('Error updating gradient preference:', error);
      }
    };
    updateGradientPreference();
  }, [currentGradientIndex]);

  return {
    currentGradientIndex,
    currentTime,
    primaryQR,
    secondaryQR,
    isPremium,
    showActionButtons,
    loadUserData,
    changeGradient,
    handleRemoveQR,
    handleTestUpgrade,
    setShowActionButtons,
  };
} 