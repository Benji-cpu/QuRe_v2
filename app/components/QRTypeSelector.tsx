// components/QRTypeSelector.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QR_TYPES } from '../../constants/QRTypes';
import { QRCodeType } from '../../types/QRCode';

interface QRTypeSelectorProps {
  selectedType: QRCodeType;
  onTypeSelect: (type: QRCodeType) => void;
}

export default function QRTypeSelector({ selectedType, onTypeSelect }: QRTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select QR Code Type</Text>
      <View style={styles.typesGrid}>
        {QR_TYPES.map((typeConfig) => (
          <TouchableOpacity
            key={typeConfig.type}
            style={[
              styles.typeButton,
              selectedType === typeConfig.type && styles.selectedType
            ]}
            onPress={() => onTypeSelect(typeConfig.type)}
          >
            <Text style={styles.typeIcon}>{typeConfig.icon}</Text>
            <Text style={[
              styles.typeTitle,
              selectedType === typeConfig.type && styles.selectedTypeText
            ]}>
              {typeConfig.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedType: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  typeTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedTypeText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
});