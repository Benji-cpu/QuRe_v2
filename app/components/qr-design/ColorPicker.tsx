import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

interface ColorPickerProps {
  label: string;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  showTransparent?: boolean;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
  '#FFD700', '#4B0082', '#DC143C', '#00CED1', '#32CD32'
];

export default function ColorPicker({ label, selectedColor, onColorSelect, showTransparent = false }: ColorPickerProps) {
  const { theme } = useTheme();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState(selectedColor);
  
  // Check if selected color is a custom color (not in presets and not transparent)
  const isCustomColor = selectedColor !== 'transparent' && !PRESET_COLORS.includes(selectedColor);
  
  const isValidHex = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleHexInput = (value: string) => {
    let formattedValue = value.startsWith('#') ? value : '#' + value;
    formattedValue = formattedValue.toUpperCase();
    setCustomColor(formattedValue);
  };

  const applyCustomColor = () => {
    if (isValidHex(customColor)) {
      onColorSelect(customColor);
      setShowCustomPicker(false);
    }
  };

  // Update custom color when modal opens if selected color is custom
  const handleCustomModalOpen = () => {
    setCustomColor(isCustomColor ? selectedColor : '#000000');
    setShowCustomPicker(true);
  };

  const renderColorOption = (color: string, isTransparent: boolean = false, isCustom: boolean = false) => {
    const isSelected = selectedColor === color || (isCustom && isCustomColor);
    
    return (
      <TouchableOpacity
        key={color}
        style={[
          styles.colorOption,
          { 
            backgroundColor: isTransparent ? 'transparent' : color,
            borderColor: isSelected ? theme.primary : theme.border
          },
          isSelected && styles.selectedColor,
          isTransparent && styles.transparentOption
        ]}
        onPress={isCustom ? handleCustomModalOpen : () => onColorSelect(color)}
      >
        {isTransparent && (
          <View style={styles.checkerboard}>
            <View style={[styles.checker, { backgroundColor: theme.textTertiary }]} />
            <View style={[styles.checker, { backgroundColor: theme.surfaceVariant }]} />
            <View style={[styles.checker, { backgroundColor: theme.surfaceVariant }]} />
            <View style={[styles.checker, { backgroundColor: theme.textTertiary }]} />
          </View>
        )}
        {isCustom && !isSelected && (
          <View style={styles.customIcon}>
            <Text style={[styles.customIconText, { color: theme.textTertiary }]}>+</Text>
          </View>
        )}
        {isSelected && (
          <View style={[styles.checkmark, isTransparent && styles.transparentCheckmark]}>
            <Text style={[styles.checkmarkText, { color: isTransparent ? theme.text : theme.primary }]}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      
      <View style={styles.colorContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <View style={styles.colorsRow}>
            {showTransparent && renderColorOption('transparent', true)}
            {PRESET_COLORS.map(color => renderColorOption(color))}
            {renderColorOption(isCustomColor ? selectedColor : theme.surfaceVariant, false, true)}
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.currentColorDisplay}>
        <Text style={[styles.currentColorLabel, { color: theme.textSecondary }]}>
          Current: {selectedColor === 'transparent' ? 'Transparent' : selectedColor}
        </Text>
        <View 
          style={[
            styles.currentColorPreview, 
            { 
              backgroundColor: selectedColor === 'transparent' ? 'transparent' : selectedColor,
              borderColor: theme.border
            }
          ]}
        >
          {selectedColor === 'transparent' && (
            <View style={styles.checkerboard}>
              <View style={[styles.checker, { backgroundColor: theme.textTertiary }]} />
              <View style={[styles.checker, { backgroundColor: theme.surfaceVariant }]} />
              <View style={[styles.checker, { backgroundColor: theme.surfaceVariant }]} />
              <View style={[styles.checker, { backgroundColor: theme.textTertiary }]} />
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={showCustomPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomPicker(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Custom Color</Text>
            
            <View style={styles.hexInputContainer}>
              <Text style={[styles.hexLabel, { color: theme.textSecondary }]}>Hex Color:</Text>
              <TextInput
                style={[styles.hexInput, { 
                  backgroundColor: theme.inputBackground, 
                  borderColor: isValidHex(customColor) ? theme.border : theme.error,
                  color: theme.text 
                }]}
                value={customColor}
                onChangeText={handleHexInput}
                placeholder="#000000"
                placeholderTextColor={theme.textTertiary}
                maxLength={7}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.previewSection}>
              <Text style={[styles.previewLabel, { color: theme.text }]}>Preview</Text>
              <View 
                style={[
                  styles.largePreview, 
                  { 
                    backgroundColor: customColor,
                    borderColor: theme.border
                  }
                ]} 
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
                  !isValidHex(customColor) && [styles.disabledButton, { backgroundColor: theme.textTertiary }]
                ]}
                onPress={applyCustomColor}
                disabled={!isValidHex(customColor)}
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
  container: {},
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  colorContainer: {
    alignItems: 'center', // Center the scroll view within the container
  },
  scrollView: {
    maxHeight: 60,
    flexGrow: 0, // Prevent scroll view from taking full width
  },
  scrollContent: {
    paddingHorizontal: 0, // Remove padding to let content determine its own width
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16, // Equal padding on both sides for the color row
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentOption: {
    overflow: 'hidden',
  },
  checkerboard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checker: {
    width: '50%',
    height: '50%',
  },
  selectedColor: {
    borderWidth: 3,
  },
  checkmark: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentCheckmark: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  customIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIconText: {
    fontSize: 20,
    fontWeight: '300',
  },
  currentColorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  currentColorLabel: {
    fontSize: 12,
  },
  currentColorPreview: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
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
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  hexInputContainer: {
    marginBottom: 20,
  },
  hexLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  hexInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewSection: {
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  largePreview: {
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
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
  cancelButton: {},
  cancelButtonText: {
    fontWeight: '600',
  },
  applyButton: {},
  applyButtonText: {
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});