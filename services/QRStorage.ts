// services/QRStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRCodeData } from '../types/QRCode';

const STORAGE_KEY = '@qure_qr_codes';

export class QRStorage {
  static async getAllQRCodes(): Promise<QRCodeData[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading QR codes:', error);
      return [];
    }
  }

  static async saveQRCode(qrCode: QRCodeData): Promise<void> {
    try {
      const existingCodes = await this.getAllQRCodes();
      const updatedCodes = [qrCode, ...existingCodes];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes));
    } catch (error) {
      console.error('Error saving QR code:', error);
      throw error;
    }
  }

  static async updateQRCode(qrCode: QRCodeData): Promise<void> {
    try {
      const existingCodes = await this.getAllQRCodes();
      const updatedCodes = existingCodes.map(code => 
        code.id === qrCode.id ? qrCode : code
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes));
    } catch (error) {
      console.error('Error updating QR code:', error);
      throw error;
    }
  }

  static async deleteQRCode(id: string): Promise<void> {
    try {
      const existingCodes = await this.getAllQRCodes();
      const updatedCodes = existingCodes.filter(code => code.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes));
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }

  static async getQRCodeById(id: string): Promise<QRCodeData | null> {
    try {
      const codes = await this.getAllQRCodes();
      return codes.find(code => code.id === id) || null;
    } catch (error) {
      console.error('Error getting QR code by ID:', error);
      return null;
    }
  }
}