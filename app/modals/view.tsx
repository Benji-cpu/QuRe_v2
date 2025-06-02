// app/modals/view.tsx (update the handleEdit function and navigation)
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCodePreview from '../../components/QRCodePreview';
import { QR_TYPES } from '../../constants/QRTypes';
import { QRStorage } from '../../services/QRStorage';
import { UserPreferencesService } from '../../services/UserPreferences';
import { QRCodeData } from '../../types/QRCode';

export default function ViewModal() {
  const { id, slot } = useLocalSearchParams<{ id: string; slot?: string }>();
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigningToSlot, setAssigningToSlot] = useState(false);

  useEffect(() => {
    loadQRCode();
  }, [id]);

  const loadQRCode = async () => {
    if (!id) {
      Alert.alert('Error', 'No QR code ID provided');
      router.back();
      return;
    }

    try {
      const code = await QRStorage.getQRCodeById(id);
      if (code) {
        setQrCode(code);
      } else {
        Alert.alert('Error', 'QR code not found');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load QR code');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/modals/edit',
      params: { id: qrCode?.id, slot: slot }
    });
  };

  const handleAssignToSlot = async (targetSlot: 'primary' | 'secondary') => {
    if (!qrCode) return;
    
    setAssigningToSlot(true);
    try {
      if (targetSlot === 'primary') {
        await UserPreferencesService.updatePrimaryQR(qrCode.id);
      } else {
        await UserPreferencesService.updateSecondaryQR(qrCode.id);
      }
      
      Alert.alert(
        'Success', 
        `QR code assigned to ${targetSlot} slot`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to assign QR code to slot');
    } finally {
      setAssigningToSlot(false);
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!qrCode) {
    return null;
  }

  const typeConfig = QR_TYPES.find(t => t.type === qrCode.type);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.qrContainer}>
          <QRCodePreview value={qrCode.content} size={250} />
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.typeInfo}>
            <Text style={styles.typeIcon}>{typeConfig?.icon || '📄'}</Text>
            <Text style={styles.typeText}>{typeConfig?.title || 'Unknown'}</Text>
          </View>
          
          <Text style={styles.label}>{qrCode.label}</Text>
          <Text style={styles.date}>Created {formatDate(qrCode.createdAt)}</Text>
          
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>QR Code Data:</Text>
            <Text style={styles.dataContent}>{qrCode.content}</Text>
          </View>

          {/* Show slot assignment options if we're not coming from a specific slot */}
          {!slot && (
            <View style={styles.slotAssignmentContainer}>
              <Text style={styles.slotAssignmentTitle}>Assign to Slot:</Text>
              <View style={styles.slotButtons}>
                <TouchableOpacity 
                  style={styles.slotButton}
                  onPress={() => handleAssignToSlot('primary')}
                  disabled={assigningToSlot}
                >
                  <Text style={styles.slotButtonText}>Primary Slot</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.slotButton}
                  onPress={() => handleAssignToSlot('secondary')}
                  disabled={assigningToSlot}
                >
                  <Text style={styles.slotButtonText}>Secondary Slot</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEdit}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  qrContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  typeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  dataContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dataContent: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  slotAssignmentContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
    marginTop: 20,
  },
  slotAssignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  slotButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  slotButton: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  slotButtonText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  editButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#2196f3',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});