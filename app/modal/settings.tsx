import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GRADIENT_PRESETS } from '../../constants/Gradients';
import { Layout } from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { EngagementPricingService } from '../../services/EngagementPricingService';
import { IAPService } from '../../services/IAPService';
import { navigationService } from '../../services/NavigationService';
import { UserPreferencesService } from '../../services/UserPreferences';

export default function SettingsModal() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = Platform.OS === 'ios' ? 12 : insets.top + 12;
  const { theme, mode, toggleTheme } = useTheme();
  const [selectedGradientId, setSelectedGradientId] = useState('royal');
  const [isPremium, setIsPremium] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [qrSlotMode, setQrSlotMode] = useState<'single' | 'double'>('double');
  const [isRestoring, setIsRestoring] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<'gradient' | 'custom'>('gradient');
  const [showShareButton, setShowShareButton] = useState(false);

  useEffect(() => {
    loadSettings();
    EngagementPricingService.trackAction('settingsOpened');

    return () => {
      navigationService.clearModalState('/modal/settings');
    };
  }, []);

  const loadSettings = async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      setSelectedGradientId(preferences.selectedGradientId);
      setIsPremium(premium);
      setShowTitle(preferences.showTitle ?? true);
      setQrSlotMode(preferences.qrSlotMode || 'double');
      setShowShareButton(preferences.showShareButton ?? false);
      
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
      navigationService.navigateToPremium();
      return;
    }
    try {
      setShowTitle(value);
      await UserPreferencesService.updateShowTitle(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update title visibility');
    }
  };

  const handleShowShareButtonToggle = async (value: boolean) => {
    try {
      setShowShareButton(value);
      await UserPreferencesService.updateShowShareButton(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update share button visibility');
    }
  };

  const handleQRSlotModeChange = async (mode: 'single' | 'double') => {
    if (!isPremium) {
      navigationService.navigateToPremium();
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
      navigationService.navigateToPremium();
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

  const handlePremiumToggle = async (value: boolean) => {
    try {
      await UserPreferencesService.setPremium(value);
      setIsPremium(value);
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
    navigationService.navigateToPremium();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[
        styles.header, 
        { 
          backgroundColor: theme.surface, 
          borderBottomColor: theme.border, 
          paddingTop: headerTopPadding, 
          paddingBottom: Layout.spacing.headerPadding 
        }
      ]}>
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
          { paddingBottom: insets.bottom + Layout.spacing.sectionSpacing }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 0 }]}>Background</Text>
        
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
                navigationService.navigateToPremium();
                return;
              }
              
              // Switch to custom photo mode
              setBackgroundType('custom');
              await UserPreferencesService.updateBackgroundType('custom');
              
              // If no custom background is stored, prompt to upload one
              if (!customBackground) {
                // Optional: Automatically open the image picker
                // handleUploadBackground();
              }
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
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={Platform.OS === 'android' ? theme.primaryText : undefined}
            />
          </Pressable>

          <View style={[styles.settingDivider, { backgroundColor: theme.borderLight }]} />

          <Pressable
            style={styles.settingRow}
            onPress={() => handleShowShareButtonToggle(!showShareButton)}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Show Share Button</Text>
              </View>
            </View>
            <Switch
              value={showShareButton}
              onValueChange={handleShowShareButtonToggle}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={Platform.OS === 'android' ? theme.primaryText : undefined}
            />
          </Pressable>

          <View style={[styles.settingDivider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.qrModeContainer}>
            <View style={styles.settingTitleRow}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>QR Code Layout</Text>
              {!isPremium && <Text style={[styles.lockIcon, { color: theme.textTertiary }]}>🔒</Text>}
            </View>
            <View style={styles.qrModeButtons}>
              <Pressable
                style={[
                  styles.buttonBase,
                  styles.qrModeButton,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  qrSlotMode === 'single' && isPremium && [styles.qrModeButtonActive, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]
                ]}
                onPress={() => handleQRSlotModeChange('single')}
              >
                <Text style={[
                  styles.buttonText,
                  styles.qrModeButtonText,
                  { color: theme.textSecondary },
                  qrSlotMode === 'single' && isPremium && [styles.qrModeButtonTextActive, { color: theme.primary }]
                ]}>
                  Single QR
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.buttonBase,
                  styles.qrModeButton,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  qrSlotMode === 'double' && isPremium && [styles.qrModeButtonActive, { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }]
                ]}
                onPress={() => handleQRSlotModeChange('double')}
              >
                <Text style={[
                  styles.buttonText,
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
          <View style={styles.planRow}>
            <View style={styles.planDetails}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </Text>
            </View>

            <View style={styles.planActions}>
              {!isPremium && (
                <Pressable 
                  style={[
                    styles.buttonBase,
                    styles.planActionButton,
                    styles.upgradeAction,
                    { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }
                  ]}
                  onPress={handleUpgrade}
                >
                  <Text style={[styles.buttonText, styles.planActionButtonText, { color: theme.primary }]}>Upgrade</Text>
                </Pressable>
              )}
              
              <Pressable 
                style={[
                  styles.buttonBase,
                  styles.planActionButton,
                  styles.restoreAction,
                  { borderColor: theme.primary, backgroundColor: theme.surfaceVariant },
                  isRestoring && styles.disabledButton
                ]}
                onPress={handleRestorePurchase}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Text style={[styles.buttonText, styles.planActionButtonText, styles.restoreActionText, { color: theme.primary }]}>Restore</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Layout.spacing.sectionSpacing, color: theme.text }]}>Developer Options</Text>
        
        <View style={[styles.settingsContainer, styles.devOptionsContainer, { backgroundColor: theme.surface }]}>
          <Pressable 
            style={styles.settingRow} 
            onPress={() => handlePremiumToggle(!isPremium)}
            android_ripple={{ color: theme.overlay }}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Premium Access (Test)</Text>
              </View>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Turn premium features on or off for testing purposes
              </Text>
            </View>
            <Switch
              value={isPremium}
              onValueChange={handlePremiumToggle}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={Platform.OS === 'android' ? theme.primaryText : undefined}
            />
          </Pressable>

          <View style={[styles.settingDivider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Show Onboarding</Text>
              </View>
            </View>
            <Pressable 
              style={[
                styles.buttonBase,
                styles.settingActionButton,
                { borderColor: theme.primary, backgroundColor: theme.surfaceVariant }
              ]}
              onPress={handleShowOnboarding}
              android_ripple={{ color: theme.overlay }}
            >
              <Text style={[styles.buttonText, styles.settingActionButtonText, { color: theme.primary }]}>Launch</Text>
            </Pressable>
          </View>

          {__DEV__ && (
            <>
              <View style={[styles.settingDivider, { backgroundColor: theme.borderLight }]} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Text style={[styles.settingTitle, { color: theme.text }]}>Reset App Data</Text>
                  </View>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Clear all stored data and reset to fresh install state
                  </Text>
                </View>
                <Pressable 
                  style={[
                    styles.buttonBase,
                    styles.settingActionButton,
                    { borderColor: theme.error, backgroundColor: theme.surfaceVariant }
                  ]}
                  onPress={async () => {
                    Alert.alert(
                      'Reset App Data',
                      'This will clear all your data including QR codes, preferences, and settings. The app will reload to a fresh state. Continue?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Reset',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              // Clear all data first
                              await UserPreferencesService.clearAllData();
                              
                              // Close the settings modal immediately
                              router.dismissAll();
                              
                              // Small delay to ensure AsyncStorage operations complete
                              await new Promise(resolve => setTimeout(resolve, 300));
                              
                              // Force a full app reload to ensure all state is reset
                              // This ensures components remount and fresh data is loaded
                              try {
                                // Use Updates.reloadAsync() for a full JS bundle reload
                                // This works in both dev and prod, ensuring complete state reset
                                if (Updates.isEnabled) {
                                  await Updates.reloadAsync();
                                } else {
                                  // Fallback for dev mode: navigate with timestamp to force remount
                                  console.log('Updates not enabled, using navigation with timestamp');
                                  router.replace(`/?reset=${Date.now()}`);
                                }
                              } catch (reloadError) {
                                // Final fallback: navigate to root
                                console.log('Reload failed, using navigation fallback:', reloadError);
                                router.replace(`/?reset=${Date.now()}`);
                              }
                            } catch (error) {
                              Alert.alert('Error', 'Failed to clear app data. Please try again.');
                              console.error('Error clearing data:', error);
                            }
                          }
                        }
                      ]
                    );
                  }}
                  android_ripple={{ color: theme.overlay }}
                >
                  <Text style={[styles.buttonText, styles.settingActionButtonText, { color: theme.error }]}>Reset</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonBase: {
    minHeight: 44,
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingVertical: 12,
    borderRadius: Layout.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Layout.spacing.small,
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingVertical: Layout.spacing.headerPadding,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    ...Layout.typography.header,
    marginLeft: 0,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.screenPadding,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    ...Layout.typography.section,
    marginBottom: Layout.spacing.xsmall,
    marginTop: 6, // Kept slightly different for first element visual balance, but generally standardized
  },
  gradientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Layout.spacing.small,
    marginBottom: 6,
  },
  gradientOption: {
    flexBasis: '23%',
    maxWidth: '23%',
    aspectRatio: 9 / 16,
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 2,
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
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customBackgroundContainer: {
    marginBottom: 6,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.small,
    borderRadius: Layout.borderRadius.medium,
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
    borderRadius: Layout.borderRadius.small,
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
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: 6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.small,
  },
  settingTitle: {
    ...Layout.typography.subtitle,
  },
  settingDescription: {
    ...Layout.typography.body,
    marginTop: 4,
  },
  settingDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  settingActionButton: {
    minWidth: 112,
  },
  settingActionButtonText: {
  },
  qrModeContainer: {
    padding: 14,
  },
  qrModeButtons: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  qrModeButton: {
    flex: 1,
    borderWidth: 2,
  },
  qrModeButtonActive: {
  },
  qrModeButtonText: {
  },
  qrModeButtonTextActive: {
  },
  planContainer: {
    borderRadius: Layout.borderRadius.medium,
    padding: 14,
    marginBottom: 6,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Layout.spacing.small,
  },
  planDetails: {
    flexShrink: 1,
    flexBasis: '50%',
    maxWidth: '50%',
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flex: 1,
  },
  planActionButton: {
    minWidth: 112,
  },
  planActionButtonText: {
  },
  upgradeAction: {
  },
  restoreAction: {
    borderWidth: 2,
  },
  restoreActionText: {
  },
  disabledButton: {
    opacity: 0.6,
  },
  devOptionsContainer: {
    marginBottom: 6,
  },
  backgroundTypeSwitcher: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  backgroundTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.small,
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
    ...Layout.typography.subtitle,
    marginBottom: 10,
  },
  customBackgroundLarge: {
    marginBottom: 6,
  },
  backgroundLargeThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: Layout.borderRadius.small,
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
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  uploadHint: {
    ...Layout.typography.caption,
    textAlign: 'center',
    marginTop: 10,
  },
  noBackgroundText: {
    ...Layout.typography.body,
    textAlign: 'center',
    marginTop: 10,
  },
});
