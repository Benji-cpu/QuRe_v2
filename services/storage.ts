import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRCode, QRCodeHistory } from '../types/qr-code';

const STORAGE_KEYS = {
  QR_CODES: 'qure_qr_codes',
};

const defaultHistory: QRCodeHistory = {
  codes: [],
  primarySlot: null,
  secondarySlot: null,
};

export const saveQRHistory = async (history: QRCodeHistory): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(history);
    await AsyncStorage.setItem(STORAGE_KEYS.QR_CODES, jsonValue);
  } catch (error) {
    console.error('Error saving QR codes:', error);
    throw error;
  }
};

export const getQRHistory = async (): Promise<QRCodeHistory> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.QR_CODES);
    if (jsonValue === null) {
      return defaultHistory;
    }
    return JSON.parse(jsonValue) as QRCodeHistory;
  } catch (error) {
    console.error('Error loading QR codes:', error);
    return defaultHistory;
  }
};

export const saveQRCode = async (qrCode: QRCode): Promise<QRCodeHistory> => {
  try {
    const history = await getQRHistory();
    
    const existingIndex = history.codes.findIndex(code => code.id === qrCode.id);
    
    if (existingIndex !== -1) {
      history.codes[existingIndex] = {
        ...qrCode,
        updatedAt: Date.now(),
      };
    } else {
      history.codes.unshift(qrCode);
    }
    
    await saveQRHistory(history);
    return history;
  } catch (error) {
    console.error('Error saving QR code:', error);
    throw error;
  }
};

export const deleteQRCode = async (qrCodeId: string): Promise<QRCodeHistory> => {
  try {
    const history = await getQRHistory();
    
    history.codes = history.codes.filter(code => code.id !== qrCodeId);
    
    if (history.primarySlot === qrCodeId) {
      history.primarySlot = null;
    }
    
    if (history.secondarySlot === qrCodeId) {
      history.secondarySlot = null;
    }
    
    await saveQRHistory(history);
    return history;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
};

export const updateSlot = async (
  slotType: 'primarySlot' | 'secondarySlot',
  qrCodeId: string | null
): Promise<QRCodeHistory> => {
  try {
    const history = await getQRHistory();
    
    if (qrCodeId && !history.codes.some(code => code.id === qrCodeId)) {
      throw new Error('QR code not found');
    }
    
    history[slotType] = qrCodeId;
    
    await saveQRHistory(history);
    return history;
  } catch (error) {
    console.error(`Error updating ${slotType}:`, error);
    throw error;
  }
};