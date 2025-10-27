// app/components/home/PositionSlider.tsx
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_QR_X_POSITION,
  DEFAULT_QR_Y_POSITION,
  DEFAULT_SINGLE_QR_X_POSITION,
  MIN_DOUBLE_QR_SCALE,
  MIN_SINGLE_QR_SCALE,
} from '../../../constants/qrPlacement';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

interface PositionSliderProps {
  xPosition: number; // 0-100 coordinate system (0=left, 100=right)
  yPosition: number; // 0-100 coordinate system (0=bottom, 100=top)
  scaleValue: number;
  onXPositionChange: (value: number) => void;
  onYPositionChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onXPositionChangeEnd?: (value: number) => void;
  onYPositionChangeEnd?: (value: number) => void;
  onScaleChangeEnd?: (value: number) => void;
  onResetPosition?: (x: number, y: number, scale: number) => void;
  visible: boolean;
  isExpanded: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  singleQRMode?: boolean;
  collapsedAccessory?: ReactNode;
  safeAreaInsets?: EdgeInsets;
}

type Anchor = 'top' | 'bottom';

const SNAP_THRESHOLD = 3;
const SNAP_TARGETS_X = Array.from(new Set([DEFAULT_QR_X_POSITION, DEFAULT_SINGLE_QR_X_POSITION, 50]));
const SNAP_TARGETS_Y = Array.from(new Set([DEFAULT_QR_Y_POSITION, 50]));
const SHEET_HORIZONTAL_PADDING = 20;

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
  onResetPosition,
  visible,
  isExpanded,
  onExpand,
  onCollapse,
  singleQRMode = false,
  collapsedAccessory,
  safeAreaInsets,
}: PositionSliderProps) {
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const anchorAnim = useRef(new Animated.Value(0)).current;

  const [snappedTargetX, setSnappedTargetX] = useState<number | null>(null);
  const [snappedTargetY, setSnappedTargetY] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<Anchor>('top');
  const [cardHeight, setCardHeight] = useState(0);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const defaultInsets = useSafeAreaInsets();
  const insets = safeAreaInsets ?? defaultInsets;

  const scale = screenWidth / 375; // Base width of iPhone X
  const scaleFont = (size: number) => Math.round(size * Math.min(scale, 1.2));
  const scaleSpacing = (size: number) => Math.round(size * scale);

  useEffect(() => {
    if (!visible) return;
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [visible, animatedOpacity]);

  useEffect(() => {
    if (isExpanded) {
      setAnchor('top');
      anchorAnim.stopAnimation(() => {
        anchorAnim.setValue(0);
      });
    } else {
      setSnappedTargetX(null);
      setSnappedTargetY(null);
    }
  }, [isExpanded, anchorAnim]);

  if (!visible) {
    return null;
  }

  const verticalSpacing = scaleSpacing(16);
  const bottomSafeSpacing = Math.max(insets.bottom + scaleSpacing(32), scaleSpacing(52));
  const topMargin = insets.top + verticalSpacing;
  const bottomMargin = bottomSafeSpacing + verticalSpacing;
  const availableSpace = Math.max(0, screenHeight - topMargin - bottomMargin - cardHeight);
  const translateY = anchorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, availableSpace],
  });

  const handleBackgroundPress = () => {
    onCollapse?.();
  };

  const handleAnchorChange = (next: Anchor) => {
    if (next === anchor) return;
    setAnchor(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(anchorAnim, {
      toValue: next === 'top' ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handleSnapPosition = (value: number, axis: 'x' | 'y') => {
    const snapTargets = axis === 'x' ? SNAP_TARGETS_X : SNAP_TARGETS_Y;
    const currentSnap = axis === 'x' ? snappedTargetX : snappedTargetY;
    const setSnapTarget = axis === 'x' ? setSnappedTargetX : setSnappedTargetY;
    const handleChange = axis === 'x' ? onXPositionChange : onYPositionChange;

    const nextTarget = snapTargets.find((target) => Math.abs(value - target) <= SNAP_THRESHOLD);

    if (nextTarget !== undefined) {
      if (currentSnap !== nextTarget) {
        setSnapTarget(nextTarget);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        handleChange(nextTarget);
      }
      return nextTarget;
    }

    if (currentSnap !== null) {
      setSnapTarget(null);
    }

    return value;
  };

  const handleXChange = (value: number) => {
    const snapped = handleSnapPosition(value, 'x');
    if (snapped !== value) return;
    onXPositionChange(value);
  };

  const handleYChange = (value: number) => {
    const snapped = handleSnapPosition(value, 'y');
    if (snapped !== value) return;
    onYPositionChange(value);
  };

  const handleXEnd = (value: number) => {
    setSnappedTargetX(null);
    onXPositionChangeEnd?.(value);
  };

  const handleYEnd = (value: number) => {
    setSnappedTargetY(null);
    onYPositionChangeEnd?.(value);
  };

  const reset = () => {
    const defaultScale = singleQRMode ? MIN_SINGLE_QR_SCALE : MIN_DOUBLE_QR_SCALE;
    const defaultX = singleQRMode ? DEFAULT_SINGLE_QR_X_POSITION : DEFAULT_QR_X_POSITION;
    setSnappedTargetX(null);
    setSnappedTargetY(null);

    if (onResetPosition) {
      onResetPosition(
        defaultX,
        DEFAULT_QR_Y_POSITION,
        defaultScale,
      );
    } else {
      onXPositionChange(defaultX);
      onYPositionChange(DEFAULT_QR_Y_POSITION);
      onScaleChange(defaultScale);
    }
    onXPositionChangeEnd?.(defaultX);
    onYPositionChangeEnd?.(DEFAULT_QR_Y_POSITION);
    onScaleChangeEnd?.(defaultScale);
  };

  const scaleRange = singleQRMode
    ? { min: MIN_SINGLE_QR_SCALE, max: 1.5 }
    : { min: MIN_DOUBLE_QR_SCALE, max: 1.3 };

  return (
    <>
      {!isExpanded && (
        <Animated.View
          style={[
            styles.collapsedWrapper,
            {
              opacity: animatedOpacity,
              paddingHorizontal: SHEET_HORIZONTAL_PADDING,
              marginBottom: scaleSpacing(8),
              paddingBottom: bottomSafeSpacing,
              zIndex: 50,
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={[
              styles.collapsedCard,
              {
                borderRadius: scaleSpacing(12),
                padding: scaleSpacing(10),
                minHeight: scaleSpacing(60),
              },
            ]}
            onPress={onExpand}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  width: scaleSpacing(32),
                  height: scaleSpacing(32),
                  borderRadius: scaleSpacing(16),
                  marginRight: scaleSpacing(8),
                },
              ]}
            >
              <Feather name="move" size={scaleFont(20)} color="white" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { fontSize: scaleFont(12) }]}>Adjust QR position</Text>
              <Text style={[styles.notificationSubtitle, { fontSize: scaleFont(10) }]}>Move and resize QR codes</Text>
            </View>
          </TouchableOpacity>

          {collapsedAccessory && (
            <View style={{ marginTop: scaleSpacing(8) }}>
              {collapsedAccessory}
            </View>
          )}
        </Animated.View>
      )}

      {isExpanded && (
        <Modal
          transparent
          statusBarTranslucent
          animationType="fade"
          visible
          onRequestClose={handleBackgroundPress}
        >
          <View style={styles.modalRoot}>
            <TouchableWithoutFeedback onPress={handleBackgroundPress}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                styles.expandedCard,
                {
                  borderRadius: scaleSpacing(12),
                  paddingVertical: scaleSpacing(20),
                  paddingHorizontal: scaleSpacing(20),
                  left: SHEET_HORIZONTAL_PADDING,
                  right: SHEET_HORIZONTAL_PADDING,
                  top: topMargin,
                  transform: [{ translateY }],
                },
              ]}
              onLayout={(event) => {
                const nextHeight = event.nativeEvent.layout.height;
                if (Math.abs(nextHeight - cardHeight) > 1) {
                  setCardHeight(nextHeight);
                }
              }}
            >
              <View style={[styles.sheetHeader, { marginBottom: scaleSpacing(16) }]}> 
                <View style={styles.anchorButtons}>
                  <TouchableOpacity
                    style={[styles.anchorButton, anchor === 'top' && styles.anchorButtonActive]}
                    onPress={() => handleAnchorChange('top')}
                    activeOpacity={0.8}
                  >
                    <Feather name="arrow-up" size={scaleFont(16)} color="white" />
                    <Text style={[styles.anchorLabel, { fontSize: scaleFont(12) }]}>Top</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.anchorButton, anchor === 'bottom' && styles.anchorButtonActive]}
                    onPress={() => handleAnchorChange('bottom')}
                    activeOpacity={0.8}
                  >
                    <Feather name="arrow-down" size={scaleFont(16)} color="white" />
                    <Text style={[styles.anchorLabel, { fontSize: scaleFont(12) }]}>Bottom</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.resetButton, { padding: scaleSpacing(8), borderRadius: scaleSpacing(6) }]}
                  onPress={reset}
                  activeOpacity={0.8}
                >
                  <Feather name="rotate-ccw" size={scaleFont(16)} color="rgba(255, 255, 255, 0.85)" />
                </TouchableOpacity>
              </View>

              <View style={[styles.sliderRow, { marginBottom: scaleSpacing(16) }]}> 
                <Feather name="arrow-up" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={yPosition}
                  onValueChange={handleYChange}
                  onSlidingComplete={handleYEnd}
                  minimumTrackTintColor="rgba(255,255,255,0.8)"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="white"
                />
              </View>

              <View style={[styles.sliderRow, { marginBottom: scaleSpacing(16) }]}> 
                <Feather name="arrow-left" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={xPosition}
                  onValueChange={handleXChange}
                  onSlidingComplete={handleXEnd}
                  minimumTrackTintColor="rgba(255,255,255,0.8)"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="white"
                />
              </View>

              <View style={styles.sliderRow}> 
                <Feather name="maximize-2" size={scaleFont(16)} color="rgba(255, 255, 255, 0.6)" />
                <Slider
                  style={styles.slider}
                  minimumValue={scaleRange.min}
                  maximumValue={scaleRange.max}
                  value={scaleValue}
                  onValueChange={onScaleChange}
                  onSlidingComplete={onScaleChangeEnd}
                  minimumTrackTintColor="rgba(255,255,255,0.8)"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="white"
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  collapsedWrapper: {
    width: '100%',
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
    marginBottom: 2,
  },
  notificationSubtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  expandedCard: {
    position: 'absolute',
    backgroundColor: 'rgba(24, 24, 24, 0.94)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  anchorButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  anchorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  anchorButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  anchorLabel: {
    color: 'white',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
