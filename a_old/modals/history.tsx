import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRListItem from '../../components/QRListItem';
import { QRStorage } from '../../services/QRStorage';
import { UserPreferencesService } from '../../services/UserPreferences';
import { QRCodeData } from '../../types/QRCode';

export default function HistoryModal() {
  const { selectMode, slot } = useLocalSearchParams<{ selectMode?: string; slot?: string }>();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const isSelectMode = selectMode === 'true';

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      const codes = await QRStorage.getAllQRCodes();
      setQrCodes(codes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (qrCode: QRCodeData) => {
    if (isSelectMode && slot) {
      try {
        if (slot === 'primary') {
          await UserPreferencesService.updatePrimaryQR(qrCode.id);
        } else if (slot === 'secondary') {
          await UserPreferencesService.updateSecondaryQR(qrCode.id);
        }
        router.back();
      } catch (error) {
        Alert.alert('Error', 'Failed to select QR code');
      }
    }
  };

  const handleView = (qrCode: QRCodeData) => {
    if (isSelectMode) {
      handleSelect(qrCode);
    } else {
      router.push({
        pathname: '/modal/view',
        params: { id: qrCode.id }
      });
    }
  };

  const handleEdit = (qrCode: QRCodeData) => {
    router.push({
      pathname: '/modal/edit',
      params: { id: qrCode.id }
    });
  };

  const handleDelete = async (qrCode: QRCodeData) => {
    try {
      await QRStorage.deleteQRCode(qrCode.id);
      
      const preferences = await UserPreferencesService.getPreferences();
      if (preferences.primaryQRCodeId === qrCode.id) {
        await UserPreferencesService.updatePrimaryQR(undefined);
      }
      if (preferences.secondaryQRCodeId === qrCode.id) {
        await UserPreferencesService.updateSecondaryQR(undefined);
      }
      
      setQrCodes(prev => prev.filter(code => code.id !== qrCode.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete QR code');
    }
  };

  const handleCreate = () => {
    if (isSelectMode) {
      router.replace({
        pathname: '/modal/create',
        params: slot ? { slot } : {}
      });
    } else {
      router.push('/modal/create');
    }
  };

  const renderHeader = () => {
    if (!isSelectMode || qrCodes.length === 0) return null;

    return (
      <TouchableOpacity style={styles.createNewCard} onPress={handleCreate}>
        <Text style={styles.createNewIcon}>+</Text>
        <Text style={styles.createNewText}>Create New QR Code</Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No QR Codes Yet</Text>
      <Text style={styles.emptyText}>
        Create your first QR code to get started!
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
        <Text style={styles.emptyButtonText}>Create QR Code</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isSelectMode ? 'Select QR Code' : 'Your QR Codes'}
        </Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={qrCodes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <QRListItem
            qrCode={item}
            onPress={() => handleView(item)}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
            hideActions={isSelectMode}
          />
        )}
        contentContainerStyle={qrCodes.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
      
      {(qrCodes.length > 0 && !isSelectMode) && (
        <TouchableOpacity style={styles.fab} onPress={handleCreate}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
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
  closeButtonText: {
    fontSize: 18,
    color: '#666',
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
  list: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  createNewCard: {
    backgroundColor: '#2196f3',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createNewIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 10,
  },
  createNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});