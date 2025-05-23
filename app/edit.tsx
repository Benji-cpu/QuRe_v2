import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCodePreview from '../components/QRCodePreview';
import QRForm from '../components/QRForm';
import { QRGenerator } from '../services/QRGenerator';
import { QRStorage } from '../services/QRStorage';
import { QRCodeData, QRCodeTypeData } from '../types/QRCode';

export default function EditModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [formData, setFormData] = useState<QRCodeTypeData>({} as QRCodeTypeData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQRCode();
  }, [id]);

  const loadQRCode = async () => {
    if (!id) {
      Alert.alert('Error', 'No QR code ID provided');
      router.back();
      return;
    }

    try {
      const code = await QRStorage.getQRCodeById(id);
      if (code) {
        setQrCode(code);
        setFormData(code.data);
      } else {
        Alert.alert('Error', 'QR code not found');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load QR code');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const canSave = () => {
    if (!qrCode) return false;
    
    switch (qrCode.type) {
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
    if (!qrCode || !canSave()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      const content = QRGenerator.generateContent(qrCode.type, formData);
      const label = QRGenerator.generateLabel(qrCode.type, formData);
      
      const updatedQRCode: QRCodeData = {
        ...qrCode,
        label,
        data: formData,
        content,
      };

      await QRStorage.updateQRCode(updatedQRCode);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update QR code');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!qrCode) {
    return null;
  }

  const qrContent = canSave() ? QRGenerator.generateContent(qrCode.type, formData) : '';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <QRForm
          type={qrCode.type}
          initialData={qrCode.data}
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
            {saving ? 'Updating...' : 'Update'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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