// components/QRTypeSelector.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QR_TYPES, QRTypeConfig } from '../../constants/QRTypes';
import { QRCodeType } from '../../types/QRCode';
import QRTypeInfoModal from './QRTypeInfoModal';

interface QRTypeSelectorProps {
  selectedType: QRCodeType;
  onTypeSelect: (type: QRCodeType) => void;
}

export default function QRTypeSelector({ selectedType, onTypeSelect }: QRTypeSelectorProps) {
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedTypeInfo, setSelectedTypeInfo] = useState<QRTypeConfig | null>(null);

  const handleInfoPress = (typeConfig: QRTypeConfig) => {
    setSelectedTypeInfo(typeConfig);
    setInfoModalVisible(true);
  };

  const hasInfo = (typeConfig: QRTypeConfig) => {
    return typeConfig.description || (typeConfig.useCases && typeConfig.useCases.length > 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select QR Code Type</Text>
      <View style={styles.typesGrid}>
        {QR_TYPES.map((typeConfig) => (
          <View key={typeConfig.type} style={styles.typeButtonContainer}>
            <TouchableOpacity
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
            {hasInfo(typeConfig) && (
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => handleInfoPress(typeConfig)}
              >
                <Text style={styles.infoIcon}>ⓘ</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      
      {selectedTypeInfo && (
        <QRTypeInfoModal
          visible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
          qrType={selectedTypeInfo}
        />
      )}
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
  typeButtonContainer: {
    flex: 1,
    minWidth: '30%',
    position: 'relative',
  },
  typeButton: {
    width: '100%',
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
  infoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: 'bold',
  },
});