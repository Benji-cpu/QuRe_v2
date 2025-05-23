import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DEFAULT_COUNTRY_CODE } from '../../constants/CountryCodes';
import Layout from '../../constants/Layout';
import { SMSQRInput, createSMSQR } from '../../services/qrGenerators/smsQR';
import { QRCodeType, SMSQRCode } from '../../types/qr-code';
import { formatPhone } from '../../utils/formatters';
import { isValidPhone } from '../../utils/validators';
import { Button } from '../Button';
import { CountryCodeSelector } from '../CountryCodeSelector';
import { FormField } from '../FormField';
import { Input } from '../Input';

interface SMSQRProps {
  initialData?: Partial<SMSQRCode>;
  onSave: (qrCode: SMSQRCode) => void;
  onCancel: () => void;
}

export const SMSQR: React.FC<SMSQRProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [countryCode, setCountryCode] = useState(
    initialData?.countryCode || DEFAULT_COUNTRY_CODE.dialCode
  );
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [message, setMessage] = useState(initialData?.message || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [errors, setErrors] = useState<{
    phoneNumber?: string;
    message?: string;
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
      message?: string;
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

    const smsQRInput: SMSQRInput = {
      countryCode,
      phoneNumber: phoneNumber.trim(),
      message: message.trim() || undefined,
      label: label.trim() || undefined,
    };

    const smsQRCode = initialData
      ? {
          ...initialData,
          ...smsQRInput,
          type: QRCodeType.SMS,
          updatedAt: Date.now(),
        } as SMSQRCode
      : createSMSQR(smsQRInput);

    onSave(smsQRCode);
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
        label="Message"
        optional
        error={errors.message}
      >
        <Input
          value={message}
          onChangeText={setMessage}
          placeholder="SMS message content"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.multilineInput}
        />
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
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Layout.spacing.m,
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