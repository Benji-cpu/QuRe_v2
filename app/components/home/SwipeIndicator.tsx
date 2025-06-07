// app/components/home/PositionSlider.tsx
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PositionSliderProps {
  verticalValue: number;
  horizontalValue: number;
  scaleValue: number;
  onVerticalChange: (value: number) => void;
  onHorizontalChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  visible: boolean;
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
  onExpand,
  onCollapse
}: PositionSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const expandHeight = useRef(new Animated.Value(56)).current;

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

  const handleExpand = () => {
    setIsExpanded(true);
    onExpand?.();
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(expandHeight, {
        toValue: 200,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleCollapse = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(expandHeight, {
        toValue: 56,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsExpanded(false);
      onCollapse?.();
    });
  };

  if (!visible) return null;

  return (
    <>
      {isExpanded && (
        <Pressable 
          style={styles.backdrop} 
          onPress={handleCollapse}
        />
      )}
      
      <Animated.View 
        style={[
          styles.container, 
          { 
            opacity,
            transform: [{ translateY }],
            height: expandHeight
          }
        ]}
      >
        {isExpanded ? (
          <View style={styles.expandedCard}>
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Feather name="move" size={20} color="white" />
                <Text style={styles.sliderLabel}>Adjust Position</Text>
              </View>
              
              <View style={styles.sliderRow}>
                <Feather name="arrow-up" size={16} color="rgba(255, 255, 255, 0.6)" />
                <Slider
                  style={styles.slider}
                  minimumValue={20}
                  maximumValue={250}
                  value={verticalValue}
                  onValueChange={onVerticalChange}
                  minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="white"
                />
                <Text style={styles.sliderValue}>{Math.round(verticalValue)}</Text>
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
                <Text style={styles.sliderValue}>{Math.round(horizontalValue)}</Text>
              </View>

              <View style={styles.sliderRow}>
                <Feather name="maximize-2" size={16} color="rgba(255, 255, 255, 0.6)" />
                <Slider
                  style={styles.slider}
                  minimumValue={0.7}
                  maximumValue={1.2}
                  value={scaleValue}
                  onValueChange={onScaleChange}
                  minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="white"
                />
                <Text style={styles.sliderValue}>{Math.round(scaleValue * 100)}%</Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.notificationCard} onPress={handleExpand}>
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
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
    zIndex: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
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
    padding: 16,
    flex: 1,
  },
  sliderSection: {
    gap: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
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