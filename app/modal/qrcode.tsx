// app/modal/qrcode.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Linking, NativeModules, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, findNodeHandle } from 'react-native';
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
import { canGenerateQRCode } from '../utils/qrValidation';

const PREVIEW_ACTION_WIDTH = 132;
const PREVIEW_ACTION_PADDING = PREVIEW_ACTION_WIDTH + 28;

export default function QRCodeModal() {
  const insets = useSafeAreaInsets();
  const headerPadding = Math.max(insets.top - 42, 10);
  const { theme } = useTheme();
  const { id, slot } = useLocalSearchParams<{ id?: string; slot?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const previewLayoutY = useRef<number | null>(null);
  // Store field layout as RELATIVE offsets to the form container.
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
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const copyFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const formDataRef = useRef<QRCodeTypeData>(formData);
  const isEditMode = !!id;
  const lastFocusedFieldRef = useRef<{ key: string; input?: TextInput | null } | null>(null);
  
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

  const scrollToPreview = useCallback(() => {
    requestAnimationFrame(() => {
      if (!scrollViewRef.current) return;
      if (typeof previewLayoutY.current === 'number') {
        scrollViewRef.current.scrollTo({ y: Math.max(0, previewLayoutY.current - 20), animated: true });
      } else {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    });
  }, []);

  const handleDesignChange = useCallback((newDesign: QRCodeDesign) => {
    setDesign((prevDesign) => {
      const prevLogo = prevDesign.logo;
      const nextLogo = newDesign.logo;
      if (nextLogo && nextLogo !== prevLogo) {
        scrollToPreview();
      }
      return newDesign;
    });
  }, [scrollToPreview]);

  const canSave = () => canGenerateQRCode(selectedType, formData);

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
    // Save relative Y (inside the form). We'll add the form's offset when focusing.
    fieldLayouts.current[fieldKey] = layoutY;
  }, []);

  const scrollToField = useCallback((fieldKey: string, input?: TextInput | null) => {
    const fallbackScroll = () => {
      const relativeY = fieldLayouts.current[fieldKey];
      const y = relativeY !== undefined ? (formOffset.current || 0) + relativeY - 20 : (formOffset.current || 0);

      if (scrollViewRef.current) {
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
        });
      }
    };

    const innerNode = scrollViewRef.current?.getInnerViewNode?.();
    if (input && innerNode) {
      try {
        input.measureLayout(
          innerNode,
          (_x, y) => {
            const targetY = y - 20;
            if (scrollViewRef.current) {
              requestAnimationFrame(() => {
                scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
              });
            }
          },
          () => {
            fallbackScroll();
          }
        );
        return;
      } catch {
        // If measureLayout fails, fall back to scroll responder logic
      }
    }

    const scrollResponder = scrollViewRef.current?.getScrollResponder?.();
    const nodeHandle = input ? findNodeHandle(input) : null;

    if (scrollResponder && nodeHandle) {
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(nodeHandle, 110, true);
      return;
    }

    fallbackScroll();
  }, []);

  const handleFieldFocus = useCallback((fieldKey: string, input?: TextInput | null) => {
    lastFocusedFieldRef.current = { key: fieldKey, input };
    scrollToField(fieldKey, input);
    if (Platform.OS === 'android') {
      setTimeout(() => scrollToField(fieldKey, input), 150);
    }
  }, [scrollToField]);

  useEffect(() => {
    // When keyboard finishes showing, ensure last focused field is visible
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (lastFocusedFieldRef.current) {
        const { key, input } = lastFocusedFieldRef.current;
        scrollToField(key, input);
      }
    });
    return () => sub.remove();
  }, [scrollToField]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeout.current) {
        clearTimeout(copyFeedbackTimeout.current);
        copyFeedbackTimeout.current = null;
      }
    };
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
        if (copyFeedbackTimeout.current) {
          clearTimeout(copyFeedbackTimeout.current);
        }
        setCopyFeedback('Link copied to clipboard.');
        copyFeedbackTimeout.current = setTimeout(() => {
          setCopyFeedback(null);
          copyFeedbackTimeout.current = null;
        }, 3000);
      } else {
        Alert.alert('Unavailable', 'Clipboard is not available in this environment.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link to clipboard.');
    }
  }, [copyToClipboard, qrContent]);

  const handleOpenLink = useCallback(async () => {
    if (!qrContent) return;
    const url = qrContent.trim();
    try {
      // On web, just attempt to open directly
      if (Platform.OS === 'web') {
        await Linking.openURL(url);
        return;
      }

      // For http/https, attempt to open directly (canOpenURL may be unreliable in some envs)
      if (/^https?:/i.test(url)) {
        await Linking.openURL(url);
        return;
      }

      // For custom schemes (tel:, mailto:, etc.) check support first
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Unavailable', 'This QR content cannot be opened on this device.');
        return;
      }
      await Linking.openURL(url);
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
  const slotLabel = slot ? `${slot === 'primary' ? 'Primary' : 'Secondary'} Slot` : null;

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

  const canShowPreviewSection = activeTab === 'content' || isPremium;
  const hasPreviewContent = !!qrContent;
  const saveDisabled = !canSave() || saving;
  const copyDisabled = !hasPreviewContent;
  const openDisabled = !hasPreviewContent;
  const actionCopyTextColor = copyDisabled ? theme.textSecondary : theme.text;
  const baseBottomPadding = insets.bottom + 32;
  const designOverlayOffset = activeTab === 'design' && !isPremium ? 80 : 0;
  const previewOffset = hasPreviewContent ? 8 : 0;
  const scrollBottomPadding = baseBottomPadding + designOverlayOffset + previewOffset;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 110 : insets.top + 56}
    >
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: headerPadding, paddingBottom: headerPadding }]}>
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
          {isEditMode && (
            <TouchableOpacity style={styles.headerActionButton} onPress={handleCreateNew}>
              <Ionicons name="add-circle-outline" size={20} color={theme.text} />
              <Text style={[styles.headerActionText, { color: theme.textSecondary }]}>New</Text>
            </TouchableOpacity>
          )}
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
        contentContainerStyle={[styles.contentContainer, { paddingBottom: scrollBottomPadding }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
        automaticallyAdjustKeyboardInsets
      >
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
                headerAccessory={slotLabel ? (
                  <View style={[styles.slotIndicator, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.slotIndicatorText, { color: theme.primary }]}>
                      {slotLabel}
                    </Text>
                  </View>
                ) : undefined}
              />
            </View>
          </>
        ) : (
          <View style={[styles.designTabWrapper, !isPremium && styles.designTabLocked]}>
            <QRDesignForm
              design={design}
              onDesignChange={handleDesignChange}
              isPremium={isPremium}
            />
            {!isPremium && (
              <TouchableOpacity
                style={[styles.premiumOverlay, { backgroundColor: theme.primary }]}
                activeOpacity={0.8}
                onPress={handleDesignTabClick}
              >
                <Ionicons name="sparkles" size={16} color={theme.primaryText} />
                <Text style={[styles.premiumOverlayText, { color: theme.primaryText }]}>
                  Unlock Premium Design Tools
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {canShowPreviewSection ? (
          <View
            style={styles.previewContainer}
            onLayout={(event) => {
              previewLayoutY.current = event.nativeEvent.layout.y;
            }}
          >
            <View style={[styles.previewWrapper, { backgroundColor: theme.surface }]}>
              <View style={styles.previewContent}>
                {hasPreviewContent ? (
                  <QRCodePreview 
                    value={qrContent} 
                    size={150} 
                    design={isPremium ? design : undefined}
                  />
                ) : (
                  <View style={[styles.previewPlaceholder, { backgroundColor: theme.surfaceVariant + '40', borderColor: theme.border }]}>
                    <Ionicons name="qr-code-outline" size={32} color={theme.textSecondary} />
                    <Text style={[styles.previewPlaceholderText, { color: theme.textSecondary }]}>
                      Enter required details to preview your QR code.
                    </Text>
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.previewActions,
                  {
                    borderColor: theme.primary,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <View style={styles.previewActionsContent}>
                  <TouchableOpacity
                    style={[
                      styles.previewActionButton,
                      styles.previewActionTop,
                      { borderColor: theme.borderLight },
                      copyDisabled && styles.previewActionDisabled,
                    ]}
                    onPress={handleCopyLink}
                    activeOpacity={0.85}
                    disabled={copyDisabled}
                  >
                    <Text style={[styles.previewActionText, { color: actionCopyTextColor }]}>Copy</Text>
                    <Ionicons name="copy-outline" size={18} color={actionCopyTextColor} />
                  </TouchableOpacity>
                  {showOpenButton && (
                    <TouchableOpacity
                      style={[
                        styles.previewActionButton,
                        styles.previewActionMiddle,
                        { borderColor: theme.borderLight },
                        openDisabled && styles.previewActionDisabled,
                      ]}
                      onPress={handleOpenLink}
                      activeOpacity={0.85}
                      disabled={openDisabled}
                    >
                      <Text style={[styles.previewActionText, { color: openDisabled ? theme.textSecondary : theme.text }]}>Open</Text>
                      <Ionicons name="open-outline" size={18} color={openDisabled ? theme.textSecondary : theme.text} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.previewActionButton,
                      styles.previewActionBottom,
                      styles.previewActionPrimary,
                      {
                        borderColor: saveDisabled ? theme.borderLight : theme.primary,
                      },
                      saveDisabled && styles.previewActionDisabled,
                    ]}
                    onPress={handleSave}
                    activeOpacity={0.9}
                    disabled={saveDisabled}
                  >
                    <Text
                      style={[
                        styles.previewActionText,
                        {
                          color: saveDisabled ? theme.textSecondary : theme.primary,
                        },
                      ]}
                    >
                      {saving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
                    </Text>
                    <Ionicons
                      name="save-outline"
                      size={18}
                      color={saveDisabled ? theme.textSecondary : theme.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {copyFeedback && (
                <View style={[styles.copyFeedbackToast, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                  <Text style={[styles.copyFeedbackText, { color: theme.textSecondary }]}>
                    {copyFeedback}
                  </Text>
                </View>
              )}
            </View>
            {design.logo && (
              <View style={[styles.previewWarning, { backgroundColor: theme.warning + '20' }]}>
                <Text style={styles.previewWarningIcon}>⚠️</Text>
                <Text style={[styles.previewWarningText, { color: theme.textSecondary }]}>
                  Custom icons can affect QR code scanning. Test your code after export.
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
      
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
    paddingVertical: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contentContainer: {
    gap: 12,
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
    marginTop: 0,
    marginBottom: 0,
  },
  previewWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    paddingRight: PREVIEW_ACTION_PADDING,
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  previewPlaceholderText: {
    fontSize: 13,
    textAlign: 'center',
  },
  previewActions: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    right: 20,
    width: PREVIEW_ACTION_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  previewActionsContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewActionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
    paddingHorizontal: 12,
    flex: 1,
  },
  previewActionTop: {
    borderBottomWidth: 1,
  },
  previewActionMiddle: {
    borderBottomWidth: 1,
  },
  previewActionBottom: {},
  previewActionDivider: {
    height: 2,
    opacity: 0.8,
  },
  previewActionPrimary: {
    borderTopWidth: 0,
  },
  previewActionDisabled: {
    opacity: 0.6,
  },
  previewActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  copyFeedbackToast: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  copyFeedbackText: {
    fontSize: 13,
  },
  previewWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 0,
  },
  previewWarningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  previewWarningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  designTabWrapper: {
    position: 'relative',
    paddingBottom: 0,
  },
  designTabLocked: {
    paddingBottom: 110,
  },
  premiumOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  premiumOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
