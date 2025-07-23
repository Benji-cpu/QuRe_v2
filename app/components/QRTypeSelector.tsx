// components/QRTypeSelector.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { QR_TYPES, QRTypeConfig } from '../../constants/QRTypes';
import { QRCodeType } from '../../types/QRCode';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QRTypeSelectorProps {
  selectedType: QRCodeType;
  onTypeSelect: (type: QRCodeType) => void;
}

export default function QRTypeSelector({ selectedType, onTypeSelect }: QRTypeSelectorProps) {
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedInfoType, setSelectedInfoType] = useState<QRTypeConfig | null>(null);

  const showInfo = (typeConfig: QRTypeConfig) => {
    setSelectedInfoType(typeConfig);
    setInfoModalVisible(true);
  };

  const closeInfo = () => {
    setInfoModalVisible(false);
    setSelectedInfoType(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select QR Code Type</Text>
      <View style={styles.typesGrid}>
        {QR_TYPES.map((typeConfig) => (
          <View key={typeConfig.type} style={styles.typeWrapper}>
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
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => showInfo(typeConfig)}
            >
              <Text style={styles.infoIcon}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeInfo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedInfoType && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedInfoType.icon} {selectedInfoType.title}
                  </Text>
                  <TouchableOpacity onPress={closeInfo} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {selectedInfoType.description}
                  </Text>
                  
                  <Text style={styles.useCasesTitle}>Perfect for:</Text>
                  {selectedInfoType.useCases.map((useCase, index) => (
                    <View key={index} style={styles.useCaseItem}>
                      <Text style={styles.useCaseBullet}>•</Text>
                      <Text style={styles.useCaseText}>{useCase}</Text>
                    </View>
                  ))}
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    onTypeSelect(selectedInfoType.type);
                    closeInfo();
                  }}
                >
                  <Text style={styles.selectButtonText}>
                    Select {selectedInfoType.title}
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
  typeWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '30%',
  },
  typeButton: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: SCREEN_WIDTH - 40,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  useCasesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  useCaseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  useCaseBullet: {
    fontSize: 14,
    color: '#2196f3',
    marginRight: 8,
    marginTop: 2,
  },
  useCaseText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
  selectButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});