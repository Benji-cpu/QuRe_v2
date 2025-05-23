import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { QRCodeCard } from '../../components/QRCodeCard';
import { QRCodeType } from '../../types/qr-code';

jest.mock('../../components/QRCodePreview', () => ({
  QRCodePreview: ({ qrCode, size }) => (
    <div data-testid="qrcode-preview" size={size}>
      {qrCode ? `QR Code: ${qrCode.label}` : 'No QR Code'}
    </div>
  ),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: ({ name, size, color }) => (
    <div data-testid={`icon-${name}`} size={size} color={color} />
  ),
}));

jest.mock('../../utils/dateUtils', () => ({
  formatRelativeTime: jest.fn().mockReturnValue('5 minutes ago'),
}));

describe('QRCodeCard Component', () => {
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

  const mockHandlers = {
    onPress: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with QR code data', () => {
    const { getByText, getByTestId } = render(
      <QRCodeCard qrCode={mockQRCode} />
    );
    
    expect(getByTestId('qrcode-preview')).toBeTruthy();
    expect(getByText('Test QR')).toBeTruthy();
    expect(getByText('5 minutes ago')).toBeTruthy();
  });

  it('renders empty state when qrCode is null', () => {
    const { getByText, getByTestId } = render(
      <QRCodeCard qrCode={null} />
    );
    
    expect(getByText('Add QR Code')).toBeTruthy();
    expect(getByTestId('icon-plus')).toBeTruthy();
  });

  it('renders placeholder content when provided', () => {
    const placeholderContent = <div data-testid="custom-placeholder">Custom Placeholder</div>;
    
    const { getByTestId, queryByText } = render(
      <QRCodeCard qrCode={null} placeholder={placeholderContent} />
    );
    
    expect(getByTestId('custom-placeholder')).toBeTruthy();
    expect(queryByText('Add QR Code')).toBeNull();
  });

  it('calls onPress when card is pressed', () => {
    const { getByTestId } = render(
      <QRCodeCard qrCode={mockQRCode} onPress={mockHandlers.onPress} />
    );
    
    const touchableArea = getByTestId('qrcode-preview').parent;
    fireEvent.press(touchableArea);
    
    expect(mockHandlers.onPress).toHaveBeenCalled();
  });

  it('calls onEdit when edit button is pressed', () => {
    const { getByTestId } = render(
      <QRCodeCard qrCode={mockQRCode} onEdit={mockHandlers.onEdit} />
    );
    
    const editButton = getByTestId('icon-edit-2').parent;
    fireEvent.press(editButton);
    
    expect(mockHandlers.onEdit).toHaveBeenCalled();
  });

  it('does not show info section when showInfo is false', () => {
    const { queryByText } = render(
      <QRCodeCard qrCode={mockQRCode} showInfo={false} />
    );
    
    expect(queryByText('Test QR')).toBeNull();
    expect(queryByText('5 minutes ago')).toBeNull();
  });

  it('applies different sizes based on size prop', () => {
    const { rerender, getByTestId } = render(
      <QRCodeCard qrCode={mockQRCode} size="small" />
    );
    
    let qrPreview = getByTestId('qrcode-preview');
    expect(qrPreview.props.size).toBeLessThan(200); // Small size
    
    rerender(<QRCodeCard qrCode={mockQRCode} size="large" />);
    
    qrPreview = getByTestId('qrcode-preview');
    expect(qrPreview.props.size).toBeGreaterThan(200); // Large size
  });

  it('applies custom style when provided', () => {
    const customStyle = { margin: 20 };
    
    const { getByTestId } = render(
      <QRCodeCard qrCode={mockQRCode} style={customStyle} />
    );
    
    const container = getByTestId('qrcode-preview').parent.parent;
    expect(container.props.style).toContainEqual(expect.objectContaining(customStyle));
  });
});