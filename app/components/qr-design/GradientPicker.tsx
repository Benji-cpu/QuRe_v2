import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GradientPickerProps {
  selectedGradient: string[];
  onGradientSelect: (gradient: string[]) => void;
}

const PRESET_GRADIENTS = [
  ['#FF0000', '#00FF00'],
  ['#0000FF', '#FFFF00'],
  ['#FF00FF', '#00FFFF'],
  ['#FFA500', '#800080'],
  ['#FF1493', '#00CED1'],
  ['#32CD32', '#FF6347'],
  ['#4B0082', '#FFD700'],
  ['#DC143C', '#00BFFF']
];

export default function GradientPicker({ selectedGradient, onGradientSelect }: GradientPickerProps) {
  const isSelected = (gradient: string[]) => 
    gradient[0] === selectedGradient[0] && gradient[1] === selectedGradient[1];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gradient Colors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gradientsRow}>
          {PRESET_GRADIENTS.map((gradient, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.gradientOption,
                isSelected(gradient) && styles.selectedGradient
              ]}
              onPress={() => onGradientSelect(gradient)}
            >
              <LinearGradient
                colors={gradient}
                style={styles.gradientPreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              {isSelected(gradient) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  gradientsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  gradientOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedGradient: {
    borderColor: '#2196f3',
    borderWidth: 3,
  },
  gradientPreview: {
    flex: 1,
  },
  checkmark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196f3',
  },
});