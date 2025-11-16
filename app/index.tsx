// app/index.tsx
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Dimensions, InteractionManager, Platform, Pressable, Share, StyleSheet, Text, ToastAndroid, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { GRADIENT_PRESETS } from '../constants/Gradients';
import {
  DEFAULT_QR_SCALE,
  DEFAULT_QR_X_POSITION,
  DEFAULT_QR_Y_POSITION,
  DEFAULT_SINGLE_QR_X_POSITION,
  MIN_SINGLE_QR_SCALE,
} from '../constants/qrPlacement';
import { useTheme } from '../contexts/ThemeContext';
import { EngagementPricingService } from '../services/EngagementPricingService';
import { navigationService } from '../services/NavigationService';
import { QRStorage } from '../services/QRStorage';
import { UserPreferencesService } from '../services/UserPreferences';
import { PreferencesCache } from '../services/PreferencesCache';
import { setLockScreenWallpaper } from '../services/WallpaperService';
import { QRCodeData } from '../types/QRCode';
import ActionCards, { SwipeHelperCard } from './components/home/ActionCards';
import GradientBackground from './components/home/GradientBackground';
import PositionSlider from './components/home/PositionSlider';
import QRSlots from './components/home/QRSlots';
import TimeDisplay from './components/home/TimeDisplay';
import Onboarding from './components/Onboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SWIPE_HELPER_STORAGE_KEY = 'swipeHelperShownCount';
const SWIPE_HELPER_MAX_SHOWS = 3;
const SWIPE_HELPER_DELAY_MS = 600;

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, mode } = useTheme();
  const wallpaperRef = useRef<View>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveInteractionRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);
  
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const [previousGradientIndex, setPreviousGradientIndex] = useState(0);
  const [primaryQR, setPrimaryQR] = useState<QRCodeData | null>(null);
  const [secondaryQR, setSecondaryQR] = useState<QRCodeData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(true);
  const [qrXPosition, setQrXPosition] = useState<number | null>(null);
  const [qrYPosition, setQrYPosition] = useState<number | null>(null);
  const [qrScale, setQrScale] = useState<number | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
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
  const [isSwipingGradient, setIsSwipingGradient] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);
  const [showSwipeHelper, setShowSwipeHelper] = useState(false);
  const [swipeHelperCount, setSwipeHelperCount] = useState(0);
  const [swipeHelperCountLoaded, setSwipeHelperCountLoaded] = useState(false);
  const swipeHelperShownThisSession = useRef(false);
  const swipeHelperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissSwipeHelper = useCallback(() => {
    if (swipeHelperTimerRef.current) {
      clearTimeout(swipeHelperTimerRef.current);
      swipeHelperTimerRef.current = null;
    }
    setShowSwipeHelper(false);
  }, []);

  const handleSwipeHelperDismiss = useCallback(() => {
    swipeHelperShownThisSession.current = true;
    dismissSwipeHelper();
  }, [dismissSwipeHelper]);
  
  const gradientTransition = useSharedValue(0);

  // Swipe indicator session control

  const savePositionChanges = useCallback((x: number, y: number, scale: number) => {
    // Don't save if initial load hasn't completed
    if (!initialLoadComplete) {
      console.log('⏭️ Skipping save - initial load not complete');
      return;
    }
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (pendingSaveInteractionRef.current) {
      pendingSaveInteractionRef.current.cancel?.();
      pendingSaveInteractionRef.current = null;
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      pendingSaveInteractionRef.current = InteractionManager.runAfterInteractions(async () => {
        try {
          console.log('Saving position changes:', { x, y, scale });
          // Save all values atomically using preferences cache
          await PreferencesCache.savePartial({
            qrXPosition: x,
            qrYPosition: y,
            qrScale: scale,
          });
          console.log('Position changes saved successfully');
        } catch (error) {
          console.error('Error saving position changes:', error);
        } finally {
          pendingSaveInteractionRef.current = null;
        }
      });
    }, 500);
  }, [initialLoadComplete]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (pendingSaveInteractionRef.current) {
        pendingSaveInteractionRef.current.cancel?.();
        pendingSaveInteractionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (swipeHelperTimerRef.current) {
        clearTimeout(swipeHelperTimerRef.current);
        swipeHelperTimerRef.current = null;
      }
    };
  }, []);

  // Remove useCallback to prevent re-creation and dependency issues
  const loadUserData = async () => {
    try {
      console.log('🚀 loadUserData called - component mounting/remounting?');

      let normalizedSwipeHelperCount = 0;
      try {
        const storedSwipeHelperCount = await AsyncStorage.getItem(SWIPE_HELPER_STORAGE_KEY);
        const parsedSwipeHelperCount = storedSwipeHelperCount ? Number(storedSwipeHelperCount) : 0;
        normalizedSwipeHelperCount = Number.isFinite(parsedSwipeHelperCount)
          ? Math.max(0, Math.min(SWIPE_HELPER_MAX_SHOWS, parsedSwipeHelperCount))
          : 0;
      } catch (error) {
        console.error('Error reading swipe helper count:', error);
      }
      setSwipeHelperCount(normalizedSwipeHelperCount);

      const preferences = await PreferencesCache.loadOnce();
      const premium = await UserPreferencesService.isPremium();
      const hasCompletedOnboarding = await UserPreferencesService.hasCompletedOnboarding();

      const gradientIndex = GRADIENT_PRESETS.findIndex(g => g.id === preferences.selectedGradientId);
      const validIndex = gradientIndex >= 0 ? gradientIndex : 0;
      setCurrentGradientIndex(validIndex);
      setPreviousGradientIndex(validIndex);
      setIsPremium(premium);

      const slotMode = preferences.qrSlotMode || 'double';
      const defaultXForMode = slotMode === 'single' ? DEFAULT_SINGLE_QR_X_POSITION : DEFAULT_QR_X_POSITION;
      const defaultScaleForMode = slotMode === 'single' ? MIN_SINGLE_QR_SCALE : DEFAULT_QR_SCALE;

      let resolvedX = preferences.qrXPosition;
      if (resolvedX === undefined || resolvedX === null) {
        resolvedX = defaultXForMode;
      } else if (slotMode === 'single' && resolvedX === DEFAULT_QR_X_POSITION) {
        resolvedX = DEFAULT_SINGLE_QR_X_POSITION;
      }

      const resolvedY = preferences.qrYPosition ?? DEFAULT_QR_Y_POSITION;

      let resolvedScale = preferences.qrScale;
      if (resolvedScale === undefined || resolvedScale === null) {
        resolvedScale = defaultScaleForMode;
      } else if (slotMode === 'single' && resolvedScale === DEFAULT_QR_SCALE) {
        resolvedScale = defaultScaleForMode;
      }

      console.log('📊 Loading positions in loadUserData:', {
        stored: { x: preferences.qrXPosition, y: preferences.qrYPosition, scale: preferences.qrScale },
        calculated: { x: resolvedX, y: resolvedY, scale: resolvedScale },
        currentState: { x: qrXPosition, y: qrYPosition, scale: qrScale }
      });

      setQrXPosition(resolvedX);
      setQrYPosition(resolvedY);
      setQrScale(resolvedScale);

      console.log('✅ Position state updated in loadUserData to:', { x: resolvedX, y: resolvedY, scale: resolvedScale });
      setInitialLoadComplete(true);
      setShowTitle(preferences.showTitle ?? true);
      setQrSlotMode(slotMode);
      setShowShareButton(preferences.showShareButton ?? false);

      if (!premium && preferences.backgroundType === 'custom') {
        setBackgroundType('gradient');
        await UserPreferencesService.updateBackgroundType('gradient');
      } else {
        setBackgroundType(preferences.backgroundType || 'gradient');
      }

      setShowOnboarding(!hasCompletedOnboarding);
      setShowPositionSlider(hasCompletedOnboarding);

      if (premium) {
        const customBg = await UserPreferencesService.getCustomBackground();
        setCustomBackground(customBg);
      } else {
        setCustomBackground(null);
      }

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
    } finally {
      setSwipeHelperCountLoaded(true);
    }
  };
  // Simple function to reload QR codes when returning from modals
  const reloadQRCodes = useCallback(async () => {
    try {
      console.log('🔄 reloadQRCodes called - current positions:', { 
        x: qrXPosition, 
        y: qrYPosition, 
        scale: qrScale 
      });
      
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      
      console.log('📖 Preferences loaded in reloadQRCodes:', {
        x: preferences.qrXPosition,
        y: preferences.qrYPosition,
        scale: preferences.qrScale
      });
      
      // Update QR codes, premium status, and display settings
      setIsPremium(premium);
      setShowTitle(preferences.showTitle ?? true);
      setQrSlotMode(preferences.qrSlotMode || 'double');
      setShowShareButton(preferences.showShareButton ?? false);
      
      // Update background settings
      if (!premium && preferences.backgroundType === 'custom') {
        setBackgroundType('gradient');
        await UserPreferencesService.updateBackgroundType('gradient');
      } else {
        setBackgroundType(preferences.backgroundType || 'gradient');
      }
      
      // Load custom background for premium users
      if (premium) {
        const customBg = await UserPreferencesService.getCustomBackground();
        setCustomBackground(customBg);
      } else {
        setCustomBackground(null);
      }

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
      console.error('Error reloading QR codes:', error);
    }
  }, []);

  // Function to reload gradient selection from preferences
  const reloadGradient = useCallback(async () => {
    // Skip if currently swiping to prevent conflicts
    if (isSwipingGradient) return;
    
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const gradientIndex = GRADIENT_PRESETS.findIndex(g => g.id === preferences.selectedGradientId);
      const validIndex = gradientIndex >= 0 ? gradientIndex : 0;
      
      // Only update if the gradient has actually changed (e.g., from settings)
      if (validIndex !== currentGradientIndex) {
        setPreviousGradientIndex(currentGradientIndex);
        setCurrentGradientIndex(validIndex);
        // Reset the transition for immediate change from settings
        gradientTransition.value = 1;
      }
    } catch (error) {
      console.error('Error reloading gradient:', error);
    }
  }, [currentGradientIndex, isSwipingGradient, gradientTransition]);

  // Reload QR codes when screen comes into focus (returning from modals)
  useFocusEffect(
    useCallback(() => {
      // Reload QR codes and gradient
      reloadQRCodes();
      reloadGradient();
    }, [reloadQRCodes, reloadGradient])
  );

  // Initial load only - empty dependency array ensures this runs once
  useEffect(() => {
    loadUserData();
  }, []); // Only run once on mount
  
  // Separate effect for offer checking
  useEffect(() => {
    if (!showOnboarding) {
      checkForOffer();
    }
  }, [showOnboarding]);

  // Track session duration for engagement analytics
  useEffect(() => {
    sessionStartTime.current = Date.now();
    
    return () => {
      const sessionDuration = Date.now() - sessionStartTime.current;
      EngagementPricingService.trackSession(sessionDuration);
    };
  }, []);

  // Time ticking moved into TimeDisplay to avoid app-wide re-renders

  useEffect(() => {
    const helperEligible =
      initialLoadComplete &&
      !showOnboarding &&
      showActionButtons &&
      !sliderExpanded &&
      !showExportPreview &&
      !hideElementsForExport &&
      backgroundType === 'gradient' &&
      !isSwipingGradient &&
      swipeHelperCountLoaded &&
      !swipeHelperShownThisSession.current &&
      swipeHelperCount < SWIPE_HELPER_MAX_SHOWS;

    if (helperEligible) {
      if (!showSwipeHelper && !swipeHelperTimerRef.current) {
        swipeHelperTimerRef.current = setTimeout(() => {
          swipeHelperTimerRef.current = null;
          setShowSwipeHelper(true);
          setSwipeHelperCount(prev => {
            const next = Math.min(SWIPE_HELPER_MAX_SHOWS, prev + 1);
            AsyncStorage.setItem(SWIPE_HELPER_STORAGE_KEY, String(next)).catch(error => {
              console.error('Error updating swipe helper count:', error);
            });
            return next;
          });
        }, SWIPE_HELPER_DELAY_MS);
      }
    } else {
      if (swipeHelperTimerRef.current || showSwipeHelper) {
        dismissSwipeHelper();
      }
    }
  }, [
    backgroundType,
    hideElementsForExport,
    initialLoadComplete,
    isSwipingGradient,
    showActionButtons,
    showExportPreview,
    showOnboarding,
    showSwipeHelper,
    sliderExpanded,
    swipeHelperCount,
    swipeHelperCountLoaded,
    dismissSwipeHelper,
  ]);

  const checkForOffer = async () => {
    if (showOnboarding) return;
    
    try {
      const offer = await EngagementPricingService.determineOffer();
      if (offer && !isPremium) {
        setTimeout(() => {
          if (!showOnboarding) {
            navigationService.navigateTo('/modal/premium');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking for offer:', error);
    }
  };

  const changeGradient = async (newIndex: number) => {
    setIsSwipingGradient(true);
    swipeHelperShownThisSession.current = true;
    dismissSwipeHelper();
    setPreviousGradientIndex(currentGradientIndex);
    setCurrentGradientIndex(newIndex);
    gradientTransition.value = 0;
    gradientTransition.value = withTiming(1, { duration: 300 }, () => {
      // Animation complete callback
      runOnJS(setIsSwipingGradient)(false);
    });
    
    // Save the new gradient and ensure background type is gradient
    try {
      await UserPreferencesService.updateGradient(GRADIENT_PRESETS[newIndex].id);
      if (backgroundType !== 'gradient') {
        setBackgroundType('gradient');
        await UserPreferencesService.updateBackgroundType('gradient');
      }
    } catch (error) {
      console.error('Error saving gradient:', error);
    }
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

  // Removed duplicate gradient saving - this is already handled in changeGradient function

  // Use refs to avoid stale closures in position handlers
  const positionRef = useRef({
    x: qrXPosition ?? DEFAULT_QR_X_POSITION,
    y: qrYPosition ?? DEFAULT_QR_Y_POSITION,
    scale: qrScale ?? DEFAULT_QR_SCALE,
  });
  
  useEffect(() => {
    positionRef.current = {
      x: qrXPosition ?? DEFAULT_QR_X_POSITION,
      y: qrYPosition ?? DEFAULT_QR_Y_POSITION,
      scale: qrScale ?? DEFAULT_QR_SCALE,
    };
  }, [qrXPosition, qrYPosition, qrScale]);

  const handleXPositionChange = useCallback((value: number) => {
    console.log('🎯 X Position changed to:', value);
    setQrXPosition(value);
    positionRef.current.x = value;
    savePositionChanges(value, positionRef.current.y, positionRef.current.scale);
  }, [savePositionChanges]);

  const handleYPositionChange = useCallback((value: number) => {
    console.log('🎯 Y Position changed to:', value);
    setQrYPosition(value);
    positionRef.current.y = value;
    savePositionChanges(positionRef.current.x, value, positionRef.current.scale);
  }, [savePositionChanges]);

  const handleScaleChange = useCallback((value: number) => {
    setQrScale(value);
    positionRef.current.scale = value;
    savePositionChanges(positionRef.current.x, positionRef.current.y, value);
  }, [savePositionChanges]);

  const handleResetPosition = useCallback((x: number, y: number, scale: number) => {
    setQrXPosition(x);
    setQrYPosition(y);
    setQrScale(scale);
    positionRef.current = { x, y, scale };
    savePositionChanges(x, y, scale);
  }, [savePositionChanges]);

  const handleTitlePress = async () => {
    if (!isPremium) {
      navigationService.navigateTo('/modal/premium');
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

  const handleExportWallpaper = async () => {
    // Skip the system alert and go directly to custom preview
    setShowActionButtons(false);
    setHideElementsForExport(true);
    setShowExportPreview(true);
    
    Animated.timing(exportOverlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeExportPreview = useCallback(() => {
    Animated.timing(exportOverlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowExportPreview(false);
      setShowActionButtons(true);
      setHideElementsForExport(false);
    });
  }, [exportOverlayOpacity]);

  const handleSaveWallpaper = async () => {
    try {
      const captureFormat = Platform.OS === 'android' ? 'jpg' : 'png';
      const uri = await captureRef(wallpaperRef, {
        format: captureFormat,
        quality: 1,
      });

      const wallpaperSet = await setLockScreenWallpaper(uri);
      await EngagementPricingService.trackAction('wallpapersExported');

      Animated.timing(exportOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(async () => {
        setShowExportPreview(false);
        setShowActionButtons(true);
        setHideElementsForExport(false);

        if (wallpaperSet) {
          if (Platform.OS === 'android') {
            ToastAndroid.showWithGravity(
              'Lock screen wallpaper set successfully!',
              ToastAndroid.LONG,
              ToastAndroid.CENTER
            );
          } else {
            Alert.alert('Saved to Photos', 'The wallpaper has been saved to your photo library. To set it as your lock screen:\n\n1. Open Settings > Wallpaper\n2. Choose "Add New Wallpaper"\n3. Select the image from your Photos\n4. Set as Lock Screen');
          }
        } else {
          Alert.alert(
            'Failed to Set Wallpaper',
            'Unable to set the lock screen wallpaper. Please try again.',
            [{ text: 'OK' }]
          );
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to set lock screen wallpaper. Please try again.');
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

  const handleShareWallpaper = async () => {
    try {
      // Temporarily hide action buttons and elements for export
      setShowActionButtons(false);
      setHideElementsForExport(true);

      // Small delay to ensure UI updates
      setTimeout(async () => {
        try {
          const captureFormat = Platform.OS === 'android' ? 'jpg' : 'png';
          const uri = await captureRef(wallpaperRef, {
            format: captureFormat,
            quality: 1,
          });

          await EngagementPricingService.trackAction('wallpapersExported');

          // Create promotional message
          const shareMessage = `🔒 Created with QuRe - Transform your lock screen with custom QR codes! 

Create personalized wallpapers with QR codes for instant access to your links, contacts, and more.

Download QuRe: qure.app`;

          try {
            // Try using React Native Share API first (supports text + images)
            await Share.share({
              message: shareMessage,
              url: Platform.OS === 'ios' ? uri : undefined, // iOS supports url
              ...(Platform.OS === 'android' && { url: uri }), // Android needs it in the root object
            });
          } catch (shareError) {
            console.log('Share API failed, falling back to expo-sharing:', shareError);
            
            // Fallback to expo-sharing for image only
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
              await Sharing.shareAsync(uri, {
                mimeType: `image/${captureFormat === 'jpg' ? 'jpeg' : 'png'}`,
                dialogTitle: 'Share your QR Lock Screen - Made with QuRe',
                UTI: captureFormat === 'jpg' ? 'public.jpeg' : 'public.png',
              });
            } else {
              Alert.alert('Sharing not available', 'Sharing is not available on this device.');
            }
          }

          // Restore UI elements after sharing
          setShowActionButtons(true);
          setHideElementsForExport(false);

        } catch (shareError) {
          console.error('Share error:', shareError);
          Alert.alert('Share failed', 'Unable to share the screenshot. Please try again.');
          
          // Restore UI elements on error
          setShowActionButtons(true);
          setHideElementsForExport(false);
        }
      }, 100); // Reduced delay since we're not showing preview

    } catch (error) {
      console.error('Share preparation error:', error);
      Alert.alert('Error', 'Failed to prepare screenshot for sharing.');
      
      // Restore UI elements on error
      setShowActionButtons(true);
      setHideElementsForExport(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (showExportPreview) {
        closeExportPreview();
        return true;
      }
      if (sliderExpanded) {
        handleSliderCollapse();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [sliderExpanded, showExportPreview, closeExportPreview, handleSliderCollapse]);

  const handleSettings = async () => {
    await EngagementPricingService.trackAction('settingsOpened');
    navigationService.navigateTo('/modal/settings');
  };

  const handleQRSlotPress = async (slot: 'primary' | 'secondary') => {
    try {
      if (slot === 'primary') {
        if (primaryQR) {
          navigationService.navigateTo(`/modal/qrcode?id=${primaryQR.id}&slot=primary`);
        } else {
          navigationService.navigateTo('/modal/qrcode?slot=primary');
        }
      } else if (slot === 'secondary') {
        if (isPremium) {
          if (secondaryQR) {
            navigationService.navigateTo(`/modal/qrcode?id=${secondaryQR.id}&slot=secondary`);
          } else {
            navigationService.navigateTo('/modal/qrcode?slot=secondary');
          }
        } else {
          await EngagementPricingService.trackAction('secondarySlotAttempts');
          navigationService.navigateTo('/modal/premium');
        }
      }
    } catch (error) {
      console.error('Error handling QR slot press:', error);
    }
  };

  const handleRemoveQR = async (slot: 'primary' | 'secondary') => {
    try {
      if (slot === 'primary') {
        setPrimaryQR(null);
        await UserPreferencesService.updatePrimaryQR(undefined);
      } else if (slot === 'secondary') {
        setSecondaryQR(null);
        await UserPreferencesService.updateSecondaryQR(undefined);
      }
    } catch (error) {
      console.error('Error removing QR:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowPositionSlider(true);
    setTimeout(() => {
      navigationService.navigateTo('/modal/qrcode?slot=primary');
    }, 150);
  };

  const handleSliderExpand = useCallback(() => {
    setSliderExpanded(true);
    Animated.timing(elementsOpacity, {
      toValue: 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [elementsOpacity]);

  const handleSliderCollapse = useCallback(() => {
    setSliderExpanded(false);
    Animated.timing(elementsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [elementsOpacity]);

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

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
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
                {sliderExpanded && (
                  <TouchableWithoutFeedback onPress={handleBackgroundPress}>
                    <View style={StyleSheet.absoluteFillObject} />
                  </TouchableWithoutFeedback>
                )}
                
                <View style={styles.content}>
                  <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                  </View>

                  <Animated.View style={{ opacity: elementsOpacity }}>
                    {!hideElementsForExport && !sliderExpanded && (
                      <TimeDisplay />
                    )}
                  </Animated.View>

                  <View style={styles.middleContent}>
                    {showActionButtons && (
                      <View style={styles.actionSection}>
                        <Animated.View style={{ opacity: elementsOpacity }}>
                          {!sliderExpanded && (
                            <ActionCards 
                              onExportWallpaper={handleExportWallpaper}
                              onShareWallpaper={handleShareWallpaper}
                              onSettings={handleSettings}
                              showShareButton={showShareButton}
                            />
                          )}
                        </Animated.View>
                        
                        {showPositionSlider && (
                          <PositionSlider
                            xPosition={qrXPosition ?? DEFAULT_QR_X_POSITION}
                            yPosition={qrYPosition ?? DEFAULT_QR_Y_POSITION}
                            scaleValue={qrScale ?? DEFAULT_QR_SCALE}
                            onXPositionChange={handleXPositionChange}
                            onYPositionChange={handleYPositionChange}
                            onScaleChange={handleScaleChange}
                            onResetPosition={handleResetPosition}
                            visible={showPositionSlider}
                            isExpanded={sliderExpanded}
                            onExpand={handleSliderExpand}
                            onCollapse={handleSliderCollapse}
                            singleQRMode={!isPremium || qrSlotMode === 'single'}
                            safeAreaInsets={insets}
                          />
                        )}

                        {!sliderExpanded && (
                          <Animated.View style={{ opacity: elementsOpacity }}>
                            <SwipeHelperCard
                              visible={showSwipeHelper}
                              onDismiss={handleSwipeHelperDismiss}
                            />
                          </Animated.View>
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
                      xPosition={qrXPosition ?? DEFAULT_QR_X_POSITION}
                      yPosition={qrYPosition ?? DEFAULT_QR_Y_POSITION}
                      scale={qrScale ?? DEFAULT_QR_SCALE}
                      onSlotPress={handleQRSlotPress}
                      onRemoveQR={handleRemoveQR}
                      hideEmptySlots={hideElementsForExport}
                      singleQRMode={!isPremium || qrSlotMode === 'single'}
                    />
                  </View>
                </View>
              </GradientBackground>
            </View>
            
            {showExportPreview && (
              <Animated.View
                style={[styles.exportOverlay, { opacity: exportOverlayOpacity }]}
                pointerEvents={showExportPreview ? 'auto' : 'none'}
              >
                <Pressable
                  style={styles.exportBackdrop}
                  onPress={closeExportPreview}
                />
                <View
                  style={[
                    styles.exportControlsCard,
                    {
                      marginTop: insets.top + 20,
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.exportPreviewTitle, { color: theme.text }]}>
                    Lock Screen Preview
                  </Text>
                  <Text
                    style={[
                      styles.exportPreviewSubtitle,
                      { color: theme.textSecondary },
                    ]}
                  >
                    How your lock screen will look
                  </Text>
                  <View style={styles.exportButtons}>
                    <Pressable
                      style={[
                        styles.exportButtonBase,
                        styles.exportCancelButton,
                        {
                          backgroundColor: theme.surfaceVariant,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={closeExportPreview}
                    >
                      <Feather
                        name="x"
                        size={20}
                        color={theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.exportButtonText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.exportButtonBase,
                        styles.exportPrimaryButton,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={handleSaveWallpaper}
                    >
                      <Feather
                        name="check"
                        size={20}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.exportButtonText,
                          { color: theme.primary },
                        ]}
                      >
                        Set as Lock Screen
                      </Text>
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
    position: 'relative',
    zIndex: 20,
  },
  actionSection: {
    gap: 12,
    position: 'relative',
    zIndex: 20,
  },
  bottomSection: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  exportOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  exportBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  exportControlsCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  exportPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exportPreviewSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  exportButtonBase: {
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 2,
  },
  exportCancelButton: {
    flex: 1,
  },
  exportPrimaryButton: {
    flex: 1.35,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
 },
});
