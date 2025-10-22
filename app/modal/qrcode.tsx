// app/modal/qrcode.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, NativeModules, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { EngagementPricingService } from '../../services/EngagementPricingService';
import { navigationService } from '../../services/NavigationService';
import { QRGenerator } from '../../services/QRGenerator';
import { QRStorage } from '../../services/QRStorage';
import { UserPreferencesService } from '../../services/UserPreferences';
import { QRCodeData, QRCodeDesign, QRCodeType, QRCodeTypeData } from '../../types/QRCode';
import QRCodePreview from '../components/QRCodePreview';
import QRForm from '../components/QRForm';
import QRTypeSelector from '../components/QRTypeSelector';
import QRDesignForm from '../components/qr-design/QRDesignForm';

export default function QRCodeModal() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { id, slot } = useLocalSearchParams<{ id?: string; slot?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const fieldLayouts = useRef<Record<string, number>>({});
  const formOffset = useRef(0);
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
  const [loading, setLoading] = useState(!!id);
  const [isPremium, setIsPremium] = useState(false);
  const [originalQRCode, setOriginalQRCode] = useState<QRCodeData | null>(null);
  const [showHistorySelector, setShowHistorySelector] = useState(false);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  
  const formDataRef = useRef<QRCodeTypeData>(formData);
  const isEditMode = !!id;
  
  useEffect(() => {
    return () => {
      navigationService.clearModalState('/modal/qrcode');
    };
  }, []);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    loadPremiumStatus();
    if (id) {
      loadQRCode();
    }
    loadQRHistory();
  }, [id]);

  useEffect(() => {
    fieldLayouts.current = {};
    formOffset.current = 0;
  }, [selectedType]);

  const loadPremiumStatus = async () => {
    const premium = await UserPreferencesService.isPremium();
    setIsPremium(premium);
  };

  const loadQRCode = async () => {
    if (!id) return;

    try {
      const code = await QRStorage.getQRCodeById(id);
      if (code) {
        setOriginalQRCode(code);
        setSelectedType(code.type);
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

  const loadQRHistory = async () => {
    try {
      const codes = await QRStorage.getAllQRCodes();
      setQrCodes(codes);
    } catch (error) {
      console.error('Error loading QR codes:', error);
    }
  };

  const handleSelectFromHistory = async (qrCode: QRCodeData) => {
    // Always assign the selected QR code to a slot and go to home screen
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      
      // Determine which slot to assign to
      if (slot === 'primary') {
        await UserPreferencesService.updatePrimaryQR(qrCode.id);
      } else if (slot === 'secondary') {
        await UserPreferencesService.updateSecondaryQR(qrCode.id);
      } else {
        // No specific slot provided, use smart assignment
        // Priority: use primary if empty, otherwise use secondary if premium and empty
        if (!preferences.primaryQRCodeId) {
          await UserPreferencesService.updatePrimaryQR(qrCode.id);
        } else if (premium && !preferences.secondaryQRCodeId) {
          await UserPreferencesService.updateSecondaryQR(qrCode.id);
        } else {
          // If both slots are taken, replace primary slot
          await UserPreferencesService.updatePrimaryQR(qrCode.id);
        }
      }
      
      // Navigate back to home screen to show the newly assigned QR code
      // Navigate back without replacing the entire stack
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to assign QR code to slot');
    }
  };

  const handleCreateNew = () => {
    if (isEditMode && slot) {
      // When editing and creating new, clear the form and switch to create mode
      setSelectedType('link');
      setFormData({} as QRCodeTypeData);
      setDesign({
        color: '#000000',
        backgroundColor: '#FFFFFF',
        enableLinearGradient: false,
        logoSize: 20,
        logoMargin: 2,
        logoBorderRadius: 0,
      });
      setShowHistorySelector(false);
      
      // Navigate to create mode for this slot
      router.replace(`/modal/qrcode?slot=${slot}`);
    } else {
      // Normal create new behavior
      setSelectedType('link');
      setFormData({} as QRCodeTypeData);
      setDesign({
        color: '#000000',
        backgroundColor: '#FFFFFF',
        enableLinearGradient: false,
        logoSize: 20,
        logoMargin: 2,
        logoBorderRadius: 0,
      });
      setShowHistorySelector(false);
    }
  };

  const handleFormDataChange = useCallback((data: QRCodeTypeData) => {
    setFormData(data);
  }, []);

  const handleDesignChange = useCallback((newDesign: QRCodeDesign) => {
    setDesign(newDesign);
  }, []);

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
      case 'instagram':
        return 'username' in formData && formData.username?.trim();
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
      
      if (isEditMode && originalQRCode) {
        // Update existing QR code
        const updatedQRCode: QRCodeData = {
          ...originalQRCode,
          type: selectedType,
          label,
          data: formData,
          content,
          design: isPremium ? design : undefined,
        };

        await QRStorage.updateQRCode(updatedQRCode);
        await EngagementPricingService.trackAction('qrCodesEdited');
      } else {
        // Create new QR code
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
      }
  
      // Navigate back without replacing the entire stack
      router.back();
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'save'} QR code`);
    } finally {
      setSaving(false);
    }
  };

  const handleDesignTabClick = () => {
    if (!isPremium) {
      navigationService.navigateToPremium();
    }
  };

  const handleFieldLayout = useCallback((fieldKey: string, layoutY: number) => {
    fieldLayouts.current[fieldKey] = formOffset.current + layoutY;
  }, []);

  const handleFieldFocus = useCallback((fieldKey: string) => {
    const layoutY = fieldLayouts.current[fieldKey];
    if (layoutY === undefined) return;

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: Math.max(0, layoutY - 80),
        animated: true,
      });
    }
  }, []);

  const qrContent = canSave() ? QRGenerator.generateContent(selectedType, formData) : '';

  const copyToClipboard = useCallback(async (value: string) => {
    if (!value) return false;

    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
      return false;
    }

    try {
      const clipboardModule = await import('expo-clipboard');
      if (clipboardModule?.setStringAsync) {
        await clipboardModule.setStringAsync(value);
        return true;
      }
    } catch (error) {
      console.warn('expo-clipboard unavailable, attempting legacy clipboard fallback', error);
    }

    try {
      if (NativeModules?.Clipboard?.setString) {
        NativeModules.Clipboard.setString(value);
        return true;
      }
    } catch (fallbackError) {
      console.warn('Legacy clipboard fallback failed', fallbackError);
    }

    return false;
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!qrContent) return;
    try {
      const success = await copyToClipboard(qrContent);
      if (success) {
        Alert.alert('Copied', 'Link copied to clipboard.');
      } else {
        Alert.alert('Unavailable', 'Clipboard is not available in this environment.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link to clipboard.');
    }
  }, [copyToClipboard, qrContent]);

  const handleOpenLink = useCallback(async () => {
    if (!qrContent) return;
    try {
      const supported = await Linking.canOpenURL(qrContent);
      if (!supported) {
        Alert.alert('Unavailable', 'This QR content cannot be opened on this device.');
        return;
      }
      await Linking.openURL(qrContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link.');
    }
  }, [qrContent]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  const showOpenButton = selectedType !== 'contact' && !!qrContent;

  const renderHistorySelector = () => {
    if (!showHistorySelector) return null;

    return (
      <View style={[styles.historyOverlay, { backgroundColor: theme.modalBackground }]}>
        <View style={[styles.historyContainer, { backgroundColor: theme.surface }]}>
          <View style={[styles.historyHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>Select from History</Text>
            <TouchableOpacity onPress={() => setShowHistorySelector(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.historyList}>
            <TouchableOpacity
              style={[styles.historyItem, styles.createNewItem, { borderBottomColor: theme.border, backgroundColor: theme.primary + '10' }]}
              onPress={handleCreateNew}
            >
              <View style={styles.createNewContent}>
                <Ionicons name="add-circle" size={24} color={theme.primary} />
                <Text style={[styles.createNewText, { color: theme.primary }]}>Create New QR Code</Text>
              </View>
            </TouchableOpacity>
            {qrCodes.map((qrCode) => (
              <TouchableOpacity
                key={qrCode.id}
                style={[styles.historyItem, { borderBottomColor: theme.border }]}
                onPress={() => handleSelectFromHistory(qrCode)}
              >
                <Text style={[styles.historyItemLabel, { color: theme.text }]}>{qrCode.label}</Text>
                <Text style={[styles.historyItemType, { color: theme.textSecondary }]}>{qrCode.type.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: insets.top + 15 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>QR Code</Text>
        <View style={styles.headerActions}>
          {qrCodes.length > 0 && (
            <TouchableOpacity style={styles.headerActionButton} onPress={() => setShowHistorySelector(true)}>
              <Ionicons name="time-outline" size={20} color={theme.text} />
              <Text style={[styles.headerActionText, { color: theme.textSecondary }]}>History</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerActionButton} onPress={handleCreateNew}>
            <Ionicons name="add-circle-outline" size={20} color={theme.text} />
            <Text style={[styles.headerActionText, { color: theme.textSecondary }]}>New</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'content' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab('content')}
        >
          <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'content' && [styles.activeTabText, { color: theme.primary }]]}>
            Content
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'design' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          onPress={() => {
            setActiveTab('design');
            if (!isPremium) {
              handleDesignTabClick();
            }
          }}
        >
          <View style={styles.tabContent}>
            {!isPremium && <Text style={styles.lockIcon}>🔒</Text>}
            <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'design' && [styles.activeTabText, { color: theme.primary }]]}>
              Design
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {slot && (
          <View style={[styles.slotIndicator, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.slotIndicatorText, { color: theme.primary }]}>
              {slot === 'primary' ? 'Primary' : 'Secondary'} Slot
            </Text>
          </View>
        )}
        
        {activeTab === 'content' ? (
          <>
            {!isEditMode && (
              <QRTypeSelector
                selectedType={selectedType}
                onTypeSelect={setSelectedType}
              />
            )}
            
            <View onLayout={(event) => { formOffset.current = event.nativeEvent.layout.y; }}>
              <QRForm
                type={selectedType}
                initialData={formData}
                onDataChange={handleFormDataChange}
                onFieldLayout={handleFieldLayout}
                onFieldFocus={handleFieldFocus}
              />
            </View>
          </>
        ) : (
          <TouchableOpacity 
            activeOpacity={isPremium ? 1 : 0.7}
            onPress={!isPremium ? handleDesignTabClick : undefined}
            style={{ flex: 1 }}
          >
            <QRDesignForm
              design={design}
              onDesignChange={handleDesignChange}
              isPremium={isPremium}
            />
          </TouchableOpacity>
        )}
        
        {qrContent && (activeTab === 'content' || isPremium) ? (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewTitle, { color: theme.text }]}>Preview</Text>
            <View style={[styles.previewWrapper, { backgroundColor: theme.surface }]}>
              <QRCodePreview 
                value={qrContent} 
                size={150} 
                design={isPremium ? design : undefined}
              />
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={[styles.previewActionButton, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}
                  onPress={handleCopyLink}
                >
                  <Ionicons name="copy-outline" size={18} color={theme.text} />
                  <Text style={[styles.previewActionText, { color: theme.text }]}>Copy Link</Text>
                </TouchableOpacity>
                {showOpenButton && (
                  <TouchableOpacity
                    style={[styles.previewActionButton, styles.previewActionPrimary, { backgroundColor: theme.primary }]}
                    onPress={handleOpenLink}
                  >
                    <Ionicons name="open-outline" size={18} color={theme.primaryText} />
                    <Text style={[styles.previewActionText, { color: theme.primaryText }]}>Open Link</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10, backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.cancelButton, { backgroundColor: theme.surfaceVariant }]} 
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.saveButton,
            { backgroundColor: theme.primary },
            (!canSave() || saving) && [styles.disabledButton, { backgroundColor: theme.textTertiary }]
          ]} 
          onPress={handleSave}
          disabled={!canSave() || saving}
        >
          <Text style={[styles.saveButtonText, { color: theme.primaryText }]}>
            {saving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
          </Text>
        </TouchableOpacity>
      </View>

      {renderHistorySelector()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 20,
  },
  headerActionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  slotIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 15,
    alignSelf: 'center',
  },
  slotIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
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
  lockedText: {
    fontSize: 14,
    color: '#999',
  },
  previewContainer: {
    marginTop: 20,
    marginBottom: 10,
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
  previewActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  previewActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  previewActionPrimary: {
    borderWidth: 0,
  },
  previewActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  historyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  createNewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  createNewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createNewText: {
    fontSize: 16,
    fontWeight: '500',
  },
  historyItemLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  historyItemType: {
    fontSize: 14,
    color: '#666',
  },
}); 
