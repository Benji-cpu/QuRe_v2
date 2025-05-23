import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { EmailQR } from '../../../components/qr-types/EmailQR';
import { QRCodeType } from '../../../types/qr-code';

jest.mock('../../../services/qrGenerators/emailQR', () => ({
  createEmailQR: jest.fn().mockImplementation((input) => ({
    id: 'test-id',
    type: 'EMAIL',
    email: input.email,
    subject: input.subject,
    body: input.body,
    label: input.label || input.email,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    design: {},
  })),
}));

describe('EmailQR Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <EmailQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    expect(getByText('Email Address')).toBeTruthy();
    expect(getByText('Subject')).toBeTruthy();
    expect(getByText('Message Body')).toBeTruthy();
    expect(getByText('QR Code Label')).toBeTruthy();
    expect(getByPlaceholderText('example@email.com')).toBeTruthy();
  });

  it('shows validation error for invalid email', async () => {
    const { getByText, getByPlaceholderText } = render(
      <EmailQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const emailInput = getByPlaceholderText('example@email.com');
    fireEvent.changeText(emailInput, 'invalid-email');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows validation error for empty email', async () => {
    const { getByText, getByPlaceholderText } = render(
      <EmailQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const emailInput = getByPlaceholderText('example@email.com');
    fireEvent.changeText(emailInput, '');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Email address is required')).toBeTruthy();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with valid data', async () => {
    const { getByText, getByPlaceholderText } = render(
      <EmailQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const emailInput = getByPlaceholderText('example@email.com');
    fireEvent.changeText(emailInput, 'test@example.com');

    const subjectInput = getByPlaceholderText('Email subject');
    fireEvent.changeText(subjectInput, 'Test Subject');

    const bodyInput = getByPlaceholderText('Email content');
    fireEvent.changeText(bodyInput, 'Test body content');

    const labelInput = getByPlaceholderText('Enter a label for this QR code');
    fireEvent.changeText(labelInput, 'My Email QR');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: QRCodeType.EMAIL,
          email: 'test@example.com',
          subject: 'Test Subject',
          body: 'Test body content',
          label: 'My Email QR',
        })
      );
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <EmailQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('initializes with provided initial data', () => {
    const initialData = {
      email: 'initial@example.com',
      subject: 'Initial Subject',
      body: 'Initial body',
      label: 'Initial Label',
      type: QRCodeType.EMAIL,
    };

    const { getByDisplayValue } = render(
      <EmailQR
        initialData={initialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(getByDisplayValue('initial@example.com')).toBeTruthy();
    expect(getByDisplayValue('Initial Subject')).toBeTruthy();
    expect(getByDisplayValue('Initial body')).toBeTruthy();
    expect(getByDisplayValue('Initial Label')).toBeTruthy();
  });
});