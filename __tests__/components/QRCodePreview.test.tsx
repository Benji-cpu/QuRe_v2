import { render } from '@testing-library/react-native';
import React from 'react';
import { QRCodePreview } from '../../components/QRCodePreview';
import { QRCodeType } from '../../types/qr-code';
import { generateQRValue } from '../../utils/qrUtils';

jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native');
  return function MockQRCode(props) {
    return (
      <View
        testID="qrcode-svg"
        value={props.value}
        size={props.size}
        color={props.color}
        backgroundColor={props.backgroundColor}
      />
    );
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }) => (
      <View testID="linear-gradient" style={style}>
        {children}
      </View>
    ),
  };
});

jest.mock('../../utils/qrUtils', () => ({
  generateQRValue: jest.fn().mockReturnValue('test-qr-value'),
}));

describe('QRCodePreview Component', () => {
  const mockQRCode = {
    id: 'test-id',
    type: QRCodeType.TEXT,
    content: 'Test content',
    label: 'Test label',
    createdAt: Date.now(),
    updatedAt: Date.now(),
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with plain background', () => {
    const { getByTestId, queryByTestId } = render(
      <QRCodePreview qrCode={mockQRCode} />
    );
    
    expect(getByTestId('qrcode-svg')).toBeTruthy();
    expect(queryByTestId('linear-gradient')).toBeNull();
    expect(generateQRValue).toHaveBeenCalledWith(mockQRCode);
  });

  it('renders with gradient background when gradient is enabled', () => {
    const gradientQRCode = {
      ...mockQRCode,
      design: {
        ...mockQRCode.design,
        gradient: true,
      },
    };
    
    const { getByTestId } = render(
      <QRCodePreview qrCode={gradientQRCode} />
    );
    
    expect(getByTestId('linear-gradient')).toBeTruthy();
    expect(getByTestId('qrcode-svg')).toBeTruthy();
  });

  it('applies custom size when specified', () => {
    const customSize = 200;
    
    const { getByTestId } = render(
      <QRCodePreview qrCode={mockQRCode} size={customSize} />
    );
    
    const qrCode = getByTestId('qrcode-svg');
    expect(qrCode.props.size).toBe(customSize - mockQRCode.design.quietZone * 2);
  });

  it('passes correct properties to QRCode component', () => {
    const { getByTestId } = render(
      <QRCodePreview qrCode={mockQRCode} />
    );
    
    const qrCode = getByTestId('qrcode-svg');
    expect(qrCode.props.value).toBe('test-qr-value');
    expect(qrCode.props.color).toBe(mockQRCode.design.color);
    expect(qrCode.props.backgroundColor).toBe(mockQRCode.design.backgroundColor);
  });

  it('passes transparent background to QRCode when using gradient', () => {
    const gradientQRCode = {
      ...mockQRCode,
      design: {
        ...mockQRCode.design,
        gradient: true,
      },
    };
    
    const { getByTestId } = render(
      <QRCodePreview qrCode={gradientQRCode} />
    );
    
    const qrCode = getByTestId('qrcode-svg');
    expect(qrCode.props.backgroundColor).toBe('transparent');
  });

  it('applies custom style when provided', () => {
    const customStyle = { margin: 20 };
    
    const { getByTestId } = render(
      <QRCodePreview qrCode={mockQRCode} style={customStyle} />
    );
    
    const containerView = getByTestId('qrcode-svg').parent;
    expect(containerView.props.style).toContainEqual(expect.objectContaining(customStyle));
  });
});