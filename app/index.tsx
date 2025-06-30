import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Dimensions, Linking, Platform, Pressable, StyleSheet, Text, ToastAndroid, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
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
  
  const { height: screenHeight } = useWindowDimensions();
  
  const convertToPercentageBasedOffset = (fixedValue: number): number => {
    const oldMin = 20;
    const oldMax = 300;
    const oldRange = oldMax - oldMin;
    const normalizedValue = (fixedValue - oldMin) / oldRange;
    
    const newMin = screenHeight * 0.02;
    const newMax = screenHeight * 0.4;
    const newRange = newMax - newMin;
    
    return newMin + (normalizedValue * newRange);
  };
  
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const [previousGradientIndex, setPreviousGradientIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [primaryQR, setPrimaryQR] = useState<QRCodeData | null>(null);
  const [secondaryQR, setSecondaryQR] = useState<QRCodeData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(true);
  const [qrVerticalOffset, setQrVerticalOffset] = useState(() => convertToPercentageBasedOffset(80));
  const [qrHorizontalOffset, setQrHorizontalOffset] = useState(0);
  const [qrScale, setQrScale] = useState(1);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const [showPositionSlider, setShowPositionSlider] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hideElementsForExport, setHideElementsForExport] = useState(false);
  const [sliderExpanded, setSliderExpanded] = useState(false);
  const [elementsOpacity] = useState(new Animated.Value(1));
  const [showTitle, setShowTitle] = useState(true);
  const [qrSlotMode, setQrSlotMode] = useState<'single' | 'double'>('double');
  const [titleOpacity] = useState(new Animated.Value(1));
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportOverlayOpacity] = useState(new Animated.Value(0));
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<'gradient' | 'custom'>('gradient');
  
  const gradientTransition = useSharedValue(0);

  const loadUserData = useCallback(async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      const hasCompletedOnboarding = await UserPreferencesService.hasCompletedOnboarding();
      
      const gradientIndex = GRADIENT_PRESETS.findIndex(g => g.id === preferences.selectedGradientId);
      const validIndex = gradientIndex >= 0 ? gradientIndex : 0;
      setCurrentGradientIndex(validIndex);
      setPreviousGradientIndex(validIndex);
      setIsPremium(premium);
      
      const verticalOffset = preferences.qrVerticalOffset || 80;
      setQrVerticalOffset(convertToPercentageBasedOffset(verticalOffset));
      
      setQrHorizontalOffset(preferences.qrHorizontalOffset || 0);
      setQrScale(preferences.qrScale || 1);
      setShowTitle(preferences.showTitle ?? true);
      setQrSlotMode(preferences.qrSlotMode || 'double');
      
      // Force gradient mode for non-premium users
      if (!premium && preferences.backgroundType === 'custom') {
        setBackgroundType('gradient');
        await UserPreferencesService.updateBackgroundType('gradient');
      } else {
        setBackgroundType(preferences.backgroundType || 'gradient');
      }
      
      setShowOnboarding(!hasCompletedOnboarding);
      setShowPositionSlider(hasCompletedOnboarding);

      // Load custom background only for premium users
      if (premium) {
        const customBg = await UserPreferencesService.getCustomBackground();
        setCustomBackground(customBg);
      } else {
        setCustomBackground(null);
      }

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

      Animated.timing(titleOpacity, {
        toValue: (premium && !showTitle) ? 0 : 1,
        duration: 0,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [screenHeight]);

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
    if (!showOnboarding) {
      checkForOffer();
    }
  }, [loadUserData, showOnboarding]);

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
    if (showOnboarding) return;
    
    try {
      const offer = await EngagementPricingService.determineOffer();
      if (offer && !isPremium) {
        setTimeout(() => {
          if (!showOnboarding) {
            router.push('/modal/premium');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking for offer:', error);
    }
  };

  const changeGradient = (newIndex: number) => {
    setPreviousGradientIndex(currentGradientIndex);
    setCurrentGradientIndex(newIndex);
    gradientTransition.value = 0;
    gradientTransition.value = withTiming(1, { duration: 300 });
  };

  const swipeGesture = Gesture.Pan()
  .enabled(!sliderExpanded && backgroundType === 'gradient')
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

  const handleTitlePress = async () => {
    if (!isPremium) {
      router.push('/modal/premium');
    } else {
      const newShowTitle = !showTitle;
      setShowTitle(newShowTitle);
      await UserPreferencesService.updateShowTitle(newShowTitle);
      
      Animated.timing(titleOpacity, {
        toValue: newShowTitle ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSwipeFadeComplete = async () => {
    await incrementSwipeIndicatorCount();
    setShowSwipeIndicator(false);
  };

  const handleExportWallpaper = async () => {
    setShowActionButtons(false);
    setHideElementsForExport(true);
    setShowExportPreview(true);
    
    // Animate in the export overlay
    Animated.timing(exportOverlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSaveWallpaper = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save photos');
        Animated.timing(exportOverlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowActionButtons(true);
          setHideElementsForExport(false);
          setShowExportPreview(false);
        });
        return;
      }

      // Use JPEG on Android to avoid PNG decoding issues in Gallery
      const captureFormat = Platform.OS === 'android' ? 'jpg' : 'png';
      const uri = await captureRef(wallpaperRef, {
        format: captureFormat,
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      await EngagementPricingService.trackAction('wallpapersExported');
      
      // Animate out before resetting
      Animated.timing(exportOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowExportPreview(false);
        setShowActionButtons(true);
        setHideElementsForExport(false);
        showSaveInstructions();
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save wallpaper');
      console.error('Export error:', error);
      Animated.timing(exportOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowActionButtons(true);
        setHideElementsForExport(false);
        setShowExportPreview(false);
      });
    }
  };

  const showSaveInstructions = () => {
    if (Platform.OS === 'android') {
      // Show a toast message that stays on screen for several seconds
      ToastAndroid.showWithGravity(
        'Wallpaper saved! Open Gallery › Downloads (or "QuRe") to set it.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
      
      Alert.alert(
        'Wallpaper Saved!',
        'Your wallpaper has been saved to Gallery.\n\nTo set as wallpaper:\n1. Open Gallery app\n2. Find the wallpaper\n3. Tap menu (3 dots)\n4. Select "Set as wallpaper"\n5. Choose "Lock screen"',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Open Gallery',
            onPress: () => {
              Linking.openURL('content://media/external/images/media').catch(() => {
                Alert.alert('Could not open Gallery', 'Please open your Gallery app manually');
              });
            },
          },
        ]
      );
    } else {
      const instructions = '1. Open Photos app\n2. Find the wallpaper\n3. Tap Share button\n4. Select "Use as Wallpaper"\n5. Choose "Set"';
      Alert.alert(
        'Wallpaper Saved!',
        `Your wallpaper has been saved to photos.\n\nTo set as wallpaper:\n${instructions}`,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Open Photos',
            onPress: () => {
              Linking.openURL('photos-redirect://');
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (sliderExpanded) {
        handleSliderCollapse();
        return true;
      }
      if (showExportPreview) {
        Animated.timing(exportOverlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowExportPreview(false);
          setShowActionButtons(true);
          setHideElementsForExport(false);
        });
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [sliderExpanded, showExportPreview, exportOverlayOpacity]);

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
    setTimeout(() => {
      checkForOffer();
    }, 1000);
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

  const previousGradient = GRADIENT_PRESETS[previousGradientIndex];
  const currentGradient = GRADIENT_PRESETS[currentGradientIndex];

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const shouldShowTitleArea = !hideElementsForExport;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <GestureDetector gesture={swipeGesture}>
          <View style={styles.container}>
            <View ref={wallpaperRef} collapsable={false} style={styles.wallpaperContainer}>
              <GradientBackground
                currentGradient={previousGradient}
                nextGradient={currentGradient}
                transition={gradientTransition}
                customBackground={customBackground}
                backgroundType={backgroundType}
              >
                {/* Background touch handler - only active when sliders are expanded */}
                {sliderExpanded && (
                  <TouchableWithoutFeedback onPress={handleBackgroundPress}>
                    <View style={StyleSheet.absoluteFillObject} />
                  </TouchableWithoutFeedback>
                )}
                
                <View style={styles.content}>
                  {shouldShowTitleArea && (
                    <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                      <Pressable onPress={handleTitlePress} style={styles.titleContainer}>
                        <Animated.Text style={[styles.appTitle, { opacity: titleOpacity }]}>
                          QuRe
                        </Animated.Text>
                        {(!isPremium || (isPremium && showTitle)) && (
                          <Text style={styles.closeButton}>×</Text>
                        )}
                      </Pressable>
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
                            isExpanded={sliderExpanded}
                            onExpand={handleSliderExpand}
                            onCollapse={handleSliderCollapse}
                            singleQRMode={qrSlotMode === 'single'}
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
                      hideEmptySlots={hideElementsForExport}
                      singleQRMode={qrSlotMode === 'single'}
                    />
                    
                    {showSwipeIndicator && (
                      <SwipeIndicator onFadeComplete={handleSwipeFadeComplete} />
                    )}
                  </View>
                </View>
              </GradientBackground>
            </View>
            
            {/* Export preview controls - moved outside wallpaperRef */}
            {showExportPreview && (
              <Animated.View 
                style={[
                  styles.exportControls, 
                  { bottom: insets.bottom + 20, opacity: exportOverlayOpacity }
                ]}
              > 
                <View style={styles.exportControlsContent}>
                  <Text style={styles.exportPreviewTitle}>Wallpaper Preview</Text>
                  <Text style={styles.exportPreviewSubtitle}>How your wallpaper will look</Text>
                  <View style={styles.exportButtons}>
                    <Pressable
                      style={styles.exportCancelButton}
                      onPress={() => {
                        Animated.timing(exportOverlayOpacity, {
                          toValue: 0,
                          duration: 200,
                          useNativeDriver: true,
                        }).start(() => {
                          setShowExportPreview(false);
                          setShowActionButtons(true);
                          setHideElementsForExport(false);
                        });
                      }}
                    >
                      <Feather name="x" size={20} color="white" />
                      <Text style={styles.exportButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={styles.exportSaveButton}
                      onPress={handleSaveWallpaper}
                    >
                      <Feather name="check" size={20} color="white" />
                      <Text style={styles.exportButtonText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            )}
          </View>
        </GestureDetector>
      </View>
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
    height: 40,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    fontSize: 24,
    color: 'white',
    marginLeft: 10,
    lineHeight: 24,
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
  exportControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 100,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  exportControlsContent: {
    flex: 1,
    alignItems: 'center',
  },
  exportPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  exportPreviewSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  exportSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F8EF7',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});