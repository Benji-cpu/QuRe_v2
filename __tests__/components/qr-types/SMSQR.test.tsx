import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SMSQR } from '../../../components/qr-types/SMSQR';
import { DEFAULT_COUNTRY_CODE } from '../../../constants/CountryCodes';
import { QRCodeType, SMSQRCode } from '../../../types/qr-code';

// Mock the hook
// jest.mock('../../../hooks/useQRCodes', () => ({
//   useQRCodes: jest.fn(),
// }));

// const mockUseQRCodes = useQRCodes as jest.MockedFunction<typeof useQRCodes>;

// const mockContext: Partial<React.ContextType<typeof QRCodeContext>> = {
//   createSMSQR: jest.fn().mockImplementation((input) => ({
//     id: 'test-id',
//     type: 'SMS', // Use literal value instead of QRCodeType.SMS
//     countryCode: input.countryCode,
//     phoneNumber: input.phoneNumber,
//     message: input.message,
//     label: `SMS to +${input.countryCode}${input.phoneNumber}`,
//     createdAt: Date.now(),
//   })),
// };

jest.mock('../../../components/CountryCodeSelector', () => ({
  CountryCodeSelector: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
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

jest.mock('../../../services/qrGenerators/smsQR', () => ({
  createSMSQR: jest.fn().mockImplementation((input) => ({
    id: 'test-id',
    type: 'SMS', // Use literal value instead of QRCodeType.SMS
    countryCode: input.countryCode,
    phoneNumber: input.phoneNumber,
    message: input.message,
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

describe('SMSQR Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    expect(getByText('Phone Number')).toBeTruthy();
    expect(getByText('Message')).toBeTruthy();
    expect(getByText('QR Code Label')).toBeTruthy();
    expect(getByPlaceholderText('Phone number')).toBeTruthy();
    expect(getByPlaceholderText('SMS message content')).toBeTruthy();
    expect(getByTestId('country-code-selector')).toBeTruthy();
  });

  it('shows validation error for empty phone number', async () => {
    const { getByText, getByPlaceholderText } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
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

  it('calls onSave with valid data', async () => {
    const { getByText, getByPlaceholderText } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const phoneInput = getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneInput, '5551234567');

    const messageInput = getByPlaceholderText('SMS message content');
    fireEvent.changeText(messageInput, 'Hello from QR code!');

    const labelInput = getByPlaceholderText('Enter a label for this QR code');
    fireEvent.changeText(labelInput, 'My SMS QR');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: QRCodeType.SMS,
          countryCode: DEFAULT_COUNTRY_CODE.dialCode,
          phoneNumber: '5551234567',
          message: 'Hello from QR code!',
          label: 'My SMS QR',
        })
      );
    });
  });

  it('calls onSave without message (optional field)', async () => {
    const { getByText, getByPlaceholderText } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const phoneInput = getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneInput, '5551234567');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: QRCodeType.SMS,
          countryCode: DEFAULT_COUNTRY_CODE.dialCode,
          phoneNumber: '5551234567',
          message: undefined,
        })
      );
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <SMSQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('initializes with provided initial data', () => {
    const initialData = {
      countryCode: '44',
      phoneNumber: '7911123456',
      message: 'Hello from UK',
      label: 'UK SMS',
      type: QRCodeType.SMS,
    } as Partial<SMSQRCode>;

    const { getByDisplayValue } = render(
      <SMSQR
        initialData={initialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(getByDisplayValue('7911123456')).toBeTruthy();
    expect(getByDisplayValue('Hello from UK')).toBeTruthy();
    expect(getByDisplayValue('UK SMS')).toBeTruthy();
  });
});