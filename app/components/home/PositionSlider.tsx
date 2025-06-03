import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface PositionSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  visible: boolean;
}

export default function PositionSlider({ value, onValueChange, visible }: PositionSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handlePress = () => {
    setIsExpanded(true);
  };

  const handleDismiss = () => {
    setIsExpanded(false);
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {isExpanded ? (
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={StyleSheet.absoluteFillObject}>
            <TouchableWithoutFeedback>
              <View style={styles.sliderCard}>
                <Text style={styles.sliderIcon}>↕️</Text>
                <View style={styles.sliderContent}>
                  <Slider
                    style={styles.slider}
                    minimumValue={20}
                    maximumValue={150}
                    value={value}
                    onValueChange={onValueChange}
                    minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor="white"
                  />
                  <Text style={styles.sliderValue}>{Math.round(value)}px</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <TouchableOpacity style={styles.notificationCard} onPress={handlePress}>
          <Text style={styles.notificationIcon}>↕️</Text>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Adjust QR position</Text>
            <Text style={styles.notificationSubtitle}>Move QR codes up or down</Text>
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 1,
  },
  notificationSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sliderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
  },
  sliderIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sliderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    color: 'white',
    marginLeft: 12,
    minWidth: 45,
  },
});