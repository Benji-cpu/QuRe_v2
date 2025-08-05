// app/components/qr-design/GradientPicker.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
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
  const { theme } = useTheme();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor1, setCustomColor1] = useState(selectedGradient[0]);
  const [customColor2, setCustomColor2] = useState(selectedGradient[1]);
  
  const isSelected = (gradient: string[]) => 
    gradient[0] === selectedGradient[0] && gradient[1] === selectedGradient[1];

  const isValidHex = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleCustomGradient = () => {
    // Validate hex colors before applying
    if (isValidHex(customColor1) && isValidHex(customColor2)) {
      onGradientSelect([customColor1, customColor2]);
      setShowCustomPicker(false);
    }
  };

  const handleHexInput = (value: string, colorIndex: number) => {
    // Ensure hex format
    let formattedValue = value.startsWith('#') ? value : '#' + value;
    formattedValue = formattedValue.toUpperCase();
    
    if (colorIndex === 1) {
      setCustomColor1(formattedValue);
    } else {
      setCustomColor2(formattedValue);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Gradient Colors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gradientsRow}>
          {PRESET_GRADIENTS.map((gradient, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.gradientOption,
                { borderColor: theme.border },
                isSelected(gradient) && [styles.selectedGradient, { borderColor: theme.primary }]
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
                  <Text style={[styles.checkmarkText, { color: theme.primary }]}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[
              styles.gradientOption,
              styles.customGradientButton,
              { borderColor: theme.border }
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
              <Text style={[styles.customIconText, { color: theme.textSecondary }]}>+</Text>
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
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Custom Gradient</Text>
            
            <View style={styles.colorSection}>
              <ColorPicker
                label="Start Color"
                selectedColor={customColor1}
                onColorSelect={setCustomColor1}
              />
              <View style={styles.hexInputContainer}>
                <Text style={[styles.hexLabel, { color: theme.textSecondary }]}>Hex:</Text>
                <TextInput
                  style={[styles.hexInput, { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: isValidHex(customColor1) ? theme.border : theme.error,
                    color: theme.text 
                  }]}
                  value={customColor1}
                  onChangeText={(value) => handleHexInput(value, 1)}
                  placeholder="#FF0000"
                  placeholderTextColor={theme.textTertiary}
                  maxLength={7}
                  autoCapitalize="characters"
                />
              </View>
            </View>
            
            <View style={styles.colorSection}>
              <ColorPicker
                label="End Color"
                selectedColor={customColor2}
                onColorSelect={setCustomColor2}
              />
              <View style={styles.hexInputContainer}>
                <Text style={[styles.hexLabel, { color: theme.textSecondary }]}>Hex:</Text>
                <TextInput
                  style={[styles.hexInput, { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: isValidHex(customColor2) ? theme.border : theme.error,
                    color: theme.text 
                  }]}
                  value={customColor2}
                  onChangeText={(value) => handleHexInput(value, 2)}
                  placeholder="#00FF00"
                  placeholderTextColor={theme.textTertiary}
                  maxLength={7}
                  autoCapitalize="characters"
                />
              </View>
            </View>
            
            <View style={styles.previewSection}>
              <Text style={[styles.previewLabel, { color: theme.text }]}>Preview</Text>
              <LinearGradient
                colors={[customColor1, customColor2]}
                style={styles.largePreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.surfaceVariant }]}
                onPress={() => setShowCustomPicker(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.applyButton, 
                  { backgroundColor: theme.primary },
                  (!isValidHex(customColor1) || !isValidHex(customColor2)) && [styles.disabledButton, { backgroundColor: theme.textTertiary }]
                ]}
                onPress={handleCustomGradient}
                disabled={!isValidHex(customColor1) || !isValidHex(customColor2)}
              >
                <Text style={[styles.applyButtonText, { color: theme.primaryText }]}>Apply</Text>
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
  },
  selectedGradient: {
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  applyButton: {
  },
  applyButtonText: {
    fontWeight: 'bold',
  },
  colorSection: {
    marginBottom: 16,
  },
  hexInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  hexLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 30,
  },
  hexInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  disabledButton: {
    opacity: 0.5,
  },
});