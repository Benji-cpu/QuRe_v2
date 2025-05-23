import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Layout from '../../constants/Layout';
import { LinkQRInput, createLinkQR } from '../../services/qrGenerators/linkQR';
import { LinkQRCode, QRCodeType } from '../../types/qr-code';
import { ensureHttps, extractDomainFromUrl, isValidUrl } from '../../utils/validators';
import { Button } from '../Button';
import { FormField } from '../FormField';
import { Input } from '../Input';

interface LinkQRProps {
  initialData?: Partial<LinkQRCode>;
  onSave: (qrCode: LinkQRCode) => void;
  onCancel: () => void;
}

export const LinkQR: React.FC<LinkQRProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [url, setUrl] = useState(initialData?.url || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [errors, setErrors] = useState<{ url?: string; label?: string }>({});

  useEffect(() => {
    if (url && !label) {
      try {
        const domain = extractDomainFromUrl(url);
        setLabel(domain);
      } catch (error) {
        console.log('Error extracting domain:', error);
      }
    }
  }, [url]);

  const validate = (): boolean => {
    const newErrors: { url?: string; label?: string } = {};

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      const formattedUrl = ensureHttps(url.trim());
      if (!isValidUrl(formattedUrl)) {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const linkQRInput: LinkQRInput = {
      url: url.trim(),
      label: label.trim() || undefined,
    };

    const linkQRCode = initialData
      ? {
          ...initialData,
          ...linkQRInput,
          type: QRCodeType.LINK,
          updatedAt: Date.now(),
        } as LinkQRCode
      : createLinkQR(linkQRInput);

    onSave(linkQRCode);
  };

  return (
    <View style={styles.container}>
      <FormField
        label="URL"
        error={errors.url}
      >
        <Input
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com"
          autoCapitalize="none"
          keyboardType="url"
          autoCorrect={false}
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