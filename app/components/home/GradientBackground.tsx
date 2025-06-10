// app/components/home/GradientBackground.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { GradientPreset } from '../../../constants/Gradients';

interface GradientBackgroundProps {
  currentGradient: GradientPreset;
  nextGradient: GradientPreset;
  transition: Animated.SharedValue<number>;
  children: React.ReactNode;
}

export default function GradientBackground({ 
  currentGradient, 
  nextGradient, 
  transition, 
  children 
}: GradientBackgroundProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(transition.value, [0, 1], [0, 1]),
    };
  });

  return (
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
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});