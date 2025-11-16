import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_QR_SCALE,
  DEFAULT_QR_X_POSITION,
  DEFAULT_QR_Y_POSITION,
} from '../constants/qrPlacement';
import {
  MIN_DOUBLE_QR_SCALE,
  MIN_SINGLE_QR_SCALE,
} from '../constants/qrPlacement';

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
  showShareButton?: boolean;
}


export class UserPreferencesService {
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (__DEV__) console.log('🔍 Raw AsyncStorage data:', data);
      
      const defaultPreferences = { 
        selectedGradientId: 'sunset', 
        qrXPosition: DEFAULT_QR_X_POSITION,
        qrYPosition: DEFAULT_QR_Y_POSITION,
        qrScale: DEFAULT_QR_SCALE,
        showTitle: true,
        qrSlotMode: 'double',
        backgroundType: 'gradient',
        showShareButton: false
      };
      
      const preferences = data ? { ...defaultPreferences, ...JSON.parse(data) } : defaultPreferences;
      if (__DEV__) console.log('🔍 Final preferences with Y position:', preferences.qrYPosition);
      
      
      // Migrate old coordinate system to new simple system
      if (preferences.qrVerticalOffset !== undefined || preferences.qrHorizontalOffset !== undefined) {
        if (__DEV__) {
          console.log('🔄 Migrating old coordinate system:', {
            oldVertical: preferences.qrVerticalOffset,
            oldHorizontal: preferences.qrHorizontalOffset
          });
        }
        
        // Convert old vertical offset (percentage from bottom) to new Y position
        if (preferences.qrVerticalOffset !== undefined) {
          // OLD: 0-100 percentage from bottom (0=bottom, 100=top)
          // NEW: 0-100 Y position (0=bottom, 100=top)
          // The coordinate systems are actually the same!
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
      
      // Ensure Y position is valid
      if (typeof preferences.qrYPosition !== 'number' || isNaN(preferences.qrYPosition)) {
        if (__DEV__) console.log('⚠️ Invalid Y position detected, using default');
        preferences.qrYPosition = DEFAULT_QR_Y_POSITION;
      }

      return preferences;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return { 
        selectedGradientId: 'sunset', 
        qrXPosition: DEFAULT_QR_X_POSITION,
        qrYPosition: DEFAULT_QR_Y_POSITION,
        qrScale: DEFAULT_QR_SCALE,
        showTitle: true,
        qrSlotMode: 'double',
        backgroundType: 'gradient',
        showShareButton: false
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
      // Validate and clamp position to 0-100 range
      // Ensure the value is a valid number
      const validPosition = typeof xPosition === 'number' && !isNaN(xPosition) ? xPosition : DEFAULT_QR_X_POSITION;
      preferences.qrXPosition = Math.max(0, Math.min(100, validPosition));
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR X position:', error);
      throw error;
    }
  }

  static async updateQRYPosition(yPosition: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      // Validate and clamp position to 0-100 range
      // Ensure the value is a valid number
      const validPosition = typeof yPosition === 'number' && !isNaN(yPosition) ? yPosition : DEFAULT_QR_Y_POSITION;
      preferences.qrYPosition = Math.max(0, Math.min(100, validPosition));
      
      
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR Y position:', error);
      throw error;
    }
  }

  static async updateQRScale(scale: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      const mode = preferences.qrSlotMode || 'double';
      const minScale = mode === 'single' ? MIN_SINGLE_QR_SCALE : MIN_DOUBLE_QR_SCALE;
      const clamped = Math.max(minScale, Math.min(2, scale));
      preferences.qrScale = clamped;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating QR scale:', error);
      throw error;
    }
  }

  static async updateQRPosition(xPosition: number, yPosition: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      // Validate and clamp positions to 0-100 range
      preferences.qrXPosition = Math.max(0, Math.min(100, xPosition));
      preferences.qrYPosition = Math.max(0, Math.min(100, yPosition));
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

  static async updateShowShareButton(show: boolean): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences.showShareButton = show;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating share button visibility:', error);
      throw error;
    }
  }
}

