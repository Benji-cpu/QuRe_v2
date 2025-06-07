// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Linking, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { GRADIENT_PRESETS } from '../constants/Gradients';
import { EngagementPricingService } from '../services/EngagementPricingService';
import { QRStorage } from '../services/QRStorage';
import { UserPreferencesService } from '../services/UserPreferences';
import { QRCodeData } from '../types/QRCode';
import ActionCards from './components/home/ActionCards';
import GradientBackground from './components/home/GradientBackground';
import PositionSlider from './components/home/PositionSlider';
import QRSlots from './components/home/QRSlots';
import SwipeIndicator from './components/home/SwipeIndicator';
import TimeDisplay from './components/home/TimeDisplay';
import Onboarding from './components/Onboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_INDICATOR_KEY = '@qure_swipe_indicator_count';

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const wallpaperRef = useRef<View>(null);
  const sessionStartTime = useRef<number>(Date.now());
  
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [primaryQR, setPrimaryQR] = useState<QRCodeData | null>(null);
  const [secondaryQR, setSecondaryQR] = useState<QRCodeData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(true);
  const [qrVerticalOffset, setQrVerticalOffset] = useState(80);
  const [qrHorizontalOffset, setQrHorizontalOffset] = useState(0);
  const [qrScale, setQrScale] = useState(1);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const [showPositionSlider, setShowPositionSlider] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hideElementsForExport, setHideElementsForExport] = useState(false);
  const [sliderExpanded, setSliderExpanded] = useState(false);
  const [elementsOpacity] = useState(new Animated.Value(1));
  
  const gradientTransition = useSharedValue(0);

  const loadUserData = useCallback(async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      const hasCompletedOnboarding = await UserPreferencesService.hasCompletedOnboarding();
      
      const gradientIndex = GRADIENT_PRESETS.findIndex(g => g.id === preferences.selectedGradientId);
      setCurrentGradientIndex(gradientIndex >= 0 ? gradientIndex : 0);
      setIsPremium(premium);
      setQrVerticalOffset(preferences.qrVerticalOffset || 80);
      setQrHorizontalOffset(preferences.qrHorizontalOffset || 0);
      setQrScale(preferences.qrScale || 1);
      setShowOnboarding(!hasCompletedOnboarding);
      setShowPositionSlider(hasCompletedOnboarding);

      const swipeCount = await getSwipeIndicatorCount();
      setShowSwipeIndicator(hasCompletedOnboarding && swipeCount < 5);

      if (preferences.primaryQRCodeId) {
        const primaryQRData = await QRStorage.getQRCodeById(preferences.primaryQRCodeId);
        setPrimaryQR(primaryQRData);
      } else {
        setPrimaryQR(null);
      }

      if (preferences.secondaryQRCodeId && premium) {
        const secondaryQRData = await QRStorage.getQRCodeById(preferences.secondaryQRCodeId);
        setSecondaryQR(secondaryQRData);
      } else if (!premium) {
        setSecondaryQR(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const getSwipeIndicatorCount = async (): Promise<number> => {
    try {
      const countStr = await AsyncStorage.getItem(SWIPE_INDICATOR_KEY);
      return countStr ? parseInt(countStr) : 0;
    } catch {
      return 0;
    }
  };

  const incrementSwipeIndicatorCount = async () => {
    try {
      const count = await getSwipeIndicatorCount();
      await AsyncStorage.setItem(SWIPE_INDICATOR_KEY, (count + 1).toString());
    } catch (error) {
      console.error('Error incrementing swipe count:', error);
    }
  };

  useEffect(() => {
    loadUserData();
    checkForOffer();
  }, [loadUserData]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      sessionStartTime.current = Date.now();
      
      return () => {
        const sessionDuration = Date.now() - sessionStartTime.current;
        EngagementPricingService.trackSession(sessionDuration);
      };
    }, [loadUserData])
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkForOffer = async () => {
    try {
      const offer = await EngagementPricingService.determineOffer();
      if (offer && !isPremium) {
        setTimeout(() => {
          router.push('/modal/premium');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking for offer:', error);
    }
  };

  const changeGradient = (newIndex: number) => {
    setCurrentGradientIndex(newIndex);
    gradientTransition.value = withTiming(1, { duration: 200 }, () => {
      gradientTransition.value = 0;
    });
  };

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (Math.abs(event.velocityX) > Math.abs(event.velocityY)) {
        if (event.velocityX > 500) {
          runOnJS(changeGradient)(
            currentGradientIndex > 0 ? currentGradientIndex - 1 : GRADIENT_PRESETS.length - 1
          );
        } else if (event.velocityX < -500) {
          runOnJS(changeGradient)(
            currentGradientIndex < GRADIENT_PRESETS.length - 1 ? currentGradientIndex + 1 : 0
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

  const handleVerticalOffsetChange = async (value: number) => {
    try {
      setQrVerticalOffset(value);
      await UserPreferencesService.updateQRVerticalOffset(value);
    } catch (error) {
      console.error('Error updating vertical offset:', error);
    }
  };

  const handleHorizontalOffsetChange = async (value: number) => {
    try {
      setQrHorizontalOffset(value);
      await UserPreferencesService.updateQRHorizontalOffset(value);
    } catch (error) {
      console.error('Error updating horizontal offset:', error);
    }
  };

  const handleScaleChange = async (value: number) => {
    try {
      setQrScale(value);
      await UserPreferencesService.updateQRScale(value);
    } catch (error) {
      console.error('Error updating scale:', error);
    }
  };

  const handleSwipeFadeComplete = async () => {
    await incrementSwipeIndicatorCount();
    setShowSwipeIndicator(false);
  };

  const handleExportWallpaper = async () => {
    try {
      setShowActionButtons(false);
      setHideElementsForExport(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save photos');
        setShowActionButtons(true);
        setHideElementsForExport(false);
        return;
      }

      const uri = await captureRef(wallpaperRef, {
        format: 'png',
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      
      await EngagementPricingService.trackAction('wallpapersExported');
      
      const instructions = Platform.OS === 'ios' 
        ? '1. Open Photos app\n2. Find the wallpaper\n3. Tap Share button\n4. Select "Use as Wallpaper"\n5. Choose "Set"'
        : '1. Open Gallery/Photos app\n2. Find the wallpaper\n3. Tap menu (3 dots)\n4. Select "Set as wallpaper"\n5. Choose "Lock screen"';
      
      Alert.alert(
        'Wallpaper Saved!',
        `Your wallpaper has been saved to photos.\n\nTo set as wallpaper:\n${instructions}`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Open Photos', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('photos-redirect://');
              } else {
                Linking.openURL('content://media/internal/images/media');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save wallpaper');
      console.error('Export error:', error);
    } finally {
      setShowActionButtons(true);
      setHideElementsForExport(false);
    }
  };

  const handleSettings = async () => {
    await EngagementPricingService.trackAction('settingsOpened');
    router.push('/modal/settings');
  };

  const handleQRSlotPress = async (slot: 'primary' | 'secondary') => {
    if (slot === 'secondary' && !isPremium) {
      await EngagementPricingService.trackAction('secondarySlotAttempts');
      router.push('/modal/premium');
      return;
    }

    const existingQR = slot === 'primary' ? primaryQR : secondaryQR;
    
    if (existingQR) {
      router.push({
        pathname: '/modal/view',
        params: { id: existingQR.id, slot }
      });
    } else {
      router.push({
        pathname: '/modal/history',
        params: { selectMode: 'true', slot }
      });
    }
  };

  const handleRemoveQR = async (slot: 'primary' | 'secondary') => {
    try {
      if (slot === 'primary') {
        await UserPreferencesService.updatePrimaryQR(undefined);
        setPrimaryQR(null);
      } else {
        await UserPreferencesService.updateSecondaryQR(undefined);
        setSecondaryQR(null);
      }
    } catch (error) {
      console.error('Error removing QR code:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowSwipeIndicator(true);
    setShowPositionSlider(true);
  };

  const handleSliderExpand = () => {
    setSliderExpanded(true);
    Animated.timing(elementsOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSliderCollapse = () => {
    setSliderExpanded(false);
    Animated.timing(elementsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBackgroundPress = () => {
    if (sliderExpanded) {
      handleSliderCollapse();
    }
  };

  const currentGradient = GRADIENT_PRESETS[currentGradientIndex];
  const nextGradientIndex = currentGradientIndex < GRADIENT_PRESETS.length - 1 ? currentGradientIndex + 1 : 0;
  const nextGradient = GRADIENT_PRESETS[nextGradientIndex];

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const shouldShowTitle = !hideElementsForExport || !isPremium;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={handleBackgroundPress}>
        <View style={styles.container}>
          <GestureDetector gesture={swipeGesture}>
            <View style={styles.container}>
              <View ref={wallpaperRef} collapsable={false} style={styles.wallpaperContainer}>
                <GradientBackground
                  currentGradient={currentGradient}
                  nextGradient={nextGradient}
                  transition={gradientTransition}
                >
                  <View style={styles.content}>
                    {shouldShowTitle && (
                      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                        <Text style={styles.appTitle}>QuRe</Text>
                      </View>
                    )}

                    <Animated.View style={{ opacity: elementsOpacity }}>
                      {!hideElementsForExport && !sliderExpanded && (
                        <TimeDisplay currentTime={currentTime} />
                      )}
                    </Animated.View>

                    <View style={styles.middleContent}>
                      {showActionButtons && (
                        <View style={styles.actionSection}>
                          <Animated.View style={{ opacity: elementsOpacity }}>
                            {!sliderExpanded && (
                              <ActionCards 
                                onExportWallpaper={handleExportWallpaper}
                                onSettings={handleSettings}
                              />
                            )}
                          </Animated.View>
                          
                          {showPositionSlider && (
                            <PositionSlider
                              verticalValue={qrVerticalOffset}
                              horizontalValue={qrHorizontalOffset}
                              scaleValue={qrScale}
                              onVerticalChange={handleVerticalOffsetChange}
                              onHorizontalChange={handleHorizontalOffsetChange}
                              onScaleChange={handleScaleChange}
                              visible={showPositionSlider}
                              onExpand={handleSliderExpand}
                              onCollapse={handleSliderCollapse}
                            />
                          )}
                        </View>
                      )}
                    </View>

                    <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 15 }]}>
                      <QRSlots
                        primaryQR={primaryQR}
                        secondaryQR={secondaryQR}
                        isPremium={isPremium}
                        showActionButtons={showActionButtons}
                        verticalOffset={qrVerticalOffset}
                        horizontalOffset={qrHorizontalOffset}
                        scale={qrScale}
                        onSlotPress={handleQRSlotPress}
                        onRemoveQR={handleRemoveQR}
                      />
                      
                      {showSwipeIndicator && (
                        <SwipeIndicator onFadeComplete={handleSwipeFadeComplete} />
                      )}
                    </View>
                  </View>
                </GradientBackground>
              </View>
            </View>
          </GestureDetector>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wallpaperContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  middleContent: {
    flex: 1,
  },
  actionSection: {
    gap: 12,
  },
  bottomSection: {
    marginTop: 'auto',
  },
});