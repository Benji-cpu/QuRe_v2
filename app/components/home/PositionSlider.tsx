// app/components/home/PositionSlider.tsx
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

interface PositionSliderProps {
  xPosition: number;  // 0-100 coordinate system (0=left, 100=right)
  yPosition: number;  // 0-100 coordinate system (0=bottom, 100=top)
  scaleValue: number;
  onXPositionChange: (value: number) => void;
  onYPositionChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onXPositionChangeEnd?: (value: number) => void;
  onYPositionChangeEnd?: (value: number) => void;
  onScaleChangeEnd?: (value: number) => void;
  visible: boolean;
  isExpanded: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  singleQRMode?: boolean;
}

export default function PositionSlider({ 
  xPosition, 
  yPosition,
  scaleValue,
  onXPositionChange, 
  onYPositionChange,
  onScaleChange,
  onXPositionChangeEnd,
  onYPositionChangeEnd,
  onScaleChangeEnd,
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
  
  // Snap state tracking
  const [hasSnappedX, setHasSnappedX] = useState(false);
  const [hasSnappedY, setHasSnappedY] = useState(false);
  
  // Toggle state for snapping to bottom
  const [isSnappedToBottom, setIsSnappedToBottom] = useState(false);
  
  // Use window dimensions for responsive design
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Responsive scaling functions
  const scale = screenWidth / 375; // Base width of iPhone X
  const scaleFont = (size: number) => Math.round(size * Math.min(scale, 1.2));
  const scaleSpacing = (size: number) => Math.round(size * scale);

  // Snap configuration
  const SNAP_THRESHOLD = 3; // How close to center before snapping (±3 units)
  const SNAP_TARGET = 50; // Center position

  // Handle snap logic with haptic feedback
  const handleSnapPosition = (value: number, isX: boolean) => {
    const distance = Math.abs(value - SNAP_TARGET);
    const hasSnapped = isX ? hasSnappedX : hasSnappedY;
    
    if (distance <= SNAP_THRESHOLD && !hasSnapped) {
      // Snap to center and provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isX) {
        setHasSnappedX(true);
        onXPositionChange(SNAP_TARGET);
      } else {
        setHasSnappedY(true);
        onYPositionChange(SNAP_TARGET);
      }
      return SNAP_TARGET;
    } else if (distance > SNAP_THRESHOLD) {
      // Reset snap state when moving away from center
      if (isX) {
        setHasSnappedX(false);
      } else {
        setHasSnappedY(false);
      }
    }
    
    return value;
  };

  const handleXPositionChange = (value: number) => {
    const snappedValue = handleSnapPosition(value, true);
    if (snappedValue !== value) return; // Already handled by snap
    onXPositionChange(value);
  };

  const handleYPositionChange = (value: number) => {
    const snappedValue = handleSnapPosition(value, false);
    if (snappedValue !== value) return; // Already handled by snap
    onYPositionChange(value);
  };

  const handleXPositionChangeEnd = (value: number) => {
    setHasSnappedX(false); // Reset snap state when user stops sliding
    onXPositionChangeEnd?.(value);
  };

  const handleYPositionChangeEnd = (value: number) => {
    setHasSnappedY(false); // Reset snap state when user stops sliding
    onYPositionChangeEnd?.(value);
  };

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
      // Choose position based on toggle state
      let targetPosition;
      if (isSnappedToBottom) {
        // Move to bottom of screen - use a large positive value
        targetPosition = screenHeight * 0.4; // This will move it to the bottom
      } else {
        // Dynamic expanded position based on screen height
        targetPosition = -(screenHeight * 0.5 - screenHeight * 0.45);
      }
      
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: targetPosition,
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
  }, [isExpanded, screenHeight, isSnappedToBottom]);

  const handleExpand = () => {
    onExpand?.();
  };

  const handleTogglePosition = () => {
    setIsSnappedToBottom(!isSnappedToBottom);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const containerGesture = Gesture.Tap()
    .onEnd(() => {
      if (isExpanded && onCollapse) {
        onCollapse();
      }
    })
    .runOnJS(true);

  // Simple coordinate ranges - always 0-100 for positioning
  const getCoordinateRanges = () => {
    return {
      xRange: { min: 0, max: 100 },
      yRange: { min: 0, max: 100 },
      scaleRange: singleQRMode ? { min: 0.5, max: 1.5 } : { min: 0.7, max: 1.3 }
    };
  };

  if (!visible) return null;

  const { xRange, yRange, scaleRange } = getCoordinateRanges();

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
      pointerEvents={isExpanded ? "auto" : "box-none"}
    >
      <Animated.View style={{ opacity: containerOpacity }}>
        {isExpanded ? (
          <View style={[styles.expandedCard, { borderRadius: scaleSpacing(12) }]}>
            <View 
              ref={slidersRef}
              style={[styles.sliderContent, { padding: scaleSpacing(20) }]}
            >
              <View style={[styles.sliderHeader, { marginBottom: scaleSpacing(16) }]}>
                <TouchableOpacity 
                  style={[styles.toggleButton, { 
                    paddingHorizontal: scaleSpacing(8), 
                    paddingVertical: scaleSpacing(4),
                    borderRadius: scaleSpacing(6)
                  }]}
                  onPress={handleTogglePosition}
                  activeOpacity={0.7}
                >
                  <Feather 
                    name={isSnappedToBottom ? "chevron-up" : "chevron-down"} 
                    size={scaleFont(20)} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.resetButton, { 
                    paddingHorizontal: scaleSpacing(8), 
                    paddingVertical: scaleSpacing(4),
                    borderRadius: scaleSpacing(6)
                  }]}
                  onPress={() => {
                    // Reset to default values (centered at 50, 50)
                    onXPositionChange(50); // Center horizontally
                    onYPositionChange(50); // Center vertically (consistent with system default)
                    onScaleChange(1.0); // Default scale
                    
                    // Trigger end callbacks for persistence
                    onXPositionChangeEnd?.(50);
                    onYPositionChangeEnd?.(50);
                    onScaleChangeEnd?.(1.0);
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="rotate-ccw" size={scaleFont(16)} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.sliderRow, { marginBottom: scaleSpacing(16) }]}>
                <Feather name="arrow-up" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
                <Slider
                  style={styles.slider}
                  minimumValue={yRange.min}
                  maximumValue={yRange.max}
                  value={yPosition}
                  onValueChange={handleYPositionChange}
                  onSlidingComplete={handleYPositionChangeEnd}
                  minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="white"
                />
              </View>
 
              <View style={[styles.sliderRow, { marginBottom: scaleSpacing(16) }]}>
                <Feather name="arrow-left" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
                <Slider
                  style={styles.slider}
                  minimumValue={xRange.min}
                  maximumValue={xRange.max}
                  value={xPosition}
                  onValueChange={handleXPositionChange}
                  onSlidingComplete={handleXPositionChangeEnd}
                  minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="white"
                />
              </View>
 
              <View style={[styles.sliderRow, { marginBottom: scaleSpacing(8) }]}>
                <Feather name="maximize-2" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
                <Slider
                  style={styles.slider}
                  minimumValue={scaleRange.min}
                  maximumValue={scaleRange.max}
                  value={scaleValue}
                  onValueChange={onScaleChange}
                  onSlidingComplete={onScaleChangeEnd}
                  minimumTrackTintColor="rgba(255, 255, 255, 0.8)"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="white"
                />
              </View>
            </View>
          </View>
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
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
});