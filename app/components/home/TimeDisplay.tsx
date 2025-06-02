import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimeDisplayProps {
  currentTime: Date;
}

export default function TimeDisplay({ currentTime }: TimeDisplayProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
      <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timeContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  timeText: {
    fontSize: 56,
    fontWeight: '200',
    color: 'white',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
});