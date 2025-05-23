import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    deleteQRCode,
    getQRHistory,
    saveQRCode,
    saveQRHistory,
    updateSlot
} from '../../../services/storage';
import { QRCodeType } from '../../../types/qr-code';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveQRHistory', () => {
    it('should save QR history to AsyncStorage', async () => {
      const mockHistory = {
        codes: [
          {
            id: '1',
            type: QRCodeType.TEXT,
            content: 'Test',
            label: 'Test',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            design: {},
          },
        ],
        primarySlot: '1',
        secondarySlot: null,
      };

      await saveQRHistory(mockHistory);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'qure_qr_codes',
        JSON.stringify(mockHistory)
      );
    });

    it('should throw error if AsyncStorage fails', async () => {
      const mockError = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(saveQRHistory({ codes: [], primarySlot: null, secondarySlot: null }))
        .rejects.toThrow(mockError);
    });
  });

  describe('getQRHistory', () => {
    it('should retrieve QR history from AsyncStorage', async () => {
      const mockHistory = {
        codes: [
          {
            id: '1',
            type: QRCodeType.TEXT,
            content: 'Test',
            label: 'Test',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            design: {},
          },
        ],
        primarySlot: '1',
        secondarySlot: null,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockHistory));

      const result = await getQRHistory();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('qure_qr_codes');
      expect(result).toEqual(mockHistory);
    });

    it('should return default history if no data in AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getQRHistory();

      expect(result).toEqual({
        codes: [],
        primarySlot: null,
        secondarySlot: null,
      });
    });

    it('should return default history if AsyncStorage throws error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await getQRHistory();

      expect(result).toEqual({
        codes: [],
        primarySlot: null,
        secondarySlot: null,
      });
    });
  });

  describe('saveQRCode', () => {
    it('should add new QR code to history', async () => {
      const existingHistory = {
        codes: [],
        primarySlot: null,
        secondarySlot: null,
      };

      const newQRCode = {
        id: '1',
        type: QRCodeType.TEXT,
        content: 'Test',
        label: 'Test',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        design: {},
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingHistory));

      await saveQRCode(newQRCode);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'qure_qr_codes',
        expect.stringContaining('"id":"1"')
      );
    });

    it('should update existing QR code in history', async () => {
      const existingQRCode = {
        id: '1',
        type: QRCodeType.TEXT,
        content: 'Original',
        label: 'Original',
        createdAt: 1000,
        updatedAt: 1000,
        design: {},
      };

      const existingHistory = {
        codes: [existingQRCode],
        primarySlot: '1',
        secondarySlot: null,
      };

      const updatedQRCode = {
        ...existingQRCode,
        content: 'Updated',
        label: 'Updated',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingHistory));

      await saveQRCode(updatedQRCode);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'qure_qr_codes',
        expect.stringContaining('"content":"Updated"')
      );
    });
  });

  describe('deleteQRCode', () => {
    it('should remove QR code from history', async () => {
      const qrCode1 = {
        id: '1',
        type: QRCodeType.TEXT,
        content: 'Test 1',
        label: 'Test 1',
        createdAt: 1000,
        updatedAt: 1000,
        design: {},
      };

      const qrCode2 = {
        id: '2',
        type: QRCodeType.TEXT,
        content: 'Test 2',
        label: 'Test 2',
        createdAt: 2000,
        updatedAt: 2000,
        design: {},
      };

      const existingHistory = {
        codes: [qrCode1, qrCode2],
        primarySlot: '1',
        secondarySlot: '2',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingHistory));

      await deleteQRCode('1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'qure_qr_codes',
        expect.stringContaining('"id":"2"')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'qure_qr_codes',
        expect.not.stringContaining('"id":"1"')
      );
    });

    it('should update slots if deleted QR code is in a slot', async () => {
      const qrCode = {
        id: '1',
        type: QRCodeType.TEXT,
        content: 'Test',
        label: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        design: {},
      };

      const existingHistory = {
        codes: [qrCode],
        primarySlot: '1',
        secondarySlot: null,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingHistory));

      await deleteQRCode('1');

      const updatedHistory = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(updatedHistory.primarySlot).toBeNull();
    });
  });

  describe('updateSlot', () => {
    it('should update primary slot', async () => {
      const qrCode = {
        id: '1',
        type: QRCodeType.TEXT,
        content: 'Test',
        label: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        design: {},
      };

      const existingHistory = {
        codes: [qrCode],
        primarySlot: null,
        secondarySlot: null,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingHistory));

      await updateSlot('primarySlot', '1');

      const updatedHistory = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(updatedHistory.primarySlot).toBe('1');
    });

    it('should update secondary slot', async () => {
      const qrCode = {
        id: '1',
        type: QRCodeType.TEXT,
        content: 'Test',
        label: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        design: {},
      };

      const existingHistory = {
        codes: [qrCode],
        primarySlot: null,
        secondarySlot: null,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingHistory));

      await updateSlot('secondarySlot', '1');

      const updatedHistory = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(updatedHistory.secondarySlot).toBe('1');
    });

    it('should clear slot when null is passed', async () => {
      const qrCode = {
        id: '1',
        type: QRCodeType.TEXT,
        content: 'Test',
        label: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        design: {},
      };

      const existingHistory = {
        codes: [qrCode],
        primarySlot: '1',
        secondarySlot: null,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingHistory));

      await updateSlot('primarySlot', null);

      const updatedHistory = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(updatedHistory.primarySlot).toBeNull();
    });

    it('should throw error if QR code ID is not found', async () => {
      const existingHistory = {
        codes: [],
        primarySlot: null,
        secondarySlot: null,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingHistory));

      await expect(updateSlot('primarySlot', 'nonexistent'))
        .rejects.toThrow('QR code not found');
    });
  });
});