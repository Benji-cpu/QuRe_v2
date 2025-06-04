import { Feather } from '@expo/vector-icons';
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
  const [contentOpacity] = useState(new Animated.Value(1));

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
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(true);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleDismiss = () => {
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(false);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.cardContainer}>
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
          {isExpanded ? (
            <View style={styles.sliderCard}>
              <View style={styles.iconContainer}>
                <Feather name="chevrons-up" size={24} color="white" />
              </View>
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
          ) : (
            <TouchableOpacity style={styles.notificationCard} onPress={handlePress}>
              <View style={styles.iconContainer}>
                <Feather name="chevrons-up" size={24} color="white" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Adjust QR position</Text>
                <Text style={styles.notificationSubtitle}>Move QR codes up or down</Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  content: {
    minHeight: 42, // Ensures consistent height
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  sliderIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sliderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
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