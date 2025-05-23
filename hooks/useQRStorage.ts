import { useCallback, useEffect, useState } from 'react';
import * as Storage from '../services/storage';
import { QRCode, QRCodeHistory } from '../types/qr-code';

export const useQRStorage = () => {
  const [history, setHistory] = useState<QRCodeHistory>({
    codes: [],
    primarySlot: null,
    secondarySlot: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await Storage.getQRHistory();
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load QR codes'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveQRCode = useCallback(async (qrCode: QRCode) => {
    try {
      const updatedHistory = await Storage.saveQRCode(qrCode);
      setHistory(updatedHistory);
      return updatedHistory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save QR code'));
      throw err;
    }
  }, []);

  const deleteQRCode = useCallback(async (qrCodeId: string) => {
    try {
      const updatedHistory = await Storage.deleteQRCode(qrCodeId);
      setHistory(updatedHistory);
      return updatedHistory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete QR code'));
      throw err;
    }
  }, []);

  const updateSlot = useCallback(async (slotType: 'primarySlot' | 'secondarySlot', qrCodeId: string | null) => {
    try {
      const updatedHistory = await Storage.updateSlot(slotType, qrCodeId);
      setHistory(updatedHistory);
      return updatedHistory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update ${slotType}`));
      throw err;
    }
  }, []);

  const getQRCodeById = useCallback((id: string | null) => {
    if (!id) return null;
    return history.codes.find(code => code.id === id) || null;
  }, [history.codes]);

  return {
    history,
    loading,
    error,
    loadHistory,
    saveQRCode,
    deleteQRCode,
    updateSlot,
    getQRCodeById,
    primaryQRCode: getQRCodeById(history.primarySlot),
    secondaryQRCode: getQRCodeById(history.secondarySlot),
  };
};