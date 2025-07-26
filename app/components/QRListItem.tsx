import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QR_TYPES } from '../../constants/QRTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { QRCodeData } from '../../types/QRCode';

interface QRListItemProps {
  qrCode: QRCodeData;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hideActions?: boolean;
}

export default function QRListItem({ qrCode, onPress, onEdit, onDelete, hideActions = false }: QRListItemProps) {
  const { theme } = useTheme();
  const typeConfig = QR_TYPES.find(t => t.type === qrCode.type);
  
  const handleDelete = () => {
    Alert.alert(
      'Delete QR Code',
      `Are you sure you want to delete "${qrCode.label}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.surface }]} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.typeIndicator}>
            <Text style={styles.typeIcon}>{typeConfig?.icon || '📄'}</Text>
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>{typeConfig?.title || 'Unknown'}</Text>
          </View>
          <Text style={[styles.date, { color: theme.textTertiary }]}>{formatDate(qrCode.createdAt)}</Text>
        </View>
        
        <Text style={[styles.label, { color: theme.text }]}>{qrCode.label}</Text>
        
        {!hideActions && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Text style={[styles.editButton, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Text style={[styles.deleteButton, { color: theme.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    color: '#2196f3',
    fontWeight: '500',
  },
  deleteButton: {
    color: '#f44336',
    fontWeight: '500',
  },
});