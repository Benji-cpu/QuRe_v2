import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors, QRColors } from '../../constants/Colors';
import Layout from '../../constants/Layout';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  presets?: string[];
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  presets = QRColors.presets,
}) => {
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (text: string) => {
    let formattedText = text;
    if (text.length > 0 && !text.startsWith('#')) {
      formattedText = `#${text}`;
    }
    setHexInput(formattedText);
  };

  const handleHexSubmit = () => {
    // Simple validation for hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(hexInput)) {
      onChange(hexInput);
    } else {
      setHexInput(value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.hexInputContainer}>
        <View style={[styles.colorPreview, { backgroundColor: value }]} />
        <TextInput
          style={styles.hexInput}
          value={hexInput}
          onChangeText={handleHexChange}
          onBlur={handleHexSubmit}
          placeholder="#000000"
          autoCapitalize="none"
          maxLength={7}
        />
      </View>
      
      <View style={styles.presetsContainer}>
        {presets.map((color, index) => (
          <TouchableOpacity
            key={`${color}-${index}`}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              value === color && styles.selectedColor,
            ]}
            onPress={() => {
              onChange(color);
              setHexInput(color);
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.m,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Layout.spacing.xs,
    color: Colors.text,
  },
  hexInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Layout.spacing.m,
    height: Layout.form.inputHeight,
    backgroundColor: 'white',
    marginBottom: Layout.spacing.s,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: Layout.borderRadius.small,
    marginRight: Layout.spacing.m,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hexInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: Layout.borderRadius.small,
    margin: Layout.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});