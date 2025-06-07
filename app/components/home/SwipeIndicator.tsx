// app/components/home/SwipeIndicator.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface SwipeIndicatorProps {
  onFadeComplete?: () => void;
}

export default function SwipeIndicator({ onFadeComplete }: SwipeIndicatorProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const leftHandX = useRef(new Animated.Value(0)).current;
  const rightHandX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(leftHandX, {
              toValue: -30,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(rightHandX, {
              toValue: 30,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(leftHandX, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(rightHandX, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        { iterations: 2 }
      ),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFadeComplete?.();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.iconWrapper,
            { transform: [{ translateX: leftHandX }] }
          ]}
        >
          <Feather name="chevron-left" size={24} color="rgba(255, 255, 255, 0.9)" />
        </Animated.View>
        
        <Text style={styles.swipeText}>Swipe to change gradient</Text>
        
        <Animated.View 
          style={[
            styles.iconWrapper,
            { transform: [{ translateX: rightHandX }] }
          ]}
        >
          <Feather name="chevron-right" size={24} color="rgba(255, 255, 255, 0.9)" />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 400,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 24,
  },
  iconWrapper: {
    opacity: 0.9,
  },
  swipeText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});