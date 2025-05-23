import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { QRCodePreview } from '../../components/QRCodePreview';
import { AdvancedOptions, ColorPicker, GradientSelector } from '../../components/design';
import {
  EmailQR,
  LinkQR,
  PhoneQR,
  SMSQR,
  TextQR,
  VCardQR,
  WhatsAppQR
} from '../../components/qr-types';
import { Colors } from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { QR_TYPES } from '../../constants/QRTypes';
import { PremiumContext } from '../../context/PremiumContext';
import { QRCodeContext } from '../../context/QRCodeContext';
import { QRCode, QRCodeType } from '../../types/qr-code';
import { createDefaultQRCode } from '../../utils/qrUtils';

export default function CreateQRModal() {
  const {
    activeQRCode,
    setActiveQRCode,
    activeQRType,
    setActiveQRType,
    activeDesign,
    updateActiveDesign,
    saveQRCode,
    qrHistory,
  } = useContext(QRCodeContext);
  
  const { checkFeatureAccess } = useContext(PremiumContext);
  
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [canUseAdvancedStyles, setCanUseAdvancedStyles] = useState(false);
  const [canUseAllGradients, setCanUseAllGradients] = useState(false);
  
  const params = useLocalSearchParams<{ id?: string }>();
  
  useEffect(() => {
    const loadQRCode = async () => {
      if (params.id) {
        const qrCode = qrHistory.find(code => code.id === params.id);
        if (qrCode) {
          setActiveQRCode(qrCode);
          setActiveQRType(qrCode.type);
        }
      }
    };
    
    loadQRCode();
  }, [params.id, qrHistory, setActiveQRCode, setActiveQRType]);
  
  useEffect(() => {
    const checkPremiumFeatures = async () => {
      const advancedStylesAccess = await checkFeatureAccess('advancedStyles');
      const allGradientsAccess = await checkFeatureAccess('allGradients');
      
      setCanUseAdvancedStyles(advancedStylesAccess);
      setCanUseAllGradients(allGradientsAccess);
    };
    
    checkPremiumFeatures();
  }, [checkFeatureAccess]);
  
  const handleSelectType = () => {
    router.push('/modal/type-selection');
  };
  
  const handleTabChange = (tab: 'content' | 'design') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };
  
  const handleSaveQRCode = async (qrCode: QRCode) => {
    try {
      await saveQRCode({
        ...qrCode,
        design: activeDesign,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error saving QR code:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const renderTypeSelector = () => {
    const selectedType = QR_TYPES.find(type => type.type === activeQRType);
    
    return (
      <TouchableOpacity
        style={styles.typeSelector}
        onPress={handleSelectType}
      >
        {selectedType ? (
          <>
            <Feather
              name={selectedType.icon as any}
              size={18}
              color={Colors.primary}
              style={styles.typeIcon}
            />
            <Text style={styles.typeText}>{selectedType.label}</Text>
          </>
        ) : (
          <Text style={styles.typeText}>Select QR Type</Text>
        )}
        <Feather name="chevron-right" size={18} color="#777" />
      </TouchableOpacity>
    );
  };
  
  const renderContentForm = () => {
    // If no type is selected, show a message
    if (!activeQRType) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Select a QR code type to get started
          </Text>
          <TouchableOpacity
            style={styles.selectTypeButton}
            onPress={handleSelectType}
          >
            <Text style={styles.selectTypeButtonText}>Select Type</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Return the appropriate form based on the selected type
    switch (activeQRType) {
      case QRCodeType.TEXT:
        return (
          <TextQR
            initialData={activeQRCode as any}
            onSave={handleSaveQRCode}
            onCancel={handleCancel}
          />
        );
      case QRCodeType.LINK:
        return (
          <LinkQR
            initialData={activeQRCode as any}
            onSave={handleSaveQRCode}
            onCancel={handleCancel}
          />
        );
      case QRCodeType.EMAIL:
        return (
          <EmailQR
            initialData={activeQRCode as any}
            onSave={handleSaveQRCode}
            onCancel={handleCancel}
          />
        );
      case QRCodeType.PHONE:
        return (
          <PhoneQR
            initialData={activeQRCode as any}
            onSave={handleSaveQRCode}
            onCancel={handleCancel}
          />
        );
      case QRCodeType.SMS:
        return (
          <SMSQR
            initialData={activeQRCode as any}
            onSave={handleSaveQRCode}
            onCancel={handleCancel}
          />
        );
      case QRCodeType.WHATSAPP:
        return (
          <WhatsAppQR
            initialData={activeQRCode as any}
            onSave={handleSaveQRCode}
            onCancel={handleCancel}
          />
        );
      case QRCodeType.VCARD:
        return (
          <VCardQR
            initialData={activeQRCode as any}
            onSave={handleSaveQRCode}
            onCancel={handleCancel}
          />
        );
      default:
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Form for {activeQRType} coming soon
            </Text>
          </View>
        );
    }
  };
  
  const renderDesignForm = () => {
    return (
      <View style={styles.designForm}>
        <ColorPicker
          label="QR Code Color"
          value={activeDesign.color}
          onChange={(color) => updateActiveDesign({ color })}
        />
        
        <ColorPicker
          label="Background Color"
          value={activeDesign.backgroundColor}
          onChange={(color) => updateActiveDesign({ backgroundColor })}
          presets={['#FFFFFF', ...Colors.backgroundPresets.slice(1)]}
        />
        
        <GradientSelector
          enabled={activeDesign.gradient}
          onToggle={(gradient) => updateActiveDesign({ gradient })}
          startColor={activeDesign.gradientStartColor}
          endColor={activeDesign.gradientEndColor}
          onStartColorChange={(gradientStartColor) => updateActiveDesign({ gradientStartColor })}
          onEndColorChange={(gradientEndColor) => updateActiveDesign({ gradientEndColor })}
          premiumGradientsEnabled={canUseAllGradients}
        />
        
        <AdvancedOptions
          errorCorrectionLevel={activeDesign.errorCorrectionLevel}
          onErrorCorrectionChange={(errorCorrectionLevel) => updateActiveDesign({ errorCorrectionLevel })}
          quietZone={activeDesign.quietZone}
          onQuietZoneChange={(quietZone) => updateActiveDesign({ quietZone })}
        />
      </View>
    );
  };
  
  const renderMockQRCode = () => {
    if (!activeQRType) {
      // Return a placeholder
      return (
        <View style={styles.mockQRContainer}>
          <View style={styles.mockQR} />
        </View>
      );
    }
    
    // If we have an active QR code, use it for preview
    if (activeQRCode) {
      return (
        <View style={styles.previewContainer}>
          <QRCodePreview qrCode={activeQRCode} />
        </View>
      );
    }
    
    // Otherwise, create a mock QR code for preview
    const mockQRCode = {
      ...createDefaultQRCode(activeQRType),
      type: activeQRType,
      design: activeDesign,
      // Add type-specific fields based on QR type
      ...(activeQRType === QRCodeType.TEXT ? { content: 'Sample Text' } : {}),
      ...(activeQRType === QRCodeType.LINK ? { url: 'https://example.com' } : {}),
      ...(activeQRType === QRCodeType.EMAIL ? { email: 'example@example.com' } : {}),
      ...(activeQRType === QRCodeType.PHONE || activeQRType === QRCodeType.SMS || activeQRType === QRCodeType.WHATSAPP ? 
        { countryCode: '1', phoneNumber: '5551234567' } : {}),
      ...(activeQRType === QRCodeType.VCARD ? { firstName: 'John', lastName: 'Doe' } : {}),
    } as any;
    
    return (
      <View style={styles.previewContainer}>
        <QRCodePreview qrCode={mockQRCode} />
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        {renderMockQRCode()}
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'content' && styles.activeTab,
          ]}
          onPress={() => handleTabChange('content')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'content' && styles.activeTabText,
            ]}
          >
            Content
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'design' && styles.activeTab,
          ]}
          onPress={() => handleTabChange('design')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'design' && styles.activeTabText,
            ]}
          >
            Design
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'content' && (
          <>
            {renderTypeSelector()}
            {renderContentForm()}
          </>
        )}
        
        {activeTab === 'design' && renderDesignForm()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.l,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockQRContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockQR: {
    width: Layout.qrCode.previewSize,
    height: Layout.qrCode.previewSize,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    paddingVertical: Layout.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
  },
  activeTabText: {
    color: Colors.primary,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: Layout.spacing.l,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIcon: {
    marginRight: Layout.spacing.xs,
  },
  typeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: Layout.spacing.l,
  },
  selectTypeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderRadius: Layout.borderRadius.medium,
  },
  selectTypeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  designForm: {
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});