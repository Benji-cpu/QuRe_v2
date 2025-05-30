import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import QRCodePreview from '../components/QRCodePreview';
import { GRADIENT_PRESETS } from '../constants/Gradients';
import { QRStorage } from '../services/QRStorage';
import { UserPreferencesService } from '../services/UserPreferences';
import { QRCodeData } from '../types/QRCode';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WallpaperScreen() {
  const insets = useSafeAreaInsets();
  const wallpaperRef = useRef<View>(null);
  
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [primaryQR, setPrimaryQR] = useState<QRCodeData | null>(null);
  const [secondaryQR, setSecondaryQR] = useState<QRCodeData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(true);

  useEffect(() => {
    loadUserData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadUserData = async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      
      const gradientIndex = GRADIENT_PRESETS.findIndex(g => g.id === preferences.selectedGradientId);
      setCurrentGradientIndex(gradientIndex >= 0 ? gradientIndex : 0);
      setIsPremium(premium);

      if (preferences.primaryQRCodeId) {
        const primaryQRData = await QRStorage.getQRCodeById(preferences.primaryQRCodeId);
        setPrimaryQR(primaryQRData);
      }

      if (preferences.secondaryQRCodeId && premium) {
        const secondaryQRData = await QRStorage.getQRCodeById(preferences.secondaryQRCodeId);
        setSecondaryQR(secondaryQRData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (Math.abs(event.velocityX) > Math.abs(event.velocityY)) {
        if (event.velocityX > 500) {
          setCurrentGradientIndex((prev) => 
            prev > 0 ? prev - 1 : GRADIENT_PRESETS.length - 1
          );
        } else if (event.velocityX < -500) {
          setCurrentGradientIndex((prev) => 
            prev < GRADIENT_PRESETS.length - 1 ? prev + 1 : 0
          );
        }
      }
    });

  useEffect(() => {
    const updateGradientPreference = async () => {
      try {
        await UserPreferencesService.updateGradient(GRADIENT_PRESETS[currentGradientIndex].id);
      } catch (error) {
        console.error('Error updating gradient preference:', error);
      }
    };
    updateGradientPreference();
  }, [currentGradientIndex]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const handleExportWallpaper = async () => {
    try {
      setShowActionButtons(false);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save photos');
        setShowActionButtons(true);
        return;
      }

      const uri = await captureRef(wallpaperRef, {
        format: 'png',
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Wallpaper saved to your photos!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save wallpaper');
      console.error('Export error:', error);
    } finally {
      setShowActionButtons(true);
    }
  };

  const handleSettings = () => {
    router.push('/modal/settings');
  };

  const handleQRSlotPress = (slot: 'primary' | 'secondary') => {
    if (slot === 'secondary' && !isPremium) {
      router.push('/modal/premium');
      return;
    }

    const existingQR = slot === 'primary' ? primaryQR : secondaryQR;
    
    if (existingQR) {
      router.push({
        pathname: '/modal/view',
        params: { id: existingQR.id, returnTo: 'wallpaper' }
      });
    } else {
      router.push({
        pathname: '/modal/create',
        params: { slot, returnTo: 'wallpaper' }
      });
    }
  };

  const currentGradient = GRADIENT_PRESETS[currentGradientIndex];

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.container}>
          <View ref={wallpaperRef} collapsable={false} style={styles.wallpaperContainer}>
            <LinearGradient
              colors={currentGradient.colors}
              start={currentGradient.start}
              end={currentGradient.end}
              style={styles.gradient}
            >
              <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.appTitle}>QuRe</Text>
              </View>

              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
              </View>

              {showActionButtons && (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity style={styles.actionCard} onPress={handleExportWallpaper}>
                    <View style={styles.actionIconContainer}>
                      <Text style={styles.actionIcon}>⬇</Text>
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Export Wallpaper</Text>
                      <Text style={styles.actionSubtitle}>Save to your photos</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionCard} onPress={handleSettings}>
                    <View style={styles.actionIconContainer}>
                      <Text style={styles.actionIcon}>⚙️</Text>
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Settings</Text>
                      <Text style={styles.actionSubtitle}>Backgrounds & Plan Status</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <View style={[styles.qrSlotsContainer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity 
                  style={styles.qrSlot} 
                  onPress={() => handleQRSlotPress('primary')}
                >
                  {primaryQR ? (
                    <View style={styles.qrContent}>
                      <View style={styles.qrCodeContainer}>
                        <QRCodePreview value={primaryQR.content} size={80} />
                      </View>
                      <Text style={styles.qrLabel}>{primaryQR.label}</Text>
                    </View>
                  ) : (
                    <View style={styles.qrPlaceholder}>
                      <Text style={styles.qrPlaceholderIcon}>+</Text>
                      <Text style={styles.qrPlaceholderText}>CREATE QR CODE</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.qrSlot} 
                  onPress={() => handleQRSlotPress('secondary')}
                >
                  {secondaryQR && isPremium ? (
                    <View style={styles.qrContent}>
                      <View style={styles.qrCodeContainer}>
                        <QRCodePreview value={secondaryQR.content} size={80} />
                      </View>
                      <Text style={styles.qrLabel}>{secondaryQR.label}</Text>
                    </View>
                  ) : (
                    <View style={[styles.qrPlaceholder, !isPremium && styles.qrPlaceholderPremium]}>
                      <Text style={styles.qrPlaceholderIcon}>+</Text>
                      <Text style={styles.qrPlaceholderText}>
                        {isPremium ? 'CREATE QR CODE' : 'PREMIUM SLOT'}
                      </Text>
                      {!isPremium && (
                        <Text style={styles.premiumBadge}>PRO</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {!showActionButtons && (
                <View style={styles.debugInfo}>
                  <Text style={styles.gradientName}>{currentGradient.name}</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wallpaperContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  timeText: {
    fontSize: 72,
    fontWeight: '200',
    color: 'white',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  qrSlotsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 20,
  },
  qrSlot: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  qrContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  qrLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  qrPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
  qrPlaceholderPremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  qrPlaceholderIcon: {
    fontSize: 32,
    color: 'white',
    marginBottom: 5,
  },
  qrPlaceholderText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 1,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  gradientName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});