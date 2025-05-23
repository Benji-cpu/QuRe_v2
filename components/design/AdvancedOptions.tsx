import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ERROR_CORRECTION_LEVELS, ErrorCorrectionLevel } from '../../constants/ErrorCorrectionLevels';
import Layout from '../../constants/Layout';

interface AdvancedOptionsProps {
  errorCorrectionLevel: ErrorCorrectionLevel;
  onErrorCorrectionChange: (level: ErrorCorrectionLevel) => void;
  quietZone: number;
  onQuietZoneChange: (value: number) => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  errorCorrectionLevel,
  onErrorCorrectionChange,
  quietZone,
  onQuietZoneChange,
}) => {
  const selectedLevel = ERROR_CORRECTION_LEVELS.find(
    (level) => level.level === errorCorrectionLevel
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Advanced Options</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Error Correction Level</Text>
        <Text style={styles.sectionDescription}>
          Higher levels make the QR code more resistant to damage but increase its size
        </Text>

        <View style={styles.levelContainer}>
          {ERROR_CORRECTION_LEVELS.map((level) => (
            <View
              key={level.level}
              style={[
                styles.levelItem,
                level.level === errorCorrectionLevel && styles.selectedLevel,
              ]}
            >
              <Text
                style={[
                  styles.levelLabel,
                  level.level === errorCorrectionLevel && styles.selectedLevelLabel,
                ]}
                onPress={() => onErrorCorrectionChange(level.level)}
              >
                {level.label}
              </Text>
            </View>
          ))}
        </View>

        {selectedLevel && (
          <View style={styles.levelInfo}>
            <Feather name="info" size={16} color={Colors.primary} style={styles.infoIcon} />
            <Text style={styles.levelInfoText}>{selectedLevel.recoveryCapability}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quiet Zone (Margin)</Text>
        <Text style={styles.sectionDescription}>
          The white space around the QR code
        </Text>

        <View style={styles.sliderContainer}>
          <Slider
            value={quietZone}
            onValueChange={onQuietZoneChange}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor={Colors.inactive}
            thumbTintColor={Colors.primary}
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>None</Text>
            <Text style={[styles.sliderLabel, styles.sliderValueLabel]}>
              {quietZone}
            </Text>
            <Text style={styles.sliderLabel}>Large</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.l,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.m,
  },
  section: {
    marginBottom: Layout.spacing.l,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#777',
    marginBottom: Layout.spacing.m,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.s,
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.s,
    marginHorizontal: 2,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: '#f5f5f5',
  },
  selectedLevel: {
    backgroundColor: Colors.primary,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  selectedLevelLabel: {
    color: 'white',
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EFFF',
    padding: Layout.spacing.s,
    borderRadius: Layout.borderRadius.medium,
  },
  infoIcon: {
    marginRight: Layout.spacing.xs,
  },
  levelInfoText: {
    fontSize: 12,
    color: Colors.primary,
  },
  sliderContainer: {
    marginTop: Layout.spacing.s,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#777',
  },
  sliderValueLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
});