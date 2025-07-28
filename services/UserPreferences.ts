import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@qure_user_preferences';
const PREMIUM_KEY = '@qure_premium_status';
const ONBOARDING_KEY = '@qure_onboarding_complete';

export interface UserPreferences {
  selectedGradientId: string;
  primaryQRCodeId?: string;
  secondaryQRCodeId?: string;
  qrXPosition?: number;  // 0-100 coordinate system (0=left, 100=right)
  qrYPosition?: number;  // 0-100 coordinate system (0=bottom, 100=top)
  qrScale?: number;
  showTitle?: boolean;
  qrSlotMode?: 'single' | 'double';
  backgroundType?: 'gradient' | 'custom';
}

export class UserPreferencesService {
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      const defaultPreferences = { 
        selectedGradientId: 'sunset', 
        qrXPosition: 50,  // Default centered horizontally
        qrYPosition: 30,  // Default 30% from bottom
        qrScale: 1,
        showTitle: true,
        qrSlotMode: 'double',
        backgroundType: 'gradient'
      };
      
      const preferences = data ? { ...defaultPreferences, ...JSON.parse(data) } : defaultPreferences;
      
      // Migrate old coordinate system to new simple system
      if (preferences.qrVerticalOffset !== undefined || preferences.qrHorizontalOffset !== undefined) {
        // Convert old vertical offset (percentage from bottom) to new Y position
        if (preferences.qrVerticalOffset !== undefined) {
          preferences.qrYPosition = preferences.qrVerticalOffset;
          delete preferences.qrVerticalOffset;
        }
        
        // Convert old horizontal offset (percentage from center) to new X position
        if (preferences.qrHorizontalOffset !== undefined) {
          // Old: -50 to 50 (center-based), New: 0-100 (absolute)
          preferences.qrXPosition = 50 + preferences.qrHorizontalOffset;
          delete preferences.qrHorizontalOffset;
        }
        
        // Save the migrated preferences
        await this.savePreferences(preferences);
      }
      
      // Ensure all required properties have valid values
      return {
        selectedGradientId: preferences.selectedGradientId || 'sunset',
        qrXPosition: preferences.qrXPosition ?? 50,
        qrYPosition: preferences.qrYPosition ?? 30,
        qrScale: preferences.qrScale ?? 1,
        showTitle: preferences.showTitle ?? true,
        qrSlotMode: preferences.qrSlotMode || 'double',
        backgroundType: preferences.backgroundType || 'gradient',
        primaryQRCodeId: preferences.primaryQRCodeId,
        secondaryQRCodeId: preferences.secondaryQRCodeId
      };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return { 
        selectedGradientId: 'sunset', 
        qrXPosition: 50,  // Default centered horizontally
        qrYPosition: 30,  // Default 30% from bottom
        qrScale: 1,
        showTitle: true,
        qrSlotMode: 'double',
        backgroundType: 'gradient'
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

  static async updateQRXPosition(xPosition: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.qrXPosition = xPosition;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR X position:', error);
      throw error;
    }
  }

  static async updateQRYPosition(yPosition: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.qrYPosition = yPosition;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR Y position:', error);
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

  static async updateQRPosition(xPosition: number, yPosition: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.qrXPosition = xPosition;
      preferences.qrYPosition = yPosition;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR position:', error);
      throw error;
    }
  }

  static async updateShowTitle(show: boolean): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.showTitle = show;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating show title:', error);
      throw error;
    }
  }

  static async updateQRSlotMode(mode: 'single' | 'double'): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.qrSlotMode = mode;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR slot mode:', error);
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

  static async getCustomBackground(): Promise<string | null> {
    try {
      const data = await AsyncStorage.getItem('@qure_custom_background');
      return data;
    } catch (error) {
      console.error('Error loading custom background:', error);
      return null;
    }
  }

  static async setCustomBackground(uri: string | null): Promise<void> {
    try {
      if (uri) {
        await AsyncStorage.setItem('@qure_custom_background', uri);
      } else {
        await AsyncStorage.removeItem('@qure_custom_background');
      }
    } catch (error) {
      console.error('Error setting custom background:', error);
      throw error;
    }
  }

  static async updateBackgroundType(type: 'gradient' | 'custom'): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.backgroundType = type;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating background type:', error);
      throw error;
    }
  }
}

