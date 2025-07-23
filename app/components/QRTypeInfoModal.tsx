// components/QRTypeInfoModal.tsx
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { QRTypeConfig } from '../../constants/QRTypes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QRTypeInfoModalProps {
  visible: boolean;
  onClose: () => void;
  qrType: QRTypeConfig;
}

export default function QRTypeInfoModal({ visible, onClose, qrType }: QRTypeInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.icon}>{qrType.icon}</Text>
              <Text style={styles.title}>{qrType.title} QR Code</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {qrType.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{qrType.description}</Text>
              </View>
            )}

            {qrType.useCases && qrType.useCases.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Perfect For:</Text>
                {qrType.useCases.map((useCase, index) => (
                  <View key={index} style={styles.useCaseItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.useCaseText}>{useCase}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Information:</Text>
              {qrType.fields
                .filter(field => field.required)
                .map((field, index) => (
                  <View key={index} style={styles.fieldItem}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <Text style={styles.fieldExample}>Example: {field.placeholder}</Text>
                  </View>
                ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
            <Text style={styles.gotItText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  useCaseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
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
  fieldItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fieldExample: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  gotItButton: {
    backgroundColor: '#2196f3',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  gotItText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});