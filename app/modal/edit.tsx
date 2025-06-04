// app/modal/edit.tsx
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QRGenerator } from '../../services/QRGenerator';
import { QRStorage } from '../../services/QRStorage';
import { UserPreferencesService } from '../../services/UserPreferences';
import { QRCodeData, QRCodeDesign, QRCodeTypeData } from '../../types/QRCode';
import QRCodePreview from '../components/QRCodePreview';
import QRForm from '../components/QRForm';
import QRDesignForm from '../components/qr-design/QRDesignForm';

export default function EditModal() {
  const { id, slot } = useLocalSearchParams<{ id: string; slot?: string }>();
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [formData, setFormData] = useState<QRCodeTypeData>({} as QRCodeTypeData);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [design, setDesign] = useState<QRCodeDesign>({
    color: '#000000',
    backgroundColor: '#FFFFFF',
    enableLinearGradient: false,
    logoSize: 20,
    logoMargin: 2,
    logoBorderRadius: 0,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadQRCode();
    loadPremiumStatus();
  }, [id]);

  const loadPremiumStatus = async () => {
    const premium = await UserPreferencesService.isPremium();
    setIsPremium(premium);
  };

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
        if (code.design) {
          setDesign(code.design);
        }
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
        design: isPremium ? design : undefined,
      };

      await QRStorage.updateQRCode(updatedQRCode);
      
      router.dismissAll();
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to update QR code');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeType = () => {
    Alert.alert(
      'Change QR Type',
      'To change the QR code type, please create a new QR code.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create New', 
          onPress: () => {
            router.dismissAll();
            router.push({
              pathname: '/modal/create',
              params: slot ? { slot } : {}
            });
          }
        }
      ]
    );
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit QR Code</Text>
        {slot && (
          <Text style={styles.slotIndicator}>
            {slot === 'primary' ? 'Primary' : 'Secondary'} Slot
          </Text>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'content' && styles.activeTab]}
          onPress={() => setActiveTab('content')}
        >
          <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>
            Content
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'design' && styles.activeTab]}
          onPress={() => setActiveTab('design')}
        >
          <View style={styles.tabContent}>
            {!isPremium && <Text style={styles.lockIcon}>🔒</Text>}
            <Text style={[styles.tabText, activeTab === 'design' && styles.activeTabText]}>
              Design
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'content' ? (
          <>
            <TouchableOpacity style={styles.typeDisplay} onPress={handleChangeType}>
              <Text style={styles.typeLabel}>QR Code Type</Text>
              <View style={styles.typeValue}>
                <Text style={styles.typeText}>{qrCode.type.toUpperCase()}</Text>
                <Text style={styles.changeText}>Change →</Text>
              </View>
            </TouchableOpacity>

            <QRForm
              type={qrCode.type}
              initialData={qrCode.data}
              onDataChange={setFormData}
            />
          </>
        ) : (
          <QRDesignForm
            design={design}
            onDesignChange={setDesign}
            isPremium={isPremium}
          />
        )}
        
        {qrContent ? (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewWrapper}>
              <QRCodePreview 
                value={qrContent} 
                size={150} 
                design={isPremium ? design : undefined}
              />
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  slotIndicator: {
    fontSize: 14,
    color: '#2196f3',
    marginTop: 4,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196f3',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2196f3',
    fontWeight: '600',
  },
  lockIcon: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  typeDisplay: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  typeValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  changeText: {
    fontSize: 14,
    color: '#2196f3',
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