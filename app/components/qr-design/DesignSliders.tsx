import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 15,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});