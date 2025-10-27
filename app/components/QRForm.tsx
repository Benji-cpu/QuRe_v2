// app/components/QRForm.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { QR_TYPES } from '../../constants/QRTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { QRCodeType, QRCodeTypeData } from '../../types/QRCode';

interface QRFormProps {
  type: QRCodeType;
  initialData?: QRCodeTypeData;
  onDataChange: (data: QRCodeTypeData) => void;
  onFieldLayout?: (fieldKey: string, layoutY: number) => void;
  onFieldFocus?: (fieldKey: string) => void;
}

export default function QRForm({ type, initialData, onDataChange, onFieldLayout, onFieldFocus }: QRFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const hasInitialized = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const typeConfig = QR_TYPES.find(t => t.type === type);

  useEffect(() => {
    // Reset when type changes
    hasInitialized.current = false;
    setFormData({});
  }, [type]);

  useEffect(() => {
    // Initialize form data only once per type; ensure all fields exist with default '' values
    if (!typeConfig || hasInitialized.current) return;

    const baseFormData: Record<string, string> = {};
    const src = (initialData && typeof initialData === 'object' && !Array.isArray(initialData))
      ? (initialData as Record<string, unknown>)
      : {};

    // Ensure every field key exists; pull value from initialData if provided
    for (const field of typeConfig.fields) {
      const raw = src[field.key];
      baseFormData[field.key] = String(raw ?? '');
    }

    setFormData(baseFormData);
    hasInitialized.current = true;

    // Notify parent after microtask to avoid render loop
    setTimeout(() => {
      onDataChange(baseFormData as unknown as QRCodeTypeData);
    }, 0);
  }, [typeConfig, initialData, onDataChange]);

  const updateField = useCallback((key: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        onDataChange(updated as unknown as QRCodeTypeData);
      }, 300);
      
      return updated;
    });
  }, [onDataChange]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!typeConfig) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        {typeConfig.icon} {typeConfig.title} Details
      </Text>
      
      {typeConfig.fields.map((field) => (
        <View
          key={field.key}
          style={styles.fieldContainer}
          onLayout={(event) => onFieldLayout?.(field.key, event.nativeEvent.layout.y)}
        >
          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            {field.label}
            {field.required && <Text style={[styles.required, { color: theme.error }]}> *</Text>}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              },
              field.multiline && styles.multilineInput
            ]}
            value={formData[field.key] || ''}
            onChangeText={(value) => updateField(field.key, value)}
            placeholder={field.placeholder}
            placeholderTextColor={theme.textTertiary}
            keyboardType={field.keyboardType || 'default'}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => onFieldFocus?.(field.key)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  required: {
    color: '#f44336',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});
