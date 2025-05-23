import { act, renderHook } from '@testing-library/react-hooks';
import { useQRStorage } from '../../../hooks/useQRStorage';
import * as Storage from '../../../services/storage';
import { QRCodeType } from '../../../types/qr-code';

jest.mock('../../../services/storage', () => ({
  getQRHistory: jest.fn(),
  saveQRCode: jest.fn(),
  deleteQRCode: jest.fn(),
  updateSlot: jest.fn(),
}));

describe('useQRStorage Hook', () => {
  const mockQRCode = {
    id: 'test-id',
    type: QRCodeType.TEXT,
    content: 'Test content',
    label: 'Test QR',
    createdAt: Date.now() - 3600000, // 1 hour ago
    updatedAt: Date.now() - 300000, // 5 minutes ago
    design: {
      color: '#000000',
      backgroundColor: '#FFFFFF',
      gradient: false,
      gradientStartColor: '#FF0000',
      gradientEndColor: '#0000FF',
      errorCorrectionLevel: 'M',
      quietZone: 4,
    },
  };

  const mockQRHistory = {
    codes: [mockQRCode],
    primarySlot: 'test-id',
    secondarySlot: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Storage.getQRHistory as jest.Mock).mockResolvedValue(mockQRHistory);
    (Storage.saveQRCode as jest.Mock).mockResolvedValue(mockQRHistory);
    (Storage.deleteQRCode as jest.Mock).mockResolvedValue(mockQRHistory);
    (Storage.updateSlot as jest.Mock).mockResolvedValue(mockQRHistory);
  });

  it('should load QR history on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    // Initial state
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.history).toEqual(mockQRHistory);
    expect(Storage.getQRHistory).toHaveBeenCalled();
  });

  it('should handle saveQRCode', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    const newQRCode = {
      ...mockQRCode,
      id: 'new-id',
      content: 'New content',
    };
    
    await act(async () => {
      await result.current.saveQRCode(newQRCode);
    });
    
    expect(Storage.saveQRCode).toHaveBeenCalledWith(newQRCode);
    expect(result.current.history).toEqual(mockQRHistory);
  });

  it('should handle deleteQRCode', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.deleteQRCode('test-id');
    });
    
    expect(Storage.deleteQRCode).toHaveBeenCalledWith('test-id');
    expect(result.current.history).toEqual(mockQRHistory);
  });

  it('should handle updateSlot', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.updateSlot('primarySlot', 'new-id');
    });
    
    expect(Storage.updateSlot).toHaveBeenCalledWith('primarySlot', 'new-id');
    expect(result.current.history).toEqual(mockQRHistory);
  });

  it('should provide QR code by ID', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    const qrCode = result.current.getQRCodeById('test-id');
    expect(qrCode).toEqual(mockQRCode);
    
    const nonExistentQRCode = result.current.getQRCodeById('non-existent');
    expect(nonExistentQRCode).toBeNull();
  });

  it('should provide primary and secondary QR codes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    expect(result.current.primaryQRCode).toEqual(mockQRCode);
    expect(result.current.secondaryQRCode).toBeNull();
  });

  it('should handle errors while loading history', async () => {
    (Storage.getQRHistory as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to load QR codes');
  });

  it('should handle errors in saveQRCode', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    (Storage.saveQRCode as jest.Mock).mockRejectedValue(new Error('Failed to save'));
    
    await expect(result.current.saveQRCode(mockQRCode)).rejects.toThrow('Failed to save');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to save QR code');
  });

  it('should handle errors in deleteQRCode', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    (Storage.deleteQRCode as jest.Mock).mockRejectedValue(new Error('Failed to delete'));
    
    await expect(result.current.deleteQRCode('test-id')).rejects.toThrow('Failed to delete');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to delete QR code');
  });

  it('should handle errors in updateSlot', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    (Storage.updateSlot as jest.Mock).mockRejectedValue(new Error('Failed to update slot'));
    
    await expect(result.current.updateSlot('primarySlot', 'test-id')).rejects.toThrow('Failed to update slot');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to update primarySlot');
  });

  it('should reload history when loadHistory is called', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useQRStorage());
    
    await waitForNextUpdate();
    
    // Clear mock calls
    (Storage.getQRHistory as jest.Mock).mockClear();
    
    await act(async () => {
      await result.current.loadHistory();
    });
    
    expect(Storage.getQRHistory).toHaveBeenCalled();
  });
});