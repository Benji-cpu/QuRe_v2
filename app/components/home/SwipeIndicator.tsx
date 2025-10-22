// app/components/home/SwipeIndicator.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SwipeIndicatorProps {
  onFadeComplete?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function SwipeIndicator({ onFadeComplete, style }: SwipeIndicatorProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const leftChevronX = useRef(new Animated.Value(0)).current;
  const rightChevronX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSequence = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(leftChevronX, {
              toValue: -10,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rightChevronX, {
              toValue: 10,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(leftChevronX, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rightChevronX, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]),
        { iterations: 3 }
      ),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        delay: 400,
        useNativeDriver: true,
      }),
    ]);

    showSequence.start(() => {
      onFadeComplete?.();
    });

    return () => {
      opacity.stopAnimation();
      leftChevronX.stopAnimation();
      rightChevronX.stopAnimation();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, style, { opacity }]}>
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
    width: '100%',
    padding: 10,
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
    marginHorizontal: 8,
  },
  title: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 1,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
});
