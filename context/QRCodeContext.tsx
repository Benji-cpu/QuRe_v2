import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { useQRStorage } from '../hooks/useQRStorage';
import { QRCode, QRCodeType, QRDesignOptions } from '../types/qr-code';
import { createDefaultDesignOptions } from '../utils/qrUtils';

interface QRCodeContextProps {
  activeQRCode: QRCode | null;
  setActiveQRCode: (qrCode: QRCode | null) => void;
  qrHistory: QRCode[];
  activeDesign: QRDesignOptions;
  updateActiveDesign: (design: Partial<QRDesignOptions>) => void;
  activeQRType: QRCodeType | null;
  setActiveQRType: (type: QRCodeType | null) => void;
  saveQRCode: (qrCode: QRCode) => Promise<void>;
  deleteQRCode: (id: string) => Promise<void>;
  updateSlot: (slotType: 'primarySlot' | 'secondarySlot', qrCodeId: string | null) => Promise<void>;
  primaryQRCode: QRCode | null;
  secondaryQRCode: QRCode | null;
  loading: boolean;
  refreshHistory: () => Promise<void>;
  error: Error | null;
  resetCreation: () => void;
}

export const QRCodeContext = createContext<QRCodeContextProps>({
  activeQRCode: null,
  setActiveQRCode: () => {},
  qrHistory: [],
  activeDesign: createDefaultDesignOptions(),
  updateActiveDesign: () => {},
  activeQRType: null,
  setActiveQRType: () => {},
  saveQRCode: async () => {},
  deleteQRCode: async () => {},
  updateSlot: async () => {},
  primaryQRCode: null,
  secondaryQRCode: null,
  loading: false,
  refreshHistory: async () => {},
  error: null,
  resetCreation: () => {},
});

export const QRCodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    history,
    loading,
    error,
    loadHistory,
    saveQRCode: saveQRCodeToStorage,
    deleteQRCode: deleteQRCodeFromStorage,
    updateSlot: updateSlotInStorage,
    primaryQRCode,
    secondaryQRCode,
  } = useQRStorage();

  const [activeQRCode, setActiveQRCode] = useState<QRCode | null>(null);
  const [activeQRType, setActiveQRType] = useState<QRCodeType | null>(null);
  const [activeDesign, setActiveDesign] = useState<QRDesignOptions>(createDefaultDesignOptions());

  useEffect(() => {
    if (activeQRCode) {
      setActiveDesign(activeQRCode.design);
      setActiveQRType(activeQRCode.type);
    }
  }, [activeQRCode]);

  const updateActiveDesign = useCallback((design: Partial<QRDesignOptions>) => {
    setActiveDesign(prev => ({ ...prev, ...design }));
    
    if (activeQRCode) {
      setActiveQRCode({
        ...activeQRCode,
        design: { ...activeQRCode.design, ...design },
        updatedAt: Date.now(),
      });
    }
  }, [activeQRCode]);

  const saveQRCode = useCallback(async (qrCode: QRCode) => {
    try {
      await saveQRCodeToStorage(qrCode);
      setActiveQRCode(qrCode);
    } catch (error) {
      console.error('Error saving QR code:', error);
      throw error;
    }
  }, [saveQRCodeToStorage]);

  const deleteQRCode = useCallback(async (id: string) => {
    try {
      await deleteQRCodeFromStorage(id);
      if (activeQRCode && activeQRCode.id === id) {
        setActiveQRCode(null);
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }, [deleteQRCodeFromStorage, activeQRCode]);

  const updateSlot = useCallback(async (slotType: 'primarySlot' | 'secondarySlot', qrCodeId: string | null) => {
    try {
      await updateSlotInStorage(slotType, qrCodeId);
    } catch (error) {
      console.error(`Error updating ${slotType}:`, error);
      throw error;
    }
  }, [updateSlotInStorage]);

  const resetCreation = useCallback(() => {
    setActiveQRCode(null);
    setActiveQRType(null);
    setActiveDesign(createDefaultDesignOptions());
  }, []);

  return (
    <QRCodeContext.Provider
      value={{
        activeQRCode,
        setActiveQRCode,
        qrHistory: history.codes,
        activeDesign,
        updateActiveDesign,
        activeQRType,
        setActiveQRType,
        saveQRCode,
        deleteQRCode,
        updateSlot,
        primaryQRCode,
        secondaryQRCode,
        loading,
        refreshHistory: loadHistory,
        error,
        resetCreation,
      }}
    >
      {children}
    </QRCodeContext.Provider>
  );
};