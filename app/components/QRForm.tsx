// app/components/QRForm.tsx
import type { ReactNode } from 'react';
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
  onFieldFocus?: (fieldKey: string, input?: TextInput | null) => void;
  headerAccessory?: ReactNode;
}

export default function QRForm({ type, initialData, onDataChange, onFieldLayout, onFieldFocus, headerAccessory }: QRFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const hasInitialized = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

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
    const src: Record<string, string | undefined> =
      initialData && typeof initialData === 'object' && !Array.isArray(initialData)
        ? (initialData as unknown as Record<string, string | undefined>)
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

  const renderHeadingIcon = () => {
    if (!typeConfig) return null;
    const iconDefinition = typeConfig.iconDefinition;
    if (iconDefinition?.type === 'vector') {
      const Icon = iconDefinition.Icon;
      const iconColor = iconDefinition.color || theme.primary;
      return (
        <View style={[styles.headingIconBadge, { borderColor: iconColor }]}>
          <Icon
            name={iconDefinition.iconName as never}
            size={Math.round(24 * (iconDefinition.sizeScale ?? 1))}
            color={iconColor}
          />
        </View>
      );
    }

    return (
      <Text style={[styles.headingEmoji, { color: theme.primary }]}>
        {iconDefinition?.type === 'emoji' ? iconDefinition.emoji : typeConfig.icon}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleGroup}>
          {renderHeadingIcon()}
          <Text style={[styles.title, { color: theme.text }]}>
            {typeConfig.title}
          </Text>
        </View>
        {headerAccessory ? <View style={styles.headerAccessory}>{headerAccessory}</View> : null}
      </View>
      
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
            ref={(ref) => {
              inputRefs.current[field.key] = ref;
            }}
            value={formData[field.key] || ''}
            onChangeText={(value) => updateField(field.key, value)}
            placeholder={field.placeholder}
            placeholderTextColor={theme.textTertiary}
            keyboardType={field.keyboardType || 'default'}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => onFieldFocus?.(field.key, inputRefs.current[field.key] || null)}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headingIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingEmoji: {
    fontSize: 32,
  },
  headerAccessory: {
    flexShrink: 0,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  required: {
    color: '#f44336',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 11,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});
