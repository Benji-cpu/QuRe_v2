// app/components/qr-design/DesignSliders.tsx
import Slider from '@react-native-community/slider';
import React from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

interface DesignSlidersProps {
  logoSize: number;
  logoMargin: number;
  logoBorderRadius: number;
  onLogoSizeChange: (value: number) => void;
  onLogoMarginChange: (value: number) => void;
  onLogoBorderRadiusChange: (value: number) => void;
  hasLogo: boolean;
}

export default function DesignSliders({
  logoSize,
  logoMargin,
  logoBorderRadius,
  onLogoSizeChange,
  onLogoMarginChange,
  onLogoBorderRadiusChange,
  hasLogo
}: DesignSlidersProps) {
  const { theme } = useTheme();
  
  // Use window dimensions for responsive design - must be called before conditional return
  const { width: screenWidth } = useWindowDimensions();
  
  if (!hasLogo) return null;
  
  // Responsive scaling functions
  const scale = screenWidth / 375; // Base width of iPhone X
  const scaleFont = (size: number) => Math.round(size * Math.min(scale, 1.2));
  const scaleSpacing = (size: number) => Math.round(size * scale);

  return (
    <View style={[styles.container, { marginBottom: scaleSpacing(10) }]}>
      <View style={[styles.sliderContainer, { marginBottom: scaleSpacing(12) }]}>
        <Text style={[styles.sliderLabel, { fontSize: scaleFont(14), marginBottom: scaleSpacing(5), color: theme.textSecondary }]}>
          Logo Size: {Math.round(logoSize)}%
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={40}
          value={logoSize}
          onValueChange={onLogoSizeChange}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={Platform.OS === 'android' ? theme.primary : undefined}
        />
      </View>

      <View style={[styles.sliderContainer, { marginBottom: scaleSpacing(12) }]}>
        <Text style={[styles.sliderLabel, { fontSize: scaleFont(14), marginBottom: scaleSpacing(5), color: theme.textSecondary }]}>
          Logo Margin: {Math.round(logoMargin)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          value={logoMargin}
          onValueChange={onLogoMarginChange}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={Platform.OS === 'android' ? theme.primary : undefined}
        />
      </View>

      <View style={[styles.sliderContainer, { marginBottom: scaleSpacing(12) }]}>
        <Text style={[styles.sliderLabel, { fontSize: scaleFont(14), marginBottom: scaleSpacing(5), color: theme.textSecondary }]}>
          Logo Corner Radius: {Math.round(logoBorderRadius)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          value={logoBorderRadius}
          onValueChange={onLogoBorderRadiusChange}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={Platform.OS === 'android' ? theme.primary : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Dynamic margin handled inline
  },
  sliderContainer: {
    // Dynamic margin handled inline
  },
  sliderLabel: {
  },
  slider: {
    width: '100%',
    height: Platform.OS === 'android' ? 40 : 32,
  },
});