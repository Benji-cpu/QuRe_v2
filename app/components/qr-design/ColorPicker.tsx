import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { CustomDesignStorage } from '../../../services/CustomDesignStorage';

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
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customHSV, setCustomHSV] = useState<HSV>({ h: 0, s: 0, v: 0 });
  const [spectrumSize, setSpectrumSize] = useState({ width: 0, height: 0 });
  
  // Check if selected color is a custom color (not in presets and not transparent)
  const isCustomColor = selectedColor !== 'transparent' && !PRESET_COLORS.includes(selectedColor) && !customColors.includes(selectedColor);

  // Load custom colors when component mounts
  useEffect(() => {
    loadCustomColors();
  }, []);

  const loadCustomColors = async () => {
    const colors = await CustomDesignStorage.getCustomColors();
    setCustomColors(colors);
  };
  
  const isValidHex = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleHexInput = (value: string) => {
    let formattedValue = value.startsWith('#') ? value : '#' + value;
    formattedValue = formattedValue.toUpperCase();
    setCustomColor(formattedValue);
    if (isValidHex(formattedValue)) {
      const hsv = hexToHsv(formattedValue);
      if (hsv) {
        setCustomHSV(hsv);
      }
    }
  };

  const applyCustomColor = async () => {
    if (isValidHex(customColor)) {
      // Save to custom colors storage
      await CustomDesignStorage.saveCustomColor(customColor);
      // Reload custom colors to show the new one
      await loadCustomColors();
      // Apply the color
      onColorSelect(customColor);
      setShowCustomPicker(false);
    }
  };

  // Update custom color when modal opens if selected color is custom
  const handleCustomModalOpen = () => {
    const startingHex = isCustomColor && isValidHex(selectedColor) ? selectedColor : '#000000';
    const normalizedHex = startingHex.toUpperCase();
    setCustomColor(normalizedHex);
    const hsv = hexToHsv(normalizedHex);
    if (hsv) {
      setCustomHSV(hsv);
    } else {
      setCustomHSV({ h: 0, s: 0, v: 0 });
    }
    setShowCustomPicker(true);
  };

  const hueColorHex = useMemo(() => hsvToHex({ h: customHSV.h, s: 1, v: 1 }), [customHSV.h]);

  const updateColorFromHSV = (nextHSV: HSV) => {
    const normalizedHSV: HSV = {
      h: clamp(nextHSV.h, 0, 360),
      s: clamp(nextHSV.s, 0, 1),
      v: clamp(nextHSV.v, 0, 1),
    };
    setCustomHSV(normalizedHSV);
    const nextHex = hsvToHex(normalizedHSV);
    setCustomColor(nextHex);
  };

  const clamp = (value: number, min = 0, max = 1) => {
    return Math.min(Math.max(value, min), max);
  };

  const handleSpectrumChange = (locationX: number, locationY: number) => {
    if (!spectrumSize.width || !spectrumSize.height) {
      return;
    }
    const s = clamp(locationX / spectrumSize.width);
    const v = clamp(1 - locationY / spectrumSize.height);
    updateColorFromHSV({ h: customHSV.h, s, v });
  };

  const spectrumPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          handleSpectrumChange(locationX, locationY);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          handleSpectrumChange(locationX, locationY);
        },
      }),
    [spectrumSize.width, spectrumSize.height, customHSV.h]
  );

  const handleSpectrumLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSpectrumSize({ width, height });
  };

  const handleHueChange = (value: number) => {
    const nextHue = clamp(value, 0, 360);
    updateColorFromHSV({ h: nextHue, s: customHSV.s, v: customHSV.v });
  };

  const spectrumPointerStyle = useMemo(() => {
    const pointerRadius = 12;
    const left = spectrumSize.width ? customHSV.s * spectrumSize.width : 0;
    const top = spectrumSize.height ? (1 - customHSV.v) * spectrumSize.height : 0;
    return {
      transform: [
        { translateX: clamp(left, 0, spectrumSize.width) - pointerRadius },
        { translateY: clamp(top, 0, spectrumSize.height) - pointerRadius },
      ],
    };
  }, [customHSV.s, customHSV.v, spectrumSize]);

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
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <View style={styles.colorsRow}>
            {showTransparent && renderColorOption('transparent', true)}
            {PRESET_COLORS.map(color => renderColorOption(color))}
            {customColors.map(color => renderColorOption(color))}
            {renderColorOption(isCustomColor ? selectedColor : theme.surfaceVariant, false, true)}
          </View>
        </ScrollView>
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
            
            <View style={styles.spectrumSection}>
              <Text style={[styles.previewLabel, { color: theme.text }]}>Select Color</Text>
              <View
                style={[
                  styles.spectrumContainer,
                  { borderColor: theme.border, backgroundColor: '#ffffff' },
                ]}
                onLayout={handleSpectrumLayout}
                {...spectrumPanResponder.panHandlers}
              >
                <LinearGradient
                  colors={['#FFFFFF', hueColorHex]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0)', '#000000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.spectrumPointer, { borderColor: theme.border }, spectrumPointerStyle]}>
                  <View style={[styles.spectrumPointerInner, { backgroundColor: customColor }]} />
                </View>
              </View>
            </View>

            <View style={styles.hueSection}>
              <Text style={[styles.previewLabel, { color: theme.text }]}>Hue</Text>
              <View style={styles.hueSliderContainer}>
                <LinearGradient
                  colors={[
                    '#FF0000',
                    '#FFFF00',
                    '#00FF00',
                    '#00FFFF',
                    '#0000FF',
                    '#FF00FF',
                    '#FF0000',
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.hueGradient}
                />
                <View style={styles.hueSlider}>
                  <Slider
                    value={customHSV.h}
                    onValueChange={handleHueChange}
                    minimumValue={0}
                    maximumValue={360}
                    step={1}
                    minimumTrackTintColor="transparent"
                    maximumTrackTintColor="transparent"
                    thumbTintColor={hsvToHex({ h: customHSV.h, s: 1, v: 1 })}
                  />
                </View>
              </View>
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
  container: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorContainer: {
    alignItems: 'flex-start',
  },
  scrollView: {
    minHeight: 56,
    paddingVertical: 4,
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  spectrumSection: {
    marginBottom: 24,
  },
  spectrumContainer: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  spectrumPointer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spectrumPointerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  hueSection: {
    marginBottom: 24,
  },
  hueSliderContainer: {
    height: 32,
    justifyContent: 'center',
  },
  hueGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    borderRadius: 6,
  },
  hueSlider: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -8,
    bottom: -8,
    justifyContent: 'center',
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

interface HSV {
  h: number;
  s: number;
  v: number;
}

const hsvToHex = ({ h, s, v }: HSV): string => {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
};

const hexToHsv = (hex: string): HSV | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return null;
  }
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (normalized.length !== 6) {
    return null;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(value)));
    const hex = clamped.toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsv = (r: number, g: number, b: number): HSV => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
  }

  if (h < 0) {
    h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
};

const hsvToRgb = (h: number, s: number, v: number): { r: number; g: number; b: number } => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  return {
    r: (rPrime + m) * 255,
    g: (gPrime + m) * 255,
    b: (bPrime + m) * 255,
  };
};