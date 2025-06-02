import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DevToolsProps {
  isPremium: boolean;
  onTestUpgrade: () => void;
  onToggleOnboarding: () => void;
}

export default function DevTools({ isPremium, onTestUpgrade, onToggleOnboarding }: DevToolsProps) {
  return (
    <View style={styles.devTools}>
      <TouchableOpacity style={styles.devButton} onPress={onTestUpgrade}>
        <Text style={styles.devButtonText}>Test Upgrade</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.devButton, styles.orangeButton]} onPress={onToggleOnboarding}>
        <Text style={styles.devButtonText}>Toggle Onboarding</Text>
      </TouchableOpacity>
      <Text style={styles.premiumStatus}>Premium: {isPremium ? 'YES' : 'NO'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  devTools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 8,
  },
  devButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  orangeButton: {
    backgroundColor: '#FF9800',
  },
  devButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  premiumStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
});