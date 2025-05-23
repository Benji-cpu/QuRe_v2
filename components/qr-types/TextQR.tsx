import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Layout from '../../constants/Layout';
import { TextQRInput, createTextQR } from '../../services/qrGenerators/textQR';
import { QRCodeType, TextQRCode } from '../../types/qr-code';
import { Button } from '../Button';
import { FormField } from '../FormField';
import { Input } from '../Input';

interface TextQRProps {
  initialData?: Partial<TextQRCode>;
  onSave: (qrCode: TextQRCode) => void;
  onCancel: () => void;
}

export const TextQR: React.FC<TextQRProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [content, setContent] = useState(initialData?.content || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [errors, setErrors] = useState<{ content?: string; label?: string }>({});

  useEffect(() => {
    if (content && !label) {
      const defaultLabel = content.length > 20
        ? `${content.substring(0, 20)}...`
        : content;
      setLabel(defaultLabel);
    }
  }, [content]);

  const validate = (): boolean => {
    const newErrors: { content?: string; label?: string } = {};

    if (!content.trim()) {
      newErrors.content = 'Text content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const textQRInput: TextQRInput = {
      content: content.trim(),
      label: label.trim() || undefined,
    };

    const textQRCode = initialData
      ? {
          ...initialData,
          ...textQRInput,
          type: QRCodeType.TEXT,
          updatedAt: Date.now(),
        } as TextQRCode
      : createTextQR(textQRInput);

    onSave(textQRCode);
  };

  return (
    <View style={styles.container}>
      <FormField
        label="Text Content"
        error={errors.content}
      >
        <Input
          value={content}
          onChangeText={setContent}
          placeholder="Enter your text content"
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
    height: 120,
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