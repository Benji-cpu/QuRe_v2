// components/QRForm.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { QR_TYPES } from '../constants/QRTypes';
import { QRCodeType, QRCodeTypeData } from '../types/QRCode';

interface QRFormProps {
  type: QRCodeType;
  initialData?: QRCodeTypeData;
  onDataChange: (data: QRCodeTypeData) => void;
}

export default function QRForm({ type, initialData, onDataChange }: QRFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const typeConfig = QR_TYPES.find(t => t.type === type);

  useEffect(() => {
    if (initialData) {
      const newFormData: Record<string, string> = {};
      Object.entries(initialData).forEach(([key, value]) => {
        newFormData[key] = String(value || '');
      });
      setFormData(newFormData);
    } else {
      setFormData({});
    }
  }, [initialData, type]);

  useEffect(() => {
    onDataChange(formData as QRCodeTypeData);
  }, [formData, onDataChange]);

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!typeConfig) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {typeConfig.icon} {typeConfig.title} Details
      </Text>
      
      {typeConfig.fields.map((field) => (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label}
            {field.required && <Text style={styles.required}> *</Text>}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              field.multiline && styles.multilineInput
            ]}
            value={formData[field.key] || ''}
            onChangeText={(value) => updateField(field.key, value)}
            placeholder={field.placeholder}
            keyboardType={field.keyboardType || 'default'}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ))}
    </ScrollView>
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