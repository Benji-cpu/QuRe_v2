// app/components/qr-design/GradientPicker.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ColorPicker from './ColorPicker';

interface GradientPickerProps {
  selectedGradient: string[];
  onGradientSelect: (gradient: string[]) => void;
}

const PRESET_GRADIENTS = [
  ['#FF0000', '#FF7F00'],
  ['#FF7F00', '#FFFF00'],
  ['#FFFF00', '#00FF00'],
  ['#00FF00', '#0000FF'],
  ['#0000FF', '#4B0082'],
  ['#4B0082', '#9400D3'],
  ['#FF1493', '#00CED1'],
  ['#32CD32', '#FF6347'],
  ['#4B0082', '#FFD700'],
  ['#DC143C', '#00BFFF']
];

export default function GradientPicker({ selectedGradient, onGradientSelect }: GradientPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor1, setCustomColor1] = useState(selectedGradient[0]);
  const [customColor2, setCustomColor2] = useState(selectedGradient[1]);
  
  const isSelected = (gradient: string[]) => 
    gradient[0] === selectedGradient[0] && gradient[1] === selectedGradient[1];

  const handleCustomGradient = () => {
    onGradientSelect([customColor1, customColor2]);
    setShowCustomPicker(false);
  };

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
                colors={gradient as unknown as readonly [string, string, ...string[]]}
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
          
          <TouchableOpacity
            style={[
              styles.gradientOption,
              styles.customGradientButton
            ]}
            onPress={() => setShowCustomPicker(true)}
          >
            <LinearGradient
              colors={[customColor1, customColor2]}
              style={styles.gradientPreview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.customIcon}>
              <Text style={styles.customIconText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showCustomPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom Gradient</Text>
            
            <ColorPicker
              label="Start Color"
              selectedColor={customColor1}
              onColorSelect={setCustomColor1}
            />
            
            <ColorPicker
              label="End Color"
              selectedColor={customColor2}
              onColorSelect={setCustomColor2}
            />
            
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Preview</Text>
              <LinearGradient
                colors={[customColor1, customColor2]}
                style={styles.largePreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCustomPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={handleCustomGradient}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  customGradientButton: {
    borderStyle: 'dashed',
  },
  customIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  largePreview: {
    height: 80,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#2196f3',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});