// services/CustomDesignStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_COLORS_KEY = 'customColors';
const CUSTOM_GRADIENTS_KEY = 'customGradients';
const MAX_CUSTOM_COLORS = 5;
const MAX_CUSTOM_GRADIENTS = 5;

export interface CustomGradient {
  id: string;
  colors: [string, string];
  name?: string;
}

export class CustomDesignStorage {
  // Custom Colors
  static async getCustomColors(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_COLORS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom colors:', error);
      return [];
    }
  }

  static async saveCustomColor(color: string): Promise<boolean> {
    try {
      const existing = await this.getCustomColors();
      
      // Don't add if already exists
      if (existing.includes(color)) {
        return true;
      }

      // Add new color, keeping only last MAX_CUSTOM_COLORS
      const updated = [color, ...existing].slice(0, MAX_CUSTOM_COLORS);
      await AsyncStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving custom color:', error);
      return false;
    }
  }

  static async removeCustomColor(color: string): Promise<boolean> {
    try {
      const existing = await this.getCustomColors();
      const updated = existing.filter(c => c !== color);
      await AsyncStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error removing custom color:', error);
      return false;
    }
  }

  // Custom Gradients
  static async getCustomGradients(): Promise<CustomGradient[]> {
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_GRADIENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom gradients:', error);
      return [];
    }
  }

  static async saveCustomGradient(colors: [string, string], name?: string): Promise<boolean> {
    try {
      const existing = await this.getCustomGradients();
      
      // Don't add if exact same gradient exists
      const existingGradient = existing.find(g => 
        g.colors[0] === colors[0] && g.colors[1] === colors[1]
      );
      if (existingGradient) {
        return true;
      }

      const newGradient: CustomGradient = {
        id: Date.now().toString(),
        colors,
        name
      };

      // Add new gradient, keeping only last MAX_CUSTOM_GRADIENTS
      const updated = [newGradient, ...existing].slice(0, MAX_CUSTOM_GRADIENTS);
      await AsyncStorage.setItem(CUSTOM_GRADIENTS_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving custom gradient:', error);
      return false;
    }
  }

  static async removeCustomGradient(id: string): Promise<boolean> {
    try {
      const existing = await this.getCustomGradients();
      const updated = existing.filter(g => g.id !== id);
      await AsyncStorage.setItem(CUSTOM_GRADIENTS_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error removing custom gradient:', error);
      return false;
    }
  }

  // Utility methods
  static getMaxCustomColors(): number {
    return MAX_CUSTOM_COLORS;
  }

  static getMaxCustomGradients(): number {
    return MAX_CUSTOM_GRADIENTS;
  }
}