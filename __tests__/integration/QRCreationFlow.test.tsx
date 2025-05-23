import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import CreateQRModal from '../../app/modal/create-qr';
import { PremiumContext } from '../../context/PremiumContext';
import { QRCodeContext } from '../../context/QRCodeContext';
import { QRCodeType } from '../../types/qr-code';

// Mock the router from expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
  },
}));

// Mock components
jest.mock('../../components/QRCodePreview', () => ({
  QRCodePreview: ({ qrCode }) => (
    <div data-testid="qr-preview">
      {qrCode ? `Preview: ${qrCode.type}` : 'No QR Code'}
    </div>
  ),
}));

jest.mock('../../components/qr-types/TextQR', () => ({
  TextQR: ({ onSave, onCancel }) => (
    <div data-testid="text-qr-form">
      <input data-testid="text-input" placeholder="Enter text" />
      <button data-testid="save-button" onClick={() => onSave({
        id: 'new-id',
        type: 'TEXT',
        content: 'Test content',
        label: 'Test label',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        design: {},
      })}>Save</button>
      <button data-testid="cancel-button" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock('../../components/design/ColorPicker', () => ({
  ColorPicker: ({ label, value, onChange }) => (
    <div data-testid={`color-picker-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      <input 
        data-testid={`color-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  ),
}));

jest.mock('../../components/design/GradientSelector', () => ({
  GradientSelector: ({ enabled, onToggle, startColor, endColor, onStartColorChange, onEndColorChange }) => (
    <div data-testid="gradient-selector">
      <input 
        type="checkbox" 
        data-testid="gradient-toggle" 
        checked={enabled} 
        onChange={() => onToggle(!enabled)} 
      />
      {enabled && (
        <>
          <input 
            data-testid="start-color" 
            value={startColor} 
            onChange={(e) => onStartColorChange(e.target.value)} 
          />
          <input 
            data-testid="end-color" 
            value={endColor} 
            onChange={(e) => onEndColorChange(e.target.value)} 
          />
        </>
      )}
    </div>
  ),
}));

jest.mock('../../components/design/AdvancedOptions', () => ({
  AdvancedOptions: ({ errorCorrectionLevel, onErrorCorrectionChange, quietZone, onQuietZoneChange }) => (
    <div data-testid="advanced-options">
      <select 
        data-testid="error-correction" 
        value={errorCorrectionLevel} 
        onChange={(e) => onErrorCorrectionChange(e.target.value)}
      >
        <option value="L">Low</option>
        <option value="M">Medium</option>
        <option value="Q">Quality</option>
        <option value="H">High</option>
      </select>
      <input 
        type="range" 
        data-testid="quiet-zone" 
        value={quietZone} 
        onChange={(e) => onQuietZoneChange(parseInt(e.target.value))} 
      />
    </div>
  ),
}));

describe('QR Creation Flow Integration Test', () => {
  const mockQRCodeContext = {
    activeQRCode: null,
    setActiveQRCode: jest.fn(),
    qrHistory: [],
    activeDesign: {
      color: '#000000',
      backgroundColor: '#FFFFFF',
      gradient: false,
      gradientStartColor: '#FF0000',
      gradientEndColor: '#0000FF',
      errorCorrectionLevel: 'M',
      quietZone: 4,
    },
    updateActiveDesign: jest.fn(),
    activeQRType: null,
    setActiveQRType: jest.fn(),
    saveQRCode: jest.fn().mockResolvedValue({}),
    deleteQRCode: jest.fn(),
    updateSlot: jest.fn(),
    primaryQRCode: null,
    secondaryQRCode: null,
    loading: false,
    refreshHistory: jest.fn(),
    error: null,
    resetCreation: jest.fn(),
  };

  const mockPremiumContext = {
    isPremium: false,
    expiryDate: null,
    loading: false,
    setPremiumStatus: jest.fn(),
    checkFeatureAccess: jest.fn().mockResolvedValue(false),
    refreshStatus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (ui) => {
    return render(
      <NavigationContainer>
        <QRCodeContext.Provider value={mockQRCodeContext}>
          <PremiumContext.Provider value={mockPremiumContext}>
            {ui}
          </PremiumContext.Provider>
        </QRCodeContext.Provider>
      </NavigationContainer>
    );
  };

  it('should show empty state when no QR type is selected', () => {
    const { getByText } = renderWithProviders(<CreateQRModal />);
    
    expect(getByText('Select a QR code type to get started')).toBeTruthy();
  });

  it('should switch to design tab and back', () => {
    const { getByText } = renderWithProviders(<CreateQRModal />);
    
    // Switch to Design tab
    fireEvent.press(getByText('Design'));
    
    // Should show design components
    expect(getByText('Advanced Options')).toBeTruthy();
    
    // Switch back to Content tab
    fireEvent.press(getByText('Content'));
    
    // Should show content tab message
    expect(getByText('Select a QR code type to get started')).toBeTruthy();
  });

  it('should show TextQR form when TEXT type is selected', () => {
    // Set active QR type to TEXT
    const contextWithType = {
      ...mockQRCodeContext,
      activeQRType: QRCodeType.TEXT,
    };
    
    const { getByTestId } = render(
      <NavigationContainer>
        <QRCodeContext.Provider value={contextWithType}>
          <PremiumContext.Provider value={mockPremiumContext}>
            <CreateQRModal />
          </PremiumContext.Provider>
        </QRCodeContext.Provider>
      </NavigationContainer>
    );
    
    expect(getByTestId('text-qr-form')).toBeTruthy();
  });

  it('should update design settings when modified', async () => {
    // Set active QR type to TEXT
    const contextWithType = {
      ...mockQRCodeContext,
      activeQRType: QRCodeType.TEXT,
    };
    
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <QRCodeContext.Provider value={contextWithType}>
          <PremiumContext.Provider value={mockPremiumContext}>
            <CreateQRModal />
          </PremiumContext.Provider>
        </QRCodeContext.Provider>
      </NavigationContainer>
    );
    
    // Switch to Design tab
    fireEvent.press(getByText('Design'));
    
    // Change QR color
    const qrColorInput = getByTestId('color-input-qr-code-color');
    fireEvent.changeText(qrColorInput, '#FF0000');
    
    // Enable gradient
    const gradientToggle = getByTestId('gradient-toggle');
    fireEvent.press(gradientToggle);
    
    // Change start color
    const startColorInput = getByTestId('start-color');
    fireEvent.changeText(startColorInput, '#00FF00');
    
    // Change error correction level
    const errorCorrectionSelect = getByTestId('error-correction');
    fireEvent.change(errorCorrectionSelect, { target: { value: 'H' } });
    
    await waitFor(() => {
      expect(mockQRCodeContext.updateActiveDesign).toHaveBeenCalledWith({ color: '#FF0000' });
      expect(mockQRCodeContext.updateActiveDesign).toHaveBeenCalledWith({ gradient: true });
      expect(mockQRCodeContext.updateActiveDesign).toHaveBeenCalledWith({ gradientStartColor: '#00FF00' });
      expect(mockQRCodeContext.updateActiveDesign).toHaveBeenCalledWith({ errorCorrectionLevel: 'H' });
    });
  });

  it('should save QR code when form is submitted', async () => {
    // Set active QR type to TEXT
    const contextWithType = {
      ...mockQRCodeContext,
      activeQRType: QRCodeType.TEXT,
    };
    
    const { getByTestId } = render(
      <NavigationContainer>
        <QRCodeContext.Provider value={contextWithType}>
          <PremiumContext.Provider value={mockPremiumContext}>
            <CreateQRModal />
          </PremiumContext.Provider>
        </QRCodeContext.Provider>
      </NavigationContainer>
    );
    
    // Fill in text form and save
    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockQRCodeContext.saveQRCode).toHaveBeenCalled();
    });
  });
});