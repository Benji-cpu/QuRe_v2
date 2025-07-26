import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@qure_theme_preference';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Action colors
  primary: string;
  primaryText: string;
  
  // Status colors
  error: string;
  success: string;
  warning: string;
  
  // Special colors
  overlay: string;
  modalBackground: string;
  cardBackground: string;
  inputBackground: string;
  
  // Component specific
  tabBarBackground: string;
  tabBarBorder: string;
  switchTrackOff: string;
  switchTrackOn: string;
}

export const lightTheme: ThemeColors = {
  // Background colors
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceVariant: '#f0f0f0',
  
  // Text colors
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Border colors
  border: '#eeeeee',
  borderLight: '#f0f0f0',
  
  // Action colors
  primary: '#2196f3',
  primaryText: '#ffffff',
  
  // Status colors
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: '#ffffff',
  cardBackground: '#ffffff',
  inputBackground: '#f5f5f5',
  
  // Component specific
  tabBarBackground: '#ffffff',
  tabBarBorder: '#eeeeee',
  switchTrackOff: '#dddddd',
  switchTrackOn: '#2196f3',
};

export const darkTheme: ThemeColors = {
  // Background colors
  background: '#121212',
  surface: '#1e1e1e',
  surfaceVariant: '#2a2a2a',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  textTertiary: '#808080',
  
  // Border colors
  border: '#333333',
  borderLight: '#2a2a2a',
  
  // Action colors
  primary: '#4dabf7',
  primaryText: '#000000',
  
  // Status colors
  error: '#ff6b6b',
  success: '#51cf66',
  warning: '#ffd43b',
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: '#1e1e1e',
  cardBackground: '#2a2a2a',
  inputBackground: '#333333',
  
  // Component specific
  tabBarBackground: '#1e1e1e',
  tabBarBorder: '#333333',
  switchTrackOff: '#555555',
  switchTrackOn: '#4dabf7',
};

export class ThemeService {
  static async getThemeMode(): Promise<ThemeMode> {
    try {
      const mode = await AsyncStorage.getItem(THEME_KEY);
      return (mode as ThemeMode) || 'dark'; // Default to dark mode
    } catch (error) {
      console.error('Error loading theme mode:', error);
      return 'dark';
    }
  }

  static async setThemeMode(mode: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
      throw error;
    }
  }

  static getThemeColors(mode: ThemeMode): ThemeColors {
    return mode === 'dark' ? darkTheme : lightTheme;
  }
} 