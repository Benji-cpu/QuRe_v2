import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors, QRColors } from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { ColorPicker } from './ColorPicker';

interface GradientSelectorProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  startColor: string;
  endColor: string;
  onStartColorChange: (color: string) => void;
  onEndColorChange: (color: string) => void;
  premiumGradientsEnabled?: boolean;
}

export const GradientSelector: React.FC<GradientSelectorProps> = ({
  enabled,
  onToggle,
  startColor,
  endColor,
  onStartColorChange,
  onEndColorChange,
  premiumGradientsEnabled = false,
}) => {
  const presets = QRColors.gradientPresets;
  const accessiblePresets = premiumGradientsEnabled 
    ? presets 
    : presets.slice(0, 3); // Limit non-premium users to first 3 gradients

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Gradient Background</Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: Colors.inactive, true: Colors.primary }}
          thumbColor="white"
          ios_backgroundColor={Colors.inactive}
        />
      </View>

      {enabled && (
        <View style={styles.gradientOptions}>
          <View style={styles.colorPickers}>
            <View style={styles.colorPickerContainer}>
              <ColorPicker
                label="Start Color"
                value={startColor}
                onChange={onStartColorChange}
              />
            </View>
            <View style={styles.colorPickerContainer}>
              <ColorPicker
                label="End Color"
                value={endColor}
                onChange={onEndColorChange}
              />
            </View>
          </View>

          <Text style={styles.presetsLabel}>Gradient Presets</Text>
          <View style={styles.presetsContainer}>
            {accessiblePresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.gradientPreset,
                  startColor === preset.start && endColor === preset.end && styles.selectedPreset,
                ]}
                onPress={() => {
                  onStartColorChange(preset.start);
                  onEndColorChange(preset.end);
                }}
              >
                <LinearGradient
                  colors={[preset.start, preset.end]}
                  style={styles.gradientPreviewInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          {!premiumGradientsEnabled && (
            <View style={styles.premiumBanner}>
              <Text style={styles.premiumText}>
                Upgrade to Premium for all gradient options
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.l,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  gradientOptions: {
    marginTop: Layout.spacing.s,
  },
  colorPickers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorPickerContainer: {
    width: '48%',
  },
  presetsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Layout.spacing.xs,
    marginTop: Layout.spacing.s,
    color: Colors.text,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradientPreset: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.medium,
    margin: Layout.spacing.xs,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  gradientPreviewInner: {
    flex: 1,
    borderRadius: Layout.borderRadius.small,
  },
  selectedPreset: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  premiumBanner: {
    backgroundColor: '#FFF9E6',
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.m,
    marginTop: Layout.spacing.m,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  premiumText: {
    color: Colors.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});