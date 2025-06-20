import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GRADIENT_PRESETS } from '../../constants/Gradients';
import { EngagementPricingService } from '../../services/EngagementPricingService';
import { IAPService } from '../../services/IAPService';
import { UserPreferencesService } from '../../services/UserPreferences';

export default function SettingsModal() {
  const insets = useSafeAreaInsets();
  const [selectedGradientId, setSelectedGradientId] = useState('sunset');
  const [isPremium, setIsPremium] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [qrSlotMode, setQrSlotMode] = useState<'single' | 'double'>('double');
  const [isRestoring, setIsRestoring] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    EngagementPricingService.trackAction('settingsOpened');
  }, []);

  const loadSettings = async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      setSelectedGradientId(preferences.selectedGradientId);
      setIsPremium(premium);
      setShowTitle(preferences.showTitle ?? true);
      setQrSlotMode(preferences.qrSlotMode || 'double');
      
      const customBg = await UserPreferencesService.getCustomBackground();
      setCustomBackground(customBg);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleGradientSelect = async (gradientId: string) => {
    try {
      setSelectedGradientId(gradientId);
      await UserPreferencesService.updateGradient(gradientId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update gradient');
    }
  };

  const handleShowTitleToggle = async (value: boolean) => {
    if (!isPremium) {
      router.push('/modal/premium');
      return;
    }
    try {
      setShowTitle(value);
      await UserPreferencesService.updateShowTitle(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update title visibility');
    }
  };

  const handleQRSlotModeChange = async (mode: 'single' | 'double') => {
    if (!isPremium) {
      router.push('/modal/premium');
      return;
    }
    try {
      setQrSlotMode(mode);
      await UserPreferencesService.updateQRSlotMode(mode);
    } catch (error) {
      Alert.alert('Error', 'Failed to update QR slot mode');
    }
  };

  const handleUploadBackground = async () => {
    if (!isPremium) {
      router.push('/modal/premium');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 1,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.width < asset.height * 0.5 || asset.width > asset.height * 0.7) {
          Alert.alert(
            'Invalid Image Dimensions',
            'Please select a portrait image (9:16 ratio recommended)',
            [{ text: 'OK' }]
          );
          return;
        }
        
        await UserPreferencesService.setCustomBackground(asset.uri);
        setCustomBackground(asset.uri);
        Alert.alert('Success', 'Custom background uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload background');
    }
  };

  const handleRestorePurchase = async () => {
    setIsRestoring(true);
    
    try {
      const purchases = await IAPService.restorePurchases();
      
      if (purchases.length > 0) {
        await UserPreferencesService.setPremium(true);
        setIsPremium(true);
        
        Alert.alert(
          'Purchase Restored!',
          'Your premium purchase has been successfully restored.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases found to restore. If you believe this is an error, please contact support.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'Failed to restore purchases. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePremiumToggle = async () => {
    try {
      const newStatus = !isPremium;
      await UserPreferencesService.setPremium(newStatus);
      setIsPremium(newStatus);
      Alert.alert('Success', `Premium status ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update premium status');
    }
  };

  const handleShowOnboarding = async () => {
    try {
      await UserPreferencesService.setOnboardingComplete(false);
      router.dismissAll();
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset onboarding');
    }
  };

  const handleUpgrade = () => {
    router.push('/modal/premium');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Background Gradients</Text>
        
        <View style={styles.gradientsGrid}>
          {GRADIENT_PRESETS.map((gradient) => (
            <Pressable
              key={gradient.id}
              style={[
                styles.gradientOption,
                selectedGradientId === gradient.id && styles.selectedGradient
              ]}
              onPress={() => handleGradientSelect(gradient.id)}
            >
              <LinearGradient
                colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
                start={gradient.start}
                end={gradient.end}
                style={styles.gradientPreview}
              />
              <Text style={styles.gradientName}>{gradient.name}</Text>
              {selectedGradientId === gradient.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Custom Background</Text>

        <View style={styles.customBackgroundContainer}>
          <TouchableOpacity 
            style={[styles.uploadButton, !isPremium && styles.lockedButton]}
            onPress={handleUploadBackground}
          >
            <Feather name="upload" size={20} color={isPremium ? "#2196f3" : "#999"} />
            <Text style={[styles.uploadButtonText, !isPremium && styles.lockedButtonText]}>
              Upload Custom Background
            </Text>
            {!isPremium && <Text style={styles.lockIcon}>🔒</Text>}
          </TouchableOpacity>
          
          {customBackground && (
            <View style={styles.customBackgroundPreview}>
              <Image 
                source={{ uri: customBackground }} 
                style={styles.backgroundThumbnail}
              />
              <TouchableOpacity
                style={styles.removeBackgroundButton}
                onPress={async () => {
                  await UserPreferencesService.setCustomBackground(null);
                  setCustomBackground(null);
                }}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Display Settings</Text>
        
        <View style={styles.settingsContainer}>
          <Pressable 
            style={styles.settingRow} 
            onPress={() => handleShowTitleToggle(!showTitle)}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingTitle}>Show QuRe Branding</Text>
                {!isPremium && <Text style={styles.lockIcon}>🔒</Text>}
              </View>
              <Text style={styles.settingDescription}>
                {isPremium ? 'Display QuRe branding on wallpaper' : 'Premium feature - Upgrade to toggle'}
              </Text>
            </View>
            <Switch
              value={isPremium && showTitle}
              onValueChange={handleShowTitleToggle}
              trackColor={{ false: '#ddd', true: '#2196f3' }}
              thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
              disabled={!isPremium}
            />
          </Pressable>

          <View style={styles.settingDivider} />

          <View style={styles.qrModeContainer}>
            <View style={styles.settingTitleRow}>
              <Text style={styles.settingTitle}>QR Code Layout</Text>
              {!isPremium && <Text style={styles.lockIcon}>🔒</Text>}
            </View>
            <Text style={styles.settingDescription}>
              {isPremium ? 'Choose number of QR codes' : 'Premium feature - Upgrade to customize'}
            </Text>
            <View style={styles.qrModeButtons}>
              <Pressable
                style={[
                  styles.qrModeButton,
                  qrSlotMode === 'single' && isPremium && styles.qrModeButtonActive
                ]}
                onPress={() => handleQRSlotModeChange('single')}
              >
                <Text style={[
                  styles.qrModeButtonText,
                  qrSlotMode === 'single' && isPremium && styles.qrModeButtonTextActive
                ]}>
                  Single QR
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.qrModeButton,
                  qrSlotMode === 'double' && isPremium && styles.qrModeButtonActive
                ]}
                onPress={() => handleQRSlotModeChange('double')}
              >
                <Text style={[
                  styles.qrModeButtonText,
                  qrSlotMode === 'double' && isPremium && styles.qrModeButtonTextActive
                ]}>
                  Double QR
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Plan Status</Text>
        
        <View style={styles.planContainer}>
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </Text>
            <Text style={styles.planStatus}>
              Premium: <Text style={styles.planStatusValue}>{isPremium ? 'YES' : 'NO'}</Text>
            </Text>
            <Text style={styles.planDescription}>
              {isPremium 
                ? 'You have access to all features including secondary QR codes and custom backgrounds.'
                : 'Upgrade to Premium for unlimited QR codes and advanced customization options.'
              }
            </Text>
          </View>
          
          {!isPremium && (
            <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </Pressable>
          )}
          
          <Pressable 
            style={[styles.restoreButton, isRestoring && styles.disabledButton]}
            onPress={handleRestorePurchase}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color="#2196f3" />
            ) : (
              <Text style={styles.restoreButtonText}>Restore Purchase</Text>
            )}
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Developer Options</Text>
        
        <View style={styles.devOptionsContainer}>
          <Pressable 
            style={styles.devOption} 
            onPress={handlePremiumToggle}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <Text style={styles.devOptionText}>
              {isPremium ? 'Disable Premium (Test)' : 'Enable Premium (Test)'}
            </Text>
          </Pressable>
          
          <Pressable 
            style={styles.devOption} 
            onPress={handleShowOnboarding}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <Text style={styles.devOptionText}>Show Onboarding</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  gradientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  gradientOption: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedGradient: {
    borderColor: '#2196f3',
  },
  gradientPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientName: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  customBackgroundContainer: {
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
  },
  lockedButton: {
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196f3',
  },
  lockedButtonText: {
    color: '#999',
  },
  lockIcon: {
    fontSize: 14,
    marginLeft: 5,
  },
  customBackgroundPreview: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backgroundThumbnail: {
    width: 80,
    height: 140,
    borderRadius: 8,
  },
  removeBackgroundButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f44336',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginTop: 4,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  qrModeContainer: {
    padding: 20,
  },
  qrModeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  qrModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  qrModeButtonActive: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  qrModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  qrModeButtonTextActive: {
    color: '#2196f3',
  },
  planContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  planInfo: {
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  planStatus: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  planStatusValue: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restoreButton: {
    borderWidth: 2,
    borderColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  devOptionsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  devOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  devOptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});