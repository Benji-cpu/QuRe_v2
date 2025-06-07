// app/components/home/PositionSlider.tsx
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface PositionSliderProps {
  verticalValue: number;
  horizontalValue: number;
  scaleValue: number;
  onVerticalChange: (value: number) => void;
  onHorizontalChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  visible: boolean;
}

export default function PositionSlider({ 
  verticalValue, 
  horizontalValue,
  scaleValue,
  onVerticalChange, 
  onHorizontalChange,
  onScaleChange,
  visible 
}: PositionSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [opacity] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(1));

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

  const handlePress = () => {
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(true);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleDismiss = () => {
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(false);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.cardContainer}>
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
          {isExpanded ? (
            <View style={styles.expandedCard}>
              <View style={styles.sliderSection}>
                <View style={styles.sliderHeader}>
                  <Feather name="move" size={20} color="white" />
                  <Text style={styles.sliderLabel}>Position</Text>
                </View>
                
                <View style={styles.sliderRow}>
                  <Feather name="arrow-up" size={16} color="rgba(255, 255, 255, 0.6)" />
                  <Slider
                    style={styles.slider}
                    minimumValue={20}
                    maximumValue={150}
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
                    minimumValue={-50}
                    maximumValue={50}
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
                   maximumValue={1.3}
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
           <TouchableOpacity style={styles.notificationCard} onPress={handlePress}>
             <View style={styles.iconContainer}>
               <Feather name="move" size={24} color="white" />
             </View>
             <View style={styles.notificationContent}>
               <Text style={styles.notificationTitle}>Adjust QR position</Text>
               <Text style={styles.notificationSubtitle}>Move and resize your QR codes</Text>
             </View>
           </TouchableOpacity>
         )}
       </Animated.View>
     </View>
   </Animated.View>
 );
}

const styles = StyleSheet.create({
 container: {
   paddingHorizontal: 20,
   marginBottom: 12,
 },
 cardContainer: {
   backgroundColor: 'rgba(255, 255, 255, 0.2)',
   borderRadius: 12,
   padding: 16,
 },
 content: {
   minHeight: 42,
 },
 notificationCard: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 iconContainer: {
   width: 40,
   height: 40,
   borderRadius: 20,
   backgroundColor: 'rgba(255, 255, 255, 0.1)',
   alignItems: 'center',
   justifyContent: 'center',
   marginRight: 12,
 },
 notificationContent: {
   flex: 1,
 },
 notificationTitle: {
   fontSize: 16,
   fontWeight: '600',
   color: 'white',
   marginBottom: 1,
 },
 notificationSubtitle: {
   fontSize: 13,
   color: 'rgba(255, 255, 255, 0.8)',
 },
 expandedCard: {
   gap: 16,
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