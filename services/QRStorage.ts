// services/QRStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRCodeData, LinkData } from '../types/QRCode';
import { QRGenerator } from './QRGenerator';

const STORAGE_KEY = '@qure_qr_codes';
const INDEX_KEY = '@qure_qr_index';
export const BRAND_PLACEHOLDER_QR_ID = 'qure-brand-placeholder';
export const BRAND_PLACEHOLDER_URL = 'https://benji-cpu.github.io/qure_web/';
const BRAND_PLACEHOLDER_LABEL = 'QuRe';

export class QRStorage {
  private static async getIndex(): Promise<Record<string, QRCodeData>> {
    try {
      const data = await AsyncStorage.getItem(INDEX_KEY);
      if (data) {
        return JSON.parse(data) as Record<string, QRCodeData>;
      }
      // Build index from list for backward compatibility
      const list = await this.getAllQRCodes();
      const index: Record<string, QRCodeData> = {};
      for (const item of list) {
        index[item.id] = item;
      }
      await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
      return index;
    } catch (error) {
      console.error('Error loading QR index:', error);
      return {};
    }
  }

  private static async saveIndex(index: Record<string, QRCodeData>): Promise<void> {
    try {
      await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Error saving QR index:', error);
    }
  }

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
      const filteredCodes = existingCodes.filter(code => code.id !== qrCode.id);
      const updatedCodes = [qrCode, ...filteredCodes];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes));
      const index = await this.getIndex();
      index[qrCode.id] = qrCode;
      await this.saveIndex(index);
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
      const index = await this.getIndex();
      index[qrCode.id] = qrCode;
      await this.saveIndex(index);
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
      const index = await this.getIndex();
      if (index[id]) {
        delete index[id];
        await this.saveIndex(index);
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }

  static async getQRCodeById(id: string): Promise<QRCodeData | null> {
    try {
      const index = await this.getIndex();
      if (index[id]) {
        return index[id];
      }
      // Fallback to array scan (first-time migration edge cases)
      const codes = await this.getAllQRCodes();
      const found = codes.find(code => code.id === id) || null;
      if (found) {
        index[id] = found;
        await this.saveIndex(index);
      }
      return found;
    } catch (error) {
      console.error('Error getting QR code by ID:', error);
      return null;
    }
  }

  static async ensureBrandPlaceholder(): Promise<QRCodeData> {
    const existing = await this.getQRCodeById(BRAND_PLACEHOLDER_QR_ID);
    if (existing) {
      return existing;
    }

    const linkData: LinkData = {
      url: BRAND_PLACEHOLDER_URL,
      label: BRAND_PLACEHOLDER_LABEL,
    };

    const placeholder: QRCodeData = {
      id: BRAND_PLACEHOLDER_QR_ID,
      type: 'link',
      label: QRGenerator.generateLabel('link', linkData),
      data: linkData,
      content: QRGenerator.generateContent('link', linkData),
      createdAt: new Date().toISOString(),
    };

    await this.saveQRCode(placeholder);
    return placeholder;
  }
}