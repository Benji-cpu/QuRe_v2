import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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

  return (
    <View style={styles.container}>
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
      
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
}

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
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});