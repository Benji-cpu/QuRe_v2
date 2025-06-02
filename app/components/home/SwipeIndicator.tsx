import { Feather } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

export default function SwipeIndicator() {
  const leftArrowOpacity = useSharedValue(0.5);
  const rightArrowOpacity = useSharedValue(0.5);
  const leftArrowTranslateX = useSharedValue(0);
  const rightArrowTranslateX = useSharedValue(0);

  useEffect(() => {
    leftArrowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    rightArrowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    leftArrowTranslateX.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    rightArrowTranslateX.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const leftArrowStyle = useAnimatedStyle(() => {
    return {
      opacity: leftArrowOpacity.value,
      transform: [{ translateX: leftArrowTranslateX.value }],
    };
  });

  const rightArrowStyle = useAnimatedStyle(() => {
    return {
      opacity: rightArrowOpacity.value,
      transform: [{ translateX: rightArrowTranslateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="chevrons-left" size={24} color="white" />
        <Feather name="chevrons-right" size={24} color="white" />
      </View>
      <View style={styles.content}>
        <Animated.View style={[styles.arrow, leftArrowStyle]}>
          <Feather name="chevron-left" size={20} color="white" />
        </Animated.View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Swipe to change background</Text>
          <Text style={styles.subtitle}>Change gradient colors</Text>
        </View>
        <Animated.View style={[styles.arrow, rightArrowStyle]}>
          <Feather name="chevron-right" size={20} color="white" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    marginHorizontal: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});