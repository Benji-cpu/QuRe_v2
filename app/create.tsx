// app/modal/create.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QRCodeData, QRCodeType, QRCodeTypeData } from '../../types/QRCode';
import QRCodePreview from '../components/QRCodePreview';
import QRForm from '../components/QRForm';
import QRTypeSelector from '../components/QRTypeSelector';
import { QRGenerator } from '../services/QRGenerator';
import { QRStorage } from '../services/QRStorage';

export default function CreateModal() {
  const [selectedType, setSelectedType] = useState<QRCodeType>('link');
  const [formData, setFormData] = useState<QRCodeTypeData>({} as QRCodeTypeData);
  const [saving, setSaving] = useState(false);

  const canSave = () => {
    switch (selectedType) {
      case 'link':
        return 'url' in formData && formData.url?.trim();
      case 'email':
        return 'email' in formData && formData.email?.trim();
      case 'phone':
        return 'phone' in formData && formData.phone?.trim();
      case 'sms':
        return 'phone' in formData && formData.phone?.trim();
      case 'contact':
        return 'firstName' in formData && 'lastName' in formData && 
               formData.firstName?.trim() && formData.lastName?.trim();
      case 'text':
        return 'text' in formData && formData.text?.trim();
      default:
        return false;
    }
  };

  const handleSave = async () => {
    if (!canSave()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      const content = QRGenerator.generateContent(selectedType, formData);
      const label = QRGenerator.generateLabel(selectedType, formData);
      
      const qrCodeData: QRCodeData = {
        id: Date.now().toString(),
        type: selectedType,
        label,
        data: formData,
        content,
        createdAt: new Date().toISOString(),
      };

      await QRStorage.saveQRCode(qrCodeData);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save QR code');
    } finally {
      setSaving(false);
    }
  };

  const qrContent = canSave() ? QRGenerator.generateContent(selectedType, formData) : '';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <QRTypeSelector
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
        />
        
        <QRForm
          type={selectedType}
          onDataChange={setFormData}
        />
        
        {qrContent ? (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewWrapper}>
              <QRCodePreview value={qrContent} size={150} />
            </View>
          </View>
        ) : null}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.saveButton,
            (!canSave() || saving) && styles.disabledButton
          ]} 
          onPress={handleSave}
          disabled={!canSave() || saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  previewContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  previewWrapper: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#2196f3',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});