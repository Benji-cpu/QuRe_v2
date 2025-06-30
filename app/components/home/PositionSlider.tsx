// app/components/home/PositionSlider.tsx
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

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
  singleQRMode?: boolean;
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
  onCollapse,
  singleQRMode = false
}: PositionSliderProps) {
  const [animatedOpacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(0));
  const [containerOpacity] = useState(new Animated.Value(1));
  const slidersRef = useRef<View>(null);
  
  // Use window dimensions for responsive design
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Responsive scaling functions
  const scale = screenWidth / 375; // Base width of iPhone X
  const scaleFont = (size: number) => Math.round(size * Math.min(scale, 1.2));
  const scaleSpacing = (size: number) => Math.round(size * scale);

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
      // Dynamic expanded position based on screen height
      const expandedPosition = -(screenHeight * 0.5 - screenHeight * 0.45);
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
  }, [isExpanded, screenHeight]);

  const handleExpand = () => {
    onExpand?.();
  };

  const containerGesture = Gesture.Tap()
    .onEnd(() => {
      if (isExpanded && onCollapse) {
        onCollapse();
      }
    })
    .runOnJS(true);

  const getMaxHorizontalOffset = () => {
    // Scale horizontal offset based on screen width
    const baseOffset = singleQRMode ? 80 : 30;
    return Math.round(baseOffset * (screenWidth / 375));
  };

  // Get dynamic vertical range based on screen height
  const getVerticalRange = () => {
    const minValue = Math.round(screenHeight * 0.02); // 2% of screen height
    const maxValue = Math.round(screenHeight * 0.4); // 40% of screen height
    return { minValue, maxValue };
  };

  if (!visible) return null;

  const verticalRange = getVerticalRange();

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: animatedOpacity,
          transform: [{ translateY }],
          zIndex: isExpanded ? 100 : 1,
          paddingHorizontal: scaleSpacing(20),
          marginBottom: scaleSpacing(12),
        }
      ]}
      pointerEvents="box-none"
    >
      <Animated.View style={{ opacity: containerOpacity }}>
        {isExpanded ? (
          <GestureDetector gesture={containerGesture}>
            <View style={[styles.expandedCard, { borderRadius: scaleSpacing(12) }]}>
              <TouchableOpacity 
                activeOpacity={1}
                style={[styles.sliderContent, { padding: scaleSpacing(20) }]}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={[styles.sliderHeader, { marginBottom: scaleSpacing(16) }]}>
                  <Feather name="move" size={scaleFont(20)} color="white" />
                  <Text style={[styles.sliderLabel, { fontSize: scaleFont(16) }]}>Adjust Position</Text>
                </View>
                
                <View style={[styles.sliderRow, { marginBottom: scaleSpacing(12) }]}>
                  <Feather name="arrow-up" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
                  <Slider
                    style={styles.slider}
                    minimumValue={verticalRange.minValue}
                    maximumValue={verticalRange.maxValue}
                    value={verticalValue}
                    onValueChange={onVerticalChange}
                    minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor="white"
                  />
                  <Text style={[styles.sliderValue, { fontSize: scaleFont(13) }]}>{Math.round(verticalValue)}</Text>
                </View>

                <View style={[styles.sliderRow, { marginBottom: scaleSpacing(12) }]}>
                  <Feather name="arrow-left" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
                  <Slider
                    style={styles.slider}
                    minimumValue={-getMaxHorizontalOffset()}
                    maximumValue={getMaxHorizontalOffset()}
                    value={horizontalValue}
                    onValueChange={onHorizontalChange}
                    minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor="white"
                  />
                  <Text style={[styles.sliderValue, { fontSize: scaleFont(13) }]}>{Math.round(horizontalValue)}</Text>
                </View>

                <View style={[styles.sliderRow, { marginBottom: scaleSpacing(12) }]}>
                  <Feather name="maximize-2" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
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
                  <Text style={[styles.sliderValue, { fontSize: scaleFont(13) }]}>{scaleValue.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </GestureDetector>
        ) : (
          <TouchableOpacity 
            style={[
              styles.collapsedCard, 
              { 
                borderRadius: scaleSpacing(12),
                padding: scaleSpacing(14),
                minHeight: scaleSpacing(64)
              }
            ]} 
            onPress={handleExpand}
            activeOpacity={0.8}
          >
            <View style={[
              styles.iconContainer,
              {
                width: scaleSpacing(36),
                height: scaleSpacing(36),
                borderRadius: scaleSpacing(18),
                marginRight: scaleSpacing(10)
              }
            ]}>
              <Feather name="move" size={scaleFont(20)} color="white" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { fontSize: scaleFont(14) }]}>Adjust QR position</Text>
              <Text style={[styles.notificationSubtitle, { fontSize: scaleFont(12) }]}>Move and resize QR codes</Text>
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Dynamic padding handled inline
  },
  collapsedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: '600',
    color: 'white',
    marginBottom: 1,
  },
  notificationSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  expandedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  sliderContent: {
    // Dynamic padding handled inline
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontWeight: '600',
    color: 'white',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: Platform.OS === 'android' ? 40 : 32,
  },
  slider: {
    flex: 1,
    height: Platform.OS === 'android' ? 40 : 32,
  },
  sliderValue: {
    color: 'white',
    minWidth: 45,
    textAlign: 'right',
  },
});