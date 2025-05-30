import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@qure_user_preferences';
const PREMIUM_KEY = '@qure_premium_status';

export interface UserPreferences {
  selectedGradientId: string;
  primaryQRCodeId?: string;
  secondaryQRCodeId?: string;
}

export class UserPreferencesService {
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      return data ? JSON.parse(data) : { selectedGradientId: 'sunset' };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return { selectedGradientId: 'sunset' };
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
}