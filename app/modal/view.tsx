import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QR_TYPES } from '../../constants/QRTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { QRStorage } from '../../services/QRStorage';
import { QRCodeData } from '../../types/QRCode';
import QRCodePreview from '../components/QRCodePreview';

export default function ViewModal() {
  const { id, slot } = useLocalSearchParams<{ id: string; slot?: string }>();
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

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
      pathname: '/modal/qrcode',
      params: { id: qrCode?.id, slot }
    });
  };

  const handleChangeQR = () => {
    router.push({
      pathname: '/modal/history',
      params: { selectMode: 'true', slot: slot || '' }
    });
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  if (!qrCode) {
    return null;
  }

  const typeConfig = QR_TYPES.find(t => t.type === qrCode.type);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: insets.top + 15 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>QR Code Details</Text>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={[styles.qrContainer, { backgroundColor: theme.surface }]}>
          <QRCodePreview 
            value={qrCode.content} 
            size={250} 
            design={qrCode.design}
          />
        </View>
        
        <View style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.typeInfo}>
            <Text style={styles.typeIcon}>{typeConfig?.icon || '📄'}</Text>
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>{typeConfig?.title || 'Unknown'}</Text>
          </View>
          
          <Text style={[styles.label, { color: theme.text }]}>{qrCode.label}</Text>
          <Text style={[styles.date, { color: theme.textTertiary }]}>Created {formatDate(qrCode.createdAt)}</Text>
          
          <View style={[styles.dataContainer, { borderTopColor: theme.border }]}>
            <Text style={[styles.dataTitle, { color: theme.text }]}>QR Code Data:</Text>
            <Text style={[styles.dataContent, { color: theme.textSecondary, backgroundColor: theme.surfaceVariant }]}>{qrCode.content}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={[
        styles.footer
        , 
        { 
          paddingBottom: Platform.OS === 'android' ? 50 : Math.max(insets.bottom, 50),
          backgroundColor: theme.surface,
          borderTopColor: theme.border
        }
      ]}>
        <TouchableOpacity 
          style={[styles.closeButton, { backgroundColor: theme.surfaceVariant }]} 
          onPress={handleClose}
        >
          <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
        </TouchableOpacity>
        
        {slot && (
          <TouchableOpacity 
            style={[styles.changeButton, { backgroundColor: theme.warning }]} 
            onPress={handleChangeQR}
          >
            <Text style={[styles.changeButtonText, { color: theme.primaryText }]}>Change</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: theme.primary }]} 
          onPress={handleEdit}
        >
          <Text style={[styles.editButtonText, { color: theme.primaryText }]}>Edit</Text>
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
     header: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: 20,
     paddingBottom: 15,
     borderBottomWidth: 1,
   },
   backButton: {
     marginRight: 15,
   },
   headerTitle: {
     fontSize: 20,
     fontWeight: 'bold',
     flex: 1,
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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
 },
 footer: {
   flexDirection: 'row',
   padding: 20,
   gap: 15,
   backgroundColor: '#fff',
   borderTopWidth: 1,
   borderTopColor: '#eee',
   position: 'absolute',
   bottom: 0,
   left: 0,
   right: 0,
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
 changeButton: {
   flex: 1,
   paddingVertical: 15,
   borderRadius: 8,
   backgroundColor: '#FF9800',
   alignItems: 'center',
 },
 changeButtonText: {
   fontSize: 16,
   color: '#fff',
   fontWeight: 'bold',
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