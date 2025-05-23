import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { VCardQR } from '../../../components/qr-types/VCardQR';
import { QRCodeType } from '../../../types/qr-code';

jest.mock('../../../services/qrGenerators/vCardQR', () => ({
  createVCardQR: jest.fn().mockImplementation((input) => ({
    id: 'test-id',
    type: 'VCARD',
    firstName: input.firstName,
    lastName: input.lastName,
    phoneNumber: input.phoneNumber,
    mobileNumber: input.mobileNumber,
    email: input.email,
    website: input.website,
    company: input.company,
    jobTitle: input.jobTitle,
    fax: input.fax,
    address: input.address,
    city: input.city,
    postCode: input.postCode,
    country: input.country,
    label: input.label || `${input.firstName} ${input.lastName}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    design: {},
  })),
}));

jest.mock('../../../utils/validators', () => ({
  isValidEmail: jest.fn().mockImplementation((email) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ),
}));

describe('VCardQR Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <VCardQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    expect(getByText('First Name')).toBeTruthy();
    expect(getByText('Last Name')).toBeTruthy();
    expect(getByText('Phone Number')).toBeTruthy();
    expect(getByText('Mobile Number')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Website')).toBeTruthy();
    expect(getByText('Company')).toBeTruthy();
    expect(getByText('Job Title')).toBeTruthy();
    expect(getByText('Fax')).toBeTruthy();
    expect(getByText('Address')).toBeTruthy();
    expect(getByText('City')).toBeTruthy();
    expect(getByText('Post Code')).toBeTruthy();
    expect(getByText('Country')).toBeTruthy();
    expect(getByText('QR Code Label')).toBeTruthy();
  });

  it('shows validation error for empty required fields', async () => {
    const { getByText } = render(
      <VCardQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('First name is required')).toBeTruthy();
      expect(getByText('Last name is required')).toBeTruthy();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    const { getByText, getByPlaceholderText } = render(
      <VCardQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const firstNameInput = getByPlaceholderText('First name');
    fireEvent.changeText(firstNameInput, 'John');

    const lastNameInput = getByPlaceholderText('Last name');
    fireEvent.changeText(lastNameInput, 'Doe');

    const emailInput = getByPlaceholderText('Email address');
    fireEvent.changeText(emailInput, 'invalid-email');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with all fields filled', async () => {
    const { getByText, getByPlaceholderText } = render(
      <VCardQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const firstNameInput = getByPlaceholderText('First name');
    fireEvent.changeText(firstNameInput, 'John');

    const lastNameInput = getByPlaceholderText('Last name');
    fireEvent.changeText(lastNameInput, 'Doe');

    const phoneInput = getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneInput, '1234567890');

    const mobileInput = getByPlaceholderText('Mobile number');
    fireEvent.changeText(mobileInput, '9876543210');

    const emailInput = getByPlaceholderText('Email address');
    fireEvent.changeText(emailInput, 'john.doe@example.com');

    const websiteInput = getByPlaceholderText('Website URL');
    fireEvent.changeText(websiteInput, 'https://example.com');

    const companyInput = getByPlaceholderText('Company name');
    fireEvent.changeText(companyInput, 'Example Corp');

    const jobTitleInput = getByPlaceholderText('Job title');
    fireEvent.changeText(jobTitleInput, 'Software Engineer');

    const faxInput = getByPlaceholderText('Fax number');
    fireEvent.changeText(faxInput, '1112223333');

    const addressInput = getByPlaceholderText('Street address');
    fireEvent.changeText(addressInput, '123 Main St');

    const cityInput = getByPlaceholderText('City');
    fireEvent.changeText(cityInput, 'Anytown');

    const postCodeInput = getByPlaceholderText('Post code / ZIP');
    fireEvent.changeText(postCodeInput, '12345');

    const countryInput = getByPlaceholderText('Country');
    fireEvent.changeText(countryInput, 'USA');

    const labelInput = getByPlaceholderText('Enter a label for this QR code');
    fireEvent.changeText(labelInput, 'John Doe Contact');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: QRCodeType.VCARD,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
          mobileNumber: '9876543210',
          email: 'john.doe@example.com',
          website: 'https://example.com',
          company: 'Example Corp',
          jobTitle: 'Software Engineer',
          fax: '1112223333',
          address: '123 Main St',
          city: 'Anytown',
          postCode: '12345',
          country: 'USA',
          label: 'John Doe Contact',
        })
      );
    });
  });

  it('calls onSave with only required fields filled', async () => {
    const { getByText, getByPlaceholderText } = render(
      <VCardQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const firstNameInput = getByPlaceholderText('First name');
    fireEvent.changeText(firstNameInput, 'John');

    const lastNameInput = getByPlaceholderText('Last name');
    fireEvent.changeText(lastNameInput, 'Doe');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: QRCodeType.VCARD,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: undefined,
          mobileNumber: undefined,
          email: undefined,
          website: undefined,
          company: undefined,
          jobTitle: undefined,
          fax: undefined,
          address: undefined,
          city: undefined,
          postCode: undefined,
          country: undefined,
          label: 'John Doe',
        })
      );
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <VCardQR onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('initializes with provided initial data', () => {
    const initialData = {
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '5551234567',
      email: 'jane.smith@example.com',
      company: 'Tech Corp',
      label: 'Jane Smith Contact',
      type: QRCodeType.VCARD,
    };

    const { getByDisplayValue } = render(
      <VCardQR
        initialData={initialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(getByDisplayValue('Jane')).toBeTruthy();
    expect(getByDisplayValue('Smith')).toBeTruthy();
    expect(getByDisplayValue('5551234567')).toBeTruthy();
    expect(getByDisplayValue('jane.smith@example.com')).toBeTruthy();
    expect(getByDisplayValue('Tech Corp')).toBeTruthy();
    expect(getByDisplayValue('Jane Smith Contact')).toBeTruthy();
  });
});