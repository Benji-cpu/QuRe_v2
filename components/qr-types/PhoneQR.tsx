import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DEFAULT_COUNTRY_CODE } from '../../constants/CountryCodes';
import Layout from '../../constants/Layout';
import { PhoneQRInput, createPhoneQR } from '../../services/qrGenerators/phoneQR';
import { PhoneQRCode, QRCodeType } from '../../types/qr-code';
import { formatPhone, isValidPhone } from '../../utils/formatters';
import { Button } from '../Button';
import { CountryCodeSelector } from '../CountryCodeSelector';
import { FormField } from '../FormField';
import { Input } from '../Input';

interface PhoneQRProps {
  initialData?: Partial<PhoneQRCode>;
  onSave: (qrCode: PhoneQRCode) => void;
  onCancel: () => void;
}

export const PhoneQR: React.FC<PhoneQRProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [countryCode, setCountryCode] = useState(
    initialData?.countryCode || DEFAULT_COUNTRY_CODE.dialCode
  );
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [errors, setErrors] = useState<{
    phoneNumber?: string;
    label?: string;
  }>({});

  useEffect(() => {
    if (phoneNumber && countryCode && !label) {
      setLabel(formatPhone(countryCode, phoneNumber));
    }
  }, [phoneNumber, countryCode]);

  const validate = (): boolean => {
    const newErrors: {
      phoneNumber?: string;
      label?: string;
    } = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhone(formatPhone(countryCode, phoneNumber))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const phoneQRInput: PhoneQRInput = {
      countryCode,
      phoneNumber: phoneNumber.trim(),
      label: label.trim() || undefined,
    };

    const phoneQRCode = initialData
      ? {
          ...initialData,
          ...phoneQRInput,
          type: QRCodeType.PHONE,
          updatedAt: Date.now(),
        } as PhoneQRCode
      : createPhoneQR(phoneQRInput);

    onSave(phoneQRCode);
  };

  return (
    <View style={styles.container}>
      <FormField
        label="Phone Number"
        error={errors.phoneNumber}
      >
        <View style={styles.phoneContainer}>
          <View style={styles.countryCodeContainer}>
            <CountryCodeSelector
              value={countryCode}
              onChange={setCountryCode}
            />
          </View>
          <View style={styles.phoneNumberContainer}>
            <Input
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </FormField>

      <FormField
        label="QR Code Label"
        optional
        error={errors.label}
      >
        <Input
          value={label}
          onChangeText={setLabel}
          placeholder="Enter a label for this QR code"
        />
      </FormField>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Save"
          onPress={handleSave}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    width: '35%',
    marginRight: Layout.spacing.s,
  },
  phoneNumberContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.l,
  },
  button: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
});