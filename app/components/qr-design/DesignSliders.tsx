// app/components/qr-design/DesignSliders.tsx
import Slider from '@react-native-community/slider';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

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
  if (!hasLogo) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Logo Size: {Math.round(logoSize)}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={40}
          value={logoSize}
          onValueChange={onLogoSizeChange}
          minimumTrackTintColor="#2196f3"
          maximumTrackTintColor="#ddd"
          thumbTintColor={Platform.OS === 'android' ? '#2196f3' : undefined}
        />
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Logo Margin: {Math.round(logoMargin)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          value={logoMargin}
          onValueChange={onLogoMarginChange}
          minimumTrackTintColor="#2196f3"
          maximumTrackTintColor="#ddd"
          thumbTintColor={Platform.OS === 'android' ? '#2196f3' : undefined}
        />
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Logo Corner Radius: {Math.round(logoBorderRadius)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          value={logoBorderRadius}
          onValueChange={onLogoBorderRadiusChange}
          minimumTrackTintColor="#2196f3"
          maximumTrackTintColor="#ddd"
          thumbTintColor={Platform.OS === 'android' ? '#2196f3' : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: Platform.OS === 'android' ? 40 : 32,
  },
});