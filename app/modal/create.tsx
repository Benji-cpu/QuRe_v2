// app/modal/create.tsx
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EngagementPricingService } from '../../services/EngagementPricingService';
import { QRGenerator } from '../../services/QRGenerator';
import { QRStorage } from '../../services/QRStorage';
import { UserPreferencesService } from '../../services/UserPreferences';
import { QRCodeData, QRCodeDesign, QRCodeType, QRCodeTypeData } from '../../types/QRCode';
import QRCodePreview from '../components/QRCodePreview';
import QRForm from '../components/QRForm';
import QRTypeSelector from '../components/QRTypeSelector';
import QRDesignForm from '../components/qr-design/QRDesignForm';

export default function CreateModal() {
  const insets = useSafeAreaInsets();
  const { slot } = useLocalSearchParams<{ slot?: string }>();
  const [selectedType, setSelectedType] = useState<QRCodeType>('link');
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
  const [isPremium, setIsPremium] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const formDataRef = useRef<QRCodeTypeData>(formData);
  
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    loadPremiumStatus();

    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const loadPremiumStatus = async () => {
    const premium = await UserPreferencesService.isPremium();
    setIsPremium(premium);
  };

  const canSave = () => {
    switch (selectedType) {
      case 'link':
        return 'url' in formData && formData.url?.trim();
      case 'whatsapp':
        return 'phone' in formData && formData.phone?.trim();
      case 'email':
        return 'email' in formData && formData.email?.trim();
      case 'phone':
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
        design: isPremium ? design : undefined,
      };

      await QRStorage.saveQRCode(qrCodeData);
      
      await EngagementPricingService.trackAction('qrCodesCreated');
  
      if (slot === 'primary') {
        await UserPreferencesService.updatePrimaryQR(qrCodeData.id);
      } else if (slot === 'secondary') {
        await UserPreferencesService.updateSecondaryQR(qrCodeData.id);
      }
  
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save QR code');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectFromHistory = () => {
    router.replace({
      pathname: '/modal/history',
      params: { selectMode: 'true', slot: slot || '' }
    });
  };
 
  const qrContent = canSave() ? QRGenerator.generateContent(selectedType, formData) : '';
 
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create QR Code</Text>
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
 
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: Math.max(insets.bottom + 100, keyboardHeight + 100) 
        }}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'content' ? (
          <>
            <TouchableOpacity 
             style={styles.historyButton}
             onPress={handleSelectFromHistory}
           >
             <Text style={styles.historyButtonIcon}>📋</Text>
             <Text style={styles.historyButtonText}>Select from History</Text>
           </TouchableOpacity>

           <View style={styles.divider}>
             <View style={styles.dividerLine} />
             <Text style={styles.dividerText}>OR CREATE NEW</Text>
             <View style={styles.dividerLine} />
           </View>
           
           <QRTypeSelector
             selectedType={selectedType}
             onTypeSelect={setSelectedType}
           />
           
           <QRForm
             type={selectedType}
             initialData={formDataRef.current}
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
     
     <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
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
   </KeyboardAvoidingView>
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
 historyButton: {
   backgroundColor: '#fff',
   borderRadius: 12,
   padding: 20,
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   borderWidth: 2,
   borderColor: '#2196f3',
   marginBottom: 20,
 },
 historyButtonIcon: {
   fontSize: 24,
   marginRight: 10,
 },
 historyButtonText: {
   fontSize: 16,
   fontWeight: '600',
   color: '#2196f3',
 },
 divider: {
   flexDirection: 'row',
   alignItems: 'center',
   marginVertical: 20,
 },
 dividerLine: {
   flex: 1,
   height: 1,
   backgroundColor: '#ddd',
 },
 dividerText: {
   paddingHorizontal: 15,
   fontSize: 12,
   color: '#999',
   fontWeight: '600',
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
    marginTop: 20,
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