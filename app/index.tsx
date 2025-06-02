import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import ActionButtons from '../components/home/ActionButtons';
import DevTools from '../components/home/DevTools';
import QRSlots from '../components/home/QRSlots';
import TimeDisplay from '../components/home/TimeDisplay';
import { GRADIENT_PRESETS } from '../constants/Gradients';
import { useAppState } from '../hooks/useAppState';
import { UserPreferencesService } from '../services/UserPreferences';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const wallpaperRef = useRef<View>(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showActionButtons, setShowActionButtons] = useState(true);
  
  const { state, updateGradientIndex, updatePremiumStatus, removeQR } = useAppState();
  const { currentGradientIndex, primaryQR, secondaryQR, isPremium, loading } = state;
  
  const gradientTransition = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const changeGradient = (newIndex: number) => {
    updateGradientIndex(newIndex);
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

  const handleTestUpgrade = async () => {
    const newStatus = !isPremium;
    await UserPreferencesService.setPremium(newStatus);
    updatePremiumStatus(newStatus);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const currentGradient = GRADIENT_PRESETS[currentGradientIndex];
  const nextGradientIndex = currentGradientIndex < GRADIENT_PRESETS.length - 1 ? currentGradientIndex + 1 : 0;
  const nextGradient = GRADIENT_PRESETS[nextGradientIndex];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(gradientTransition.value, [0, 1], [1, 0]),
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.container}>
          <View ref={wallpaperRef} collapsable={false} style={styles.wallpaperContainer}>
            <LinearGradient
              colors={currentGradient.colors as unknown as readonly [string, string, ...string[]]}
              start={currentGradient.start}
              end={currentGradient.end}
              style={styles.gradient}
            >
              <Animated.View style={[styles.gradientOverlay, animatedStyle]}>
                <LinearGradient
                  colors={nextGradient.colors as unknown as readonly [string, string, ...string[]]}
                  start={nextGradient.start}
                  end={nextGradient.end}
                  style={styles.gradient}
                />
              </Animated.View>
              
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.header, { marginTop: insets.top + 15 }]}>
                  <Text style={styles.appTitle}>QuRe</Text>
                </View>

                <TimeDisplay currentTime={currentTime} />

                <ActionButtons 
                  onExportWallpaper={handleExportWallpaper}
                  showActionButtons={showActionButtons}
                />

                <QRSlots
                  primaryQR={primaryQR}
                  secondaryQR={secondaryQR}
                  isPremium={isPremium}
                  showActionButtons={showActionButtons}
                  insets={insets}
                  onRemoveQR={removeQR}
                />

                <DevTools
                  isPremium={isPremium}
                  showActionButtons={showActionButtons}
                  insets={insets}
                  onTestUpgrade={handleTestUpgrade}
                />
              </ScrollView>
            </LinearGradient>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  wallpaperContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
});