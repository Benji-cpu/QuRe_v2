import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GRADIENT_PRESETS } from '../../constants/Gradients';
import { useTheme } from '../../contexts/ThemeContext';
import { EngagementPricingService } from '../../services/EngagementPricingService';
import { IAPService } from '../../services/IAPService';
import { UserPreferencesService } from '../../services/UserPreferences';

export default function SettingsModal() {
  const insets = useSafeAreaInsets();
  const { theme, mode, toggleTheme } = useTheme();
  const [selectedGradientId, setSelectedGradientId] = useState('sunset');
  const [isPremium, setIsPremium] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [qrSlotMode, setQrSlotMode] = useState<'single' | 'double'>('double');
  const [isRestoring, setIsRestoring] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<'gradient' | 'custom'>('gradient');

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
      
      // Force gradient mode for non-premium users
      if (!premium && preferences.backgroundType === 'custom') {
        setBackgroundType('gradient');
        await UserPreferencesService.updateBackgroundType('gradient');
      } else {
        setBackgroundType(preferences.backgroundType || 'gradient');
      }
      
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
      // Automatically switch to gradient mode when selecting a gradient
      if (backgroundType !== 'gradient') {
        setBackgroundType('gradient');
        await UserPreferencesService.updateBackgroundType('gradient');
      }
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Store the image and switch to custom background mode
        await UserPreferencesService.setCustomBackground(asset.uri);
        setCustomBackground(asset.uri);
        setBackgroundType('custom');
        await UserPreferencesService.updateBackgroundType('custom');
        
        // Calculate aspect ratio for informational purposes
        const imageAspectRatio = asset.width / asset.height;
        const screenAspectRatio = 9 / 16; // Portrait orientation
        
        // Allow some tolerance (±20%) for aspect ratio
        const tolerance = 0.20;
        const minRatio = screenAspectRatio * (1 - tolerance);
        const maxRatio = screenAspectRatio * (1 + tolerance);
        
        if (imageAspectRatio < minRatio || imageAspectRatio > maxRatio) {
          Alert.alert(
            'Image Set Successfully',
            `Your custom background has been set! Note: The image aspect ratio (${(imageAspectRatio).toFixed(2)}) differs from the ideal portrait ratio (0.56). The image will be scaled to fit.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Success', 'Custom background set successfully!');
        }
      }
    } catch (error) {
      console.error('Error uploading background:', error);
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
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: insets.top + 15 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Background</Text>
        
        {/* Background Type Switcher - Make it more prominent */}
        <View style={styles.backgroundTypeSwitcher}>
          <Pressable
            style={[
              styles.backgroundTypeButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
              backgroundType === 'gradient' && [styles.backgroundTypeButtonActive, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]
            ]}
            onPress={async () => {
              setBackgroundType('gradient');
              await UserPreferencesService.updateBackgroundType('gradient');
            }}
          >
            <Feather name="grid" size={20} color={backgroundType === 'gradient' ? theme.primary : theme.textSecondary} />
            <Text style={[
              styles.backgroundTypeButtonText,
              { color: theme.textSecondary },
              backgroundType === 'gradient' && [styles.backgroundTypeButtonTextActive, { color: theme.primary }]
            ]}>
              Gradients
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.backgroundTypeButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
              backgroundType === 'custom' && isPremium && [styles.backgroundTypeButtonActive, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }],
              !isPremium && [styles.backgroundTypeButtonLocked, { backgroundColor: theme.surfaceVariant, borderColor: theme.borderLight }]
            ]}
            onPress={async () => {
              if (!isPremium) {
                router.push('/modal/premium');
                return;
              }
              // Premium users can always access custom photo tab
              setBackgroundType('custom');
              await UserPreferencesService.updateBackgroundType('custom');
            }}
          >
            <Feather name="image" size={20} color={backgroundType === 'custom' && isPremium ? theme.primary : theme.textSecondary} />
            <Text style={[
              styles.backgroundTypeButtonText,
              { color: theme.textSecondary },
              backgroundType === 'custom' && isPremium && [styles.backgroundTypeButtonTextActive, { color: theme.primary }],
              !isPremium && [styles.backgroundTypeButtonTextLocked, { color: theme.textTertiary }]
            ]}>
              Custom Photo
            </Text>
            {!isPremium && <Text style={[styles.lockIcon, { color: theme.textTertiary }]}>🔒</Text>}
          </Pressable>
        </View>

        {/* Upload button - Only visible in custom photo mode for premium users */}
        {backgroundType === 'custom' && isPremium && (
          <View style={styles.customBackgroundContainer}>
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
              onPress={handleUploadBackground}
            >
              <Feather name="upload" size={20} color={theme.primary} />
              <Text style={[styles.uploadButtonText, { color: theme.primary }]}>
                {customBackground ? 'Change Custom Background' : 'Upload Custom Background'}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>
              For best results, use a portrait image
            </Text>
          </View>
        )}

        {backgroundType === 'gradient' ? (
          <>
            <Text style={[styles.subsectionTitle, { color: theme.text }]}>Select Gradient</Text>
            <View style={styles.gradientsGrid}>
              {GRADIENT_PRESETS.map((gradient) => (
                <Pressable
                  key={gradient.id}
                  style={[
                    styles.gradientOption,
                    selectedGradientId === gradient.id && [styles.selectedGradient, { borderColor: theme.primary }]
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
                    <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.subsectionTitle, { color: theme.text }]}>Current Background</Text>
            {customBackground ? (
              <View style={styles.customBackgroundLarge}>
                <Image 
                  source={{ uri: customBackground }} 
                  style={styles.backgroundLargeThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.customBackgroundActions}>
                  <TouchableOpacity
                    style={[styles.replaceButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
                    onPress={handleUploadBackground}
                  >
                    <Feather name="refresh-cw" size={16} color={theme.primary} />
                    <Text style={[styles.replaceButtonText, { color: theme.primary }]}>Replace</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: theme.surface, borderColor: theme.error }]}
                    onPress={async () => {
                      Alert.alert(
                        'Remove Custom Background',
                        'Are you sure you want to remove your custom background?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Remove', 
                            style: 'destructive',
                            onPress: async () => {
                              await UserPreferencesService.setCustomBackground(null);
                              setCustomBackground(null);
                              setBackgroundType('gradient');
                              await UserPreferencesService.updateBackgroundType('gradient');
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Feather name="trash-2" size={16} color={theme.error} />
                    <Text style={[styles.removeButtonText, { color: theme.error }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={[styles.noBackgroundText, { color: theme.textSecondary }]}>No custom background uploaded</Text>
            )}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Display Settings</Text>
        
        <View style={[styles.settingsContainer, { backgroundColor: theme.surface }]}>
          <Pressable 
            style={styles.settingRow} 
            onPress={toggleTheme}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Dark Mode</Text>
              </View>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={Platform.OS === 'android' ? theme.primaryText : undefined}
            />
          </Pressable>

          <View style={[styles.settingDivider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.settingDivider} />

          <View style={styles.qrModeContainer}>
            <View style={styles.settingTitleRow}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>QR Code Layout</Text>
              {!isPremium && <Text style={[styles.lockIcon, { color: theme.textTertiary }]}>🔒</Text>}
            </View>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              {isPremium ? 'Choose number of QR codes' : 'Premium feature - Upgrade to customize'}
            </Text>
            <View style={styles.qrModeButtons}>
              <Pressable
                style={[
                  styles.qrModeButton,
                  { borderColor: theme.border },
                  qrSlotMode === 'single' && isPremium && [styles.qrModeButtonActive, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]
                ]}
                onPress={() => handleQRSlotModeChange('single')}
              >
                <Text style={[
                  styles.qrModeButtonText,
                  { color: theme.textSecondary },
                  qrSlotMode === 'single' && isPremium && [styles.qrModeButtonTextActive, { color: theme.primary }]
                ]}>
                  Single QR
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.qrModeButton,
                  { borderColor: theme.border },
                  qrSlotMode === 'double' && isPremium && [styles.qrModeButtonActive, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]
                ]}
                onPress={() => handleQRSlotModeChange('double')}
              >
                <Text style={[
                  styles.qrModeButtonText,
                  { color: theme.textSecondary },
                  qrSlotMode === 'double' && isPremium && [styles.qrModeButtonTextActive, { color: theme.primary }]
                ]}>
                  Double QR
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Plan Status</Text>
        
        <View style={[styles.planContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.planInfo}>
            <Text style={[styles.planTitle, { color: theme.text }]}>
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </Text>
            <Text style={[styles.planStatus, { color: theme.textSecondary }]}>
              Premium: <Text style={[styles.planStatusValue, { color: theme.primary }]}>{isPremium ? 'YES' : 'NO'}</Text>
            </Text>
            <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
              {isPremium 
                ? 'You have access to all features including secondary QR codes and custom backgrounds.'
                : 'Upgrade to Premium for unlimited QR codes and advanced customization options.'
              }
            </Text>
          </View>
          
          {!isPremium && (
            <Pressable style={[styles.upgradeButton, { backgroundColor: theme.primary }]} onPress={handleUpgrade}>
              <Text style={[styles.upgradeButtonText, { color: theme.primaryText }]}>Upgrade to Premium</Text>
            </Pressable>
          )}
          
          <Pressable 
            style={[styles.restoreButton, { borderColor: theme.primary }, isRestoring && styles.disabledButton]}
            onPress={handleRestorePurchase}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={[styles.restoreButtonText, { color: theme.primary }]}>Restore Purchase</Text>
            )}
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20, color: theme.text }]}>Developer Options</Text>
        
                  <View style={styles.devOptionsContainer}>
          <Pressable 
            style={[styles.devOption, { backgroundColor: theme.surface }]} 
            onPress={handlePremiumToggle}
            android_ripple={{ color: theme.overlay }}
          >
            <Text style={[styles.devOptionText, { color: theme.textSecondary }]}>
              {isPremium ? 'Disable Premium (Test)' : 'Enable Premium (Test)'}
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.devOption, { backgroundColor: theme.surface }]} 
            onPress={handleShowOnboarding}
            android_ripple={{ color: theme.overlay }}
          >
            <Text style={[styles.devOptionText, { color: theme.textSecondary }]}>Show Onboarding</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 0,
    flex: 1,
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
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  lockedButton: {
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
  },
  settingDivider: {
    height: 1,
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
    alignItems: 'center',
  },
  qrModeButtonActive: {
  },
  qrModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  qrModeButtonTextActive: {
  },
  planContainer: {
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
    marginBottom: 5,
  },
  planStatus: {
    fontSize: 16,
    marginBottom: 10,
  },
  planStatusValue: {
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restoreButton: {
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
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
    borderRadius: 8,
    padding: 15,
  },
  devOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  backgroundTypeSwitcher: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  backgroundTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    position: 'relative',
  },
  backgroundTypeButtonActive: {
  },
  backgroundTypeButtonLocked: {
    opacity: 0.7,
  },
  backgroundTypeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  backgroundTypeButtonTextActive: {
  },
  backgroundTypeButtonTextLocked: {
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  customBackgroundLarge: {
    marginBottom: 20,
  },
  backgroundLargeThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  customBackgroundActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  replaceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  uploadHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  noBackgroundText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});