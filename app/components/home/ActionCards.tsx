// app/components/home/ActionCards.tsx
import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionCardsProps {
  onExportWallpaper: () => void;
  onShareWallpaper: () => void;
  onSettings: () => void;
  showShareButton?: boolean;
}

interface SwipeHelperCardProps {
  visible: boolean;
  onDismiss?: () => void;
}

const SWIPE_HELPER_VISIBLE_DURATION = 4200;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function ActionCards({
  onExportWallpaper,
  onShareWallpaper,
  onSettings,
  showShareButton = false,
}: ActionCardsProps) {
  return (
    <View style={styles.actionsRow}>
      <TouchableOpacity style={[styles.actionCard, styles.cardSpacing]} onPress={onExportWallpaper}>
        <View style={styles.iconContainer}>
          <Feather name="download" size={18} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            Set as
          </Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            Lock Screen
          </Text>
        </View>
      </TouchableOpacity>

      {showShareButton && (
        <TouchableOpacity style={[styles.actionCard, styles.cardSpacing]} onPress={onShareWallpaper}>
          <View style={styles.iconContainer}>
            <Feather name="share" size={18} color="white" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              Share
            </Text>
            <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
              Lock Screen
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.actionCard} onPress={onSettings}>
        <View style={styles.iconContainer}>
          <Feather name="settings" size={18} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            Settings
          </Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            & Plans
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(ActionCards);

export function SwipeHelperCard({ visible, onDismiss }: SwipeHelperCardProps) {
  const helperOpacity = useRef(new Animated.Value(0)).current;
  const helperTranslateY = useRef(new Animated.Value(8)).current;
  const chevronPulse = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const chevronLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const renderToggleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const helperIsActiveRef = useRef(false);
  const helperShouldBeVisibleRef = useRef(false);
  const dismissalNotifiedRef = useRef(false);
  const isMountedRef = useRef(true);

  const [rendered, setRendered] = useState(false);

  const stopChevronPulse = useCallback(() => {
    if (chevronLoopRef.current) {
      chevronLoopRef.current.stop();
      chevronLoopRef.current = null;
    }
    chevronPulse.stopAnimation();
    chevronPulse.setValue(0);
  }, [chevronPulse]);

  const scheduleRenderedChange = useCallback(
    (value: boolean) => {
      if (renderToggleTimeoutRef.current) {
        clearTimeout(renderToggleTimeoutRef.current);
      }

      renderToggleTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          if (!value) {
            stopChevronPulse();
          }
          setRendered(value);
        }
      }, 0);
    },
    [stopChevronPulse]
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        animationRef.current.stop();
      }
      if (renderToggleTimeoutRef.current) {
        clearTimeout(renderToggleTimeoutRef.current);
        renderToggleTimeoutRef.current = null;
      }
      stopChevronPulse();
    };
  }, [stopChevronPulse]);

  const notifyDismissed = useCallback(() => {
    if (!dismissalNotifiedRef.current) {
      dismissalNotifiedRef.current = true;
      onDismiss?.();
    }
  }, [onDismiss]);

  const clearCurrentAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  const startChevronPulse = useCallback(() => {
    stopChevronPulse();
    chevronPulse.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronPulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(chevronPulse, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    chevronLoopRef.current = loop;
    loop.start();
  }, [chevronPulse, stopChevronPulse]);

  const startHelperSequence = useCallback(() => {
    helperShouldBeVisibleRef.current = true;
    helperIsActiveRef.current = true;
    dismissalNotifiedRef.current = false;
    clearCurrentAnimation();

    helperOpacity.setValue(0);
    helperTranslateY.setValue(8);
    if (isMountedRef.current) {
      scheduleRenderedChange(true);
    }

    const fadeIn = Animated.parallel([
      Animated.timing(helperOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(helperTranslateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const hold = Animated.delay(SWIPE_HELPER_VISIBLE_DURATION);

    const fadeOut = Animated.parallel([
      Animated.timing(helperOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(helperTranslateY, {
        toValue: -4,
        duration: 220,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animationRef.current = Animated.sequence([fadeIn, hold, fadeOut]);
    animationRef.current.start(({ finished }) => {
      animationRef.current = null;
      helperIsActiveRef.current = false;
      helperShouldBeVisibleRef.current = false;
      if (isMountedRef.current) {
        scheduleRenderedChange(false);
      }
      if (finished) {
        notifyDismissed();
      }
    });

    startChevronPulse();
  }, [clearCurrentAnimation, helperOpacity, helperTranslateY, notifyDismissed, scheduleRenderedChange, startChevronPulse]);

  const dismissHelper = useCallback(() => {
    helperShouldBeVisibleRef.current = false;
    clearCurrentAnimation();

    if (!helperIsActiveRef.current && !rendered) {
      notifyDismissed();
      return;
    }

    helperIsActiveRef.current = true;
    stopChevronPulse();

    animationRef.current = Animated.parallel([
      Animated.timing(helperOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(helperTranslateY, {
        toValue: -4,
        duration: 180,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animationRef.current.start(({ finished }) => {
      animationRef.current = null;
      helperIsActiveRef.current = false;
      if (isMountedRef.current) {
        scheduleRenderedChange(false);
      }
      if (finished || !dismissalNotifiedRef.current) {
        notifyDismissed();
      }
    });
  }, [clearCurrentAnimation, helperOpacity, helperTranslateY, notifyDismissed, rendered, scheduleRenderedChange, stopChevronPulse]);

  useEffect(() => {
    if (visible) {
      startHelperSequence();
    } else if (helperShouldBeVisibleRef.current) {
      dismissHelper();
    }
  }, [dismissHelper, startHelperSequence, visible]);

  const handleHelperPress = useCallback(() => {
    dismissHelper();
  }, [dismissHelper]);

  const shouldRender = rendered || visible;

  const leftChevronStyle = useMemo(
    () => ({
      transform: [{ translateX: chevronPulse.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
      opacity: chevronPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] }),
    }),
    [chevronPulse]
  );

  const rightChevronStyle = useMemo(
    () => ({
      transform: [{ translateX: chevronPulse.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) }],
      opacity: chevronPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] }),
    }),
    [chevronPulse]
  );

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.actionsRow,
        styles.helperWrapper,
        {
          opacity: helperOpacity,
          transform: [{ translateY: helperTranslateY }],
        },
      ]}
    >
      <AnimatedTouchableOpacity activeOpacity={0.85} onPress={handleHelperPress} style={styles.actionCard}>
        <View style={styles.iconContainer}>
          <Feather name="layers" size={18} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            Try swiping the gradient
          </Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            Swipe left or right to change looks
          </Text>
        </View>
        <View style={styles.helperChevronContainer} pointerEvents="none">
          <Animated.View style={[styles.helperChevron, leftChevronStyle]}>
            <Feather name="chevron-left" size={20} color="rgba(255, 255, 255, 0.85)" />
          </Animated.View>
          <Animated.View style={[styles.helperChevron, rightChevronStyle]}>
            <Feather name="chevron-right" size={20} color="rgba(255, 255, 255, 0.85)" />
          </Animated.View>
        </View>
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardSpacing: {
    marginRight: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    lineHeight: 14,
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 12,
  },
  helperWrapper: {
    paddingHorizontal: 20,
    zIndex: 10,
  },
  helperChevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  helperChevron: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
