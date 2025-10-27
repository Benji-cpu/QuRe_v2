// app/components/home/SwipeIndicator.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SwipeIndicatorProps {
  onFadeComplete?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function SwipeIndicator({ onFadeComplete, style }: SwipeIndicatorProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const leftChevronX = useRef(new Animated.Value(0)).current;
  const rightChevronX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const OFFSET = 18;
    const SEGMENT_DURATION = 600;
    const DISPLAY_DURATION = 5200;

    opacity.setValue(0);
    leftChevronX.setValue(0);
    rightChevronX.setValue(0);

    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    const leftCycle = Animated.loop(
      Animated.sequence([
        Animated.timing(leftChevronX, {
          toValue: -OFFSET,
          duration: SEGMENT_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(leftChevronX, {
          toValue: 0,
          duration: SEGMENT_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(leftChevronX, {
          toValue: OFFSET,
          duration: SEGMENT_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(leftChevronX, {
          toValue: 0,
          duration: SEGMENT_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true }
    );

    const rightCycle = Animated.loop(
      Animated.sequence([
        Animated.timing(rightChevronX, {
          toValue: OFFSET,
          duration: SEGMENT_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rightChevronX, {
          toValue: 0,
          duration: SEGMENT_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rightChevronX, {
          toValue: -OFFSET,
          duration: SEGMENT_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rightChevronX, {
          toValue: 0,
          duration: SEGMENT_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true }
    );

    const fadeOut = () => {
      Animated.parallel([
        Animated.timing(leftChevronX, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rightChevronX, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          onFadeComplete?.();
        });
      });
    };

    fadeIn.start(() => {
      leftCycle.start();
      rightCycle.start();
    });

    const fadeOutTimeout = setTimeout(() => {
      leftCycle.stop();
      rightCycle.stop();
      fadeOut();
    }, DISPLAY_DURATION);

    return () => {
      fadeIn.stop();
      leftCycle.stop();
      rightCycle.stop();
      clearTimeout(fadeOutTimeout);
      opacity.stopAnimation();
      leftChevronX.stopAnimation();
      rightChevronX.stopAnimation();
    };
  }, [leftChevronX, rightChevronX, opacity, onFadeComplete]);

  return (
    <Animated.View style={[styles.container, style, { opacity }]} pointerEvents="none">
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ translateX: leftChevronX }] }}>
            <Feather name="chevron-left" size={18} color="white" />
          </Animated.View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Swipe to change gradient</Text>
          <Text style={styles.subtitle}>Browse lock-screen color blends</Text>
        </View>

        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ translateX: rightChevronX }] }}>
            <Feather name="chevron-right" size={18} color="white" />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
});
