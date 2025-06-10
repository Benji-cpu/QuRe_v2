import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PositionSliderProps {
  verticalValue: number;
  horizontalValue: number;
  scaleValue: number;
  onVerticalChange: (value: number) => void;
  onHorizontalChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  visible: boolean;
  isExpanded: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export default function PositionSlider({ 
  verticalValue, 
  horizontalValue,
  scaleValue,
  onVerticalChange, 
  onHorizontalChange,
  onScaleChange,
  visible,
  isExpanded,
  onExpand,
  onCollapse
}: PositionSliderProps) {
  const [animatedOpacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(0));
  const [containerOpacity] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (isExpanded) {
      const expandedPosition = -(SCREEN_HEIGHT / 2 - 430);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: expandedPosition,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isExpanded]);

  const handleExpand = () => {
    onExpand?.();
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: animatedOpacity,
          transform: [{ translateY }],
          zIndex: isExpanded ? 100 : 1,
        }
      ]}
    >
      <Animated.View style={{ opacity: containerOpacity }}>
        {isExpanded ? (
          <View style={styles.expandedCard}>
            <View style={styles.sliderHeader}>
              <Feather name="move" size={20} color="white" />
              <Text style={styles.sliderLabel}>Adjust Position</Text>
            </View>
            
            <View style={styles.sliderRow}>
              <Feather name="arrow-up" size={16} color="rgba(255, 255, 255, 0.6)" />
              <Slider
                style={styles.slider}
                minimumValue={20}
                maximumValue={300}
                value={verticalValue}
                onValueChange={onVerticalChange}
                minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="white"
              />
            </View>

            <View style={styles.sliderRow}>
              <Feather name="arrow-left" size={16} color="rgba(255, 255, 255, 0.6)" />
              <Slider
                style={styles.slider}
                minimumValue={-30}
                maximumValue={30}
                value={horizontalValue}
                onValueChange={onHorizontalChange}
                minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="white"
              />
            </View>

            <View style={styles.sliderRow}>
              <Feather name="maximize-2" size={16} color="rgba(255, 255, 255, 0.6)" />
              <Slider
                style={styles.slider}
                minimumValue={0.7}
                maximumValue={1.3}
                value={scaleValue}
                onValueChange={onScaleChange}
                minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="white"
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.collapsedCard} onPress={handleExpand}>
            <View style={styles.iconContainer}>
              <Feather name="move" size={20} color="white" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Adjust QR position</Text>
              <Text style={styles.notificationSubtitle}>Move and resize QR codes</Text>
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  collapsedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 1,
  },
  notificationSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  expandedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  slider: {
    flex: 1,
    height: 32,
  },
  sliderValue: {
    fontSize: 13,
    color: 'white',
    minWidth: 45,
    textAlign: 'right',
  },
});