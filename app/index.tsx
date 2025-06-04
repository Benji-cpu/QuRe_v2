// app/index.tsx - Update the relevant parts
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
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
import DevTools from './components/home/DevTools';
import GradientBackground from './components/home/GradientBackground';
import PositionSlider from './components/home/PositionSlider';
import QRSlots from './components/home/QRSlots';
import SwipeIndicator from './components/home/SwipeIndicator';
import TimeDisplay from './components/home/TimeDisplay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);
  const [showPositionSlider, setShowPositionSlider] = useState(false);
  
  const gradientTransition = useSharedValue(0);

  const loadUserData = useCallback(async () => {
    try {
      const preferences = await UserPreferencesService.getPreferences();
      const premium = await UserPreferencesService.isPremium();
      
      const gradientIndex = GRADIENT_PRESETS.findIndex(g => g.id === preferences.selectedGradientId);
      setCurrentGradientIndex(gradientIndex >= 0 ? gradientIndex : 0);
      setIsPremium(premium);
      setQrVerticalOffset(preferences.qrVerticalOffset || 80);

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

  const handleSwipeFadeComplete = () => {
    setShowSwipeIndicator(false);
    setShowPositionSlider(true);
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
      
      await EngagementPricingService.trackAction('wallpapersExported');
      
      Alert.alert('Success', 'Wallpaper saved to your photos!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save wallpaper');
      console.error('Export error:', error);
    } finally {
      setShowActionButtons(true);
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

  const handleTestUpgrade = async () => {
    const newStatus = !isPremium;
    await UserPreferencesService.setPremium(newStatus);
    setIsPremium(newStatus);
    loadUserData();
  };

  const currentGradient = GRADIENT_PRESETS[currentGradientIndex];
  const nextGradientIndex = currentGradientIndex < GRADIENT_PRESETS.length - 1 ? currentGradientIndex + 1 : 0;
  const nextGradient = GRADIENT_PRESETS[nextGradientIndex];

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.container}>
          <View ref={wallpaperRef} collapsable={false} style={styles.wallpaperContainer}>
            <GradientBackground
              currentGradient={currentGradient}
              nextGradient={nextGradient}
              transition={gradientTransition}
            >
              <View style={styles.content}>
                <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                  <Text style={styles.appTitle}>QuRe</Text>
                </View>

                <TimeDisplay currentTime={currentTime} />

                <View style={styles.middleContent}>
                  {showActionButtons && (
                    <View style={styles.actionSection}>
                      <ActionCards 
                        onExportWallpaper={handleExportWallpaper}
                        onSettings={handleSettings}
                      />
                      {showSwipeIndicator && (
                       <SwipeIndicator onFadeComplete={handleSwipeFadeComplete} />
                     )}
                     {showPositionSlider && (
                       <PositionSlider
                         value={qrVerticalOffset}
                         onValueChange={handleVerticalOffsetChange}
                         visible={showPositionSlider}
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
                   onSlotPress={handleQRSlotPress}
                   onRemoveQR={handleRemoveQR}
                 />

                 {showActionButtons && (
                   <DevTools
                     isPremium={isPremium}
                     onTestUpgrade={handleTestUpgrade}
                     onToggleOnboarding={() => {
                       setShowSwipeIndicator(true);
                       setShowPositionSlider(false);
                     }}
                   />
                 )}
               </View>
             </View>
           </GradientBackground>
         </View>
       </View>
     </GestureDetector>
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