import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SMSQR } from './components/qr-types/SMSQR';
import { QRCodeType } from './types/qr-code';

describe('SMSQR Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    expect(getByText('Phone Number')).toBeTruthy();
  });

  it('handles save with valid data', () => {
    const { getByText, getByPlaceholderText } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    
    const phoneInput = getByPlaceholderText('Phone number');
    const messageInput = getByPlaceholderText('SMS message content');
    const saveButton = getByText('Save');

    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(messageInput, 'Test message');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      type: QRCodeType.SMS,
      phoneNumber: '1234567890',
      message: 'Test message',
    }));
  });

  it('handles cancel', () => {
    const { getByText } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates phone number', () => {
    const { getByText, getByPlaceholderText } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    
    const phoneInput = getByPlaceholderText('Phone number');
    const saveButton = getByText('Save');

    fireEvent.changeText(phoneInput, 'invalid');
    fireEvent.press(saveButton);

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(getByText('Please enter a valid phone number')).toBeTruthy();
  });
}); 