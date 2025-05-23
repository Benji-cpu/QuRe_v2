import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Layout from '../../constants/Layout';
import { EmailQRInput, createEmailQR } from '../../services/qrGenerators/emailQR';
import { EmailQRCode, QRCodeType } from '../../types/qr-code';
import { isValidEmail } from '../../utils/validators';
import { Button } from '../Button';
import { FormField } from '../FormField';
import { Input } from '../Input';

interface EmailQRProps {
  initialData?: Partial<EmailQRCode>;
  onSave: (qrCode: EmailQRCode) => void;
  onCancel: () => void;
}

export const EmailQR: React.FC<EmailQRProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [email, setEmail] = useState(initialData?.email || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [errors, setErrors] = useState<{
    email?: string;
    subject?: string;
    body?: string;
    label?: string;
  }>({});

  useEffect(() => {
    if (email && !label) {
      setLabel(email);
    }
  }, [email]);

  const validate = (): boolean => {
    const newErrors: {
      email?: string;
      subject?: string;
      body?: string;
      label?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const emailQRInput: EmailQRInput = {
      email: email.trim(),
      subject: subject.trim() || undefined,
      body: body.trim() || undefined,
      label: label.trim() || undefined,
    };

    const emailQRCode = initialData
      ? {
          ...initialData,
          ...emailQRInput,
          type: QRCodeType.EMAIL,
          updatedAt: Date.now(),
        } as EmailQRCode
      : createEmailQR(emailQRInput);

    onSave(emailQRCode);
  };

  return (
    <View style={styles.container}>
      <FormField
        label="Email Address"
        error={errors.email}
      >
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </FormField>

      <FormField
        label="Subject"
        optional
        error={errors.subject}
      >
        <Input
          value={subject}
          onChangeText={setSubject}
          placeholder="Email subject"
        />
      </FormField>

      <FormField
        label="Message Body"
        optional
        error={errors.body}
      >
        <Input
          value={body}
          onChangeText={setBody}
          placeholder="Email content"
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