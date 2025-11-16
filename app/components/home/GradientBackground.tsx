import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { GradientPreset } from '../../../constants/Gradients';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GradientBackgroundProps {
  currentGradient: GradientPreset;
  nextGradient: GradientPreset;
  transition: Animated.SharedValue<number>;
  children: React.ReactNode;
  customBackground?: string | null;
  backgroundType?: 'gradient' | 'custom';
}

function GradientBackground({ 
  currentGradient, 
  nextGradient, 
  transition, 
  children,
  customBackground,
  backgroundType = 'gradient'
}: GradientBackgroundProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    if (backgroundType === 'custom' && customBackground) {
      console.log('Loading custom background:', customBackground);
      setImageLoaded(false);
    }
  }, [backgroundType, customBackground]);

  const currentGradientStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(transition.value, [0, 1], [1, 0]),
    };
  });

  const nextGradientStyle = useAnimatedStyle(() => {
    return {
      opacity: transition.value,
    };
  });

  const shouldShowCustomBackground = backgroundType === 'custom' && customBackground;

  return (
    <View style={styles.container}>
      {/* Gradient layers - always rendered but behind custom background */}
      <Animated.View style={[styles.gradientContainer, currentGradientStyle]}>
        <LinearGradient
          colors={currentGradient.colors as unknown as readonly [string, string, ...string[]]}
          start={currentGradient.start}
          end={currentGradient.end}
          style={styles.gradient}
        />
      </Animated.View>
      
      <Animated.View style={[styles.gradientContainer, nextGradientStyle]}>
        <LinearGradient
          colors={nextGradient.colors as unknown as readonly [string, string, ...string[]]}
          start={nextGradient.start}
          end={nextGradient.end}
          style={styles.gradient}
        />
      </Animated.View>
      
      {/* Custom background layer - renders on top of gradients when active */}
      {shouldShowCustomBackground && (
        <View style={[styles.customBackgroundContainer, { opacity: imageLoaded ? 1 : 0 }]}>
          <Image 
            source={{ uri: customBackground }} 
            style={styles.customBackground}
            resizeMode="cover"
            onLoad={() => {
              console.log('Custom background loaded successfully');
              setImageLoaded(true);
            }}
            onError={(error) => {
              console.error('Failed to load custom background:', error);
              setImageLoaded(false);
            }}
          />
        </View>
      )}
      
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
}

export default React.memo(GradientBackground);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  customBackgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000', // Fallback color
    zIndex: 1, // Ensure it's above gradients
  },
  customBackground: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2, // Ensure content is above everything
  },
});