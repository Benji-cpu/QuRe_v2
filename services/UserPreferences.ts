// services/UserPreferences.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@qure_user_preferences';
const PREMIUM_KEY = '@qure_premium_status';
const ONBOARDING_KEY = '@qure_onboarding_complete';

export interface UserPreferences {
  selectedGradientId: string;
  primaryQRCodeId?: string;
  secondaryQRCodeId?: string;
  qrVerticalOffset?: number;
  qrHorizontalOffset?: number;
  qrScale?: number;
}

export class UserPreferencesService {
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      return data ? JSON.parse(data) : { 
        selectedGradientId: 'sunset', 
        qrVerticalOffset: 80,
        qrHorizontalOffset: 0,
        qrScale: 1
      };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return { 
        selectedGradientId: 'sunset', 
        qrVerticalOffset: 80,
        qrHorizontalOffset: 0,
        qrScale: 1
      };
    }
  }

  static async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  static async updateGradient(gradientId: string): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.selectedGradientId = gradientId;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating gradient:', error);
      throw error;
    }
  }

  static async updatePrimaryQR(qrCodeId?: string): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.primaryQRCodeId = qrCodeId;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating primary QR:', error);
      throw error;
    }
  }

  static async updateSecondaryQR(qrCodeId?: string): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.secondaryQRCodeId = qrCodeId;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating secondary QR:', error);
      throw error;
    }
  }

  static async updateQRVerticalOffset(offset: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.qrVerticalOffset = offset;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR vertical offset:', error);
      throw error;
    }
  }

  static async updateQRHorizontalOffset(offset: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.qrHorizontalOffset = offset;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR horizontal offset:', error);
      throw error;
    }
  }

  static async updateQRScale(scale: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.qrScale = scale;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR scale:', error);
      throw error;
    }
  }

  static async isPremium(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(PREMIUM_KEY);
      return status === 'true';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  static async setPremium(isPremium: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(PREMIUM_KEY, isPremium.toString());
    } catch (error) {
      console.error('Error setting premium status:', error);
      throw error;
    }
  }

  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  static async setOnboardingComplete(complete: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, complete.toString());
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  }
}