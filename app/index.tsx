import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRListItem from '../components/QRListItem';
import { QRStorage } from '../services/QRStorage';
import { QRCodeData } from '../types/QRCode';

export default function HomeScreen() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQRCodes();
    
    const interval = setInterval(loadQRCodes, 1000);
    return () => clearInterval(interval);
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

  const handleView = (qrCode: QRCodeData) => {
    router.push({
      pathname: '/view',
      params: { id: qrCode.id }
    });
  };

  const handleEdit = (qrCode: QRCodeData) => {
    router.push({
      pathname: '/edit',
      params: { id: qrCode.id }
    });
  };

  const handleDelete = async (qrCode: QRCodeData) => {
    try {
      await QRStorage.deleteQRCode(qrCode.id);
      setQrCodes(prev => prev.filter(code => code.id !== qrCode.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete QR code');
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No QR Codes Yet</Text>
      <Text style={styles.emptyText}>
        Create your first QR code to get started!
      </Text>
      <Link href="/create" asChild>
        <TouchableOpacity style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Create QR Code</Text>
        </TouchableOpacity>
      </Link>
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
      <FlatList
        data={qrCodes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QRListItem
            qrCode={item}
            onPress={() => handleView(item)}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={qrCodes.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
      
      {qrCodes.length > 0 && (
        <Link href="/create" asChild>
          <TouchableOpacity style={styles.fab}>
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </Link>
      )}
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
  list: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
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