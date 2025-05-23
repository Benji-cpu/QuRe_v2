import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { PhoneQR } from '../../../components/qr-types/PhoneQR';
import { DEFAULT_COUNTRY_CODE } from '../../../constants/CountryCodes';
import { QRCodeType } from '../../../types/qr-code';

jest.mock('../../../components/CountryCodeSelector', () => ({
  CountryCodeSelector: ({ value, onChange }) => (
    <select
      data-testid="country-code-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="1">+1</option>
      <option value="44">+44</option>
    </select>
  ),
}));

jest.mock('../../../services/qrGenerators/phoneQR', () => ({
  createPhoneQR: jest.fn().mockImplementation((input) => ({
    id: 'test-id',
    type: 'PHONE',
    countryCode: input.countryCode,
    phoneNumber: input.phoneNumber,
    label: input.label || `+${input.countryCode}${input.phoneNumber}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    design: {},
  })),
}));

jest.mock('../../../utils/formatters', () => ({
  isValidPhone: jest.fn().mockImplementation((phone) => 
    /^\+[0-9]{6,15}$/.test(phone)
  ),
  formatPhone: jest.fn().mockImplementation((countryCode, phoneNumber) => 
    `+${countryCode}${phoneNumber}`
  ),
}));

describe('PhoneQR Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <PhoneQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    expect(getByText('Phone Number')).toBeTruthy();
    expect(getByText('QR Code Label')).toBeTruthy();
    expect(getByPlaceholderText('Phone number')).toBeTruthy();
    expect(getByTestId('country-code-selector')).toBeTruthy();
  });

  it('shows validation error for empty phone number', async () => {
    const { getByText, getByPlaceholderText } = render(
      <PhoneQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const phoneInput = getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneInput, '');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Phone number is required')).toBeTruthy();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid phone number', async () => {
    const { getByText, getByPlaceholderText } = render(
      <PhoneQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const phoneInput = getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneInput, '123'); // Too short to be valid

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid phone number')).toBeTruthy();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with valid data', async () => {
    const { getByText, getByPlaceholderText } = render(
      <PhoneQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const phoneInput = getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneInput, '5551234567');

    const labelInput = getByPlaceholderText('Enter a label for this QR code');
    fireEvent.changeText(labelInput, 'My Phone QR');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: QRCodeType.PHONE,
          countryCode: DEFAULT_COUNTRY_CODE.dialCode,
          phoneNumber: '5551234567',
          label: 'My Phone QR',
        })
      );
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <PhoneQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('initializes with provided initial data', () => {
    const initialData = {
      countryCode: '44',
      phoneNumber: '7911123456',
      label: 'UK Phone',
      type: QRCodeType.PHONE,
    };

    const { getByDisplayValue } = render(
      <PhoneQR
        initialData={initialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(getByDisplayValue('7911123456')).toBeTruthy();
    expect(getByDisplayValue('UK Phone')).toBeTruthy();
  });
});