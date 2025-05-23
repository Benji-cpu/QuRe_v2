import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import Layout from '../constants/Layout';
import { QRCode as QRCodeType } from '../types/qr-code';
import { formatRelativeTime } from '../utils/dateUtils';
import { QRCodePreview } from './QRCodePreview';

interface QRCodeCardProps {
  qrCode: QRCodeType | null;
  onPress?: () => void;
  onEdit?: () => void;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showInfo?: boolean;
  placeholder?: React.ReactNode;
  isSlot?: boolean;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  qrCode,
  onPress,
  onEdit,
  size = 'medium',
  style,
  showInfo = true,
  placeholder,
  isSlot = false,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return Layout.qrCode.miniSize;
      case 'medium':
        return Layout.qrCode.previewSize;
      case 'large':
        return Layout.qrCode.cardSize;
      default:
        return Layout.qrCode.previewSize;
    }
  };

  if (!qrCode && !placeholder) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          styles.emptyContainer,
          { width: getSize() + 20, height: getSize() + (showInfo ? 60 : 20) },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.emptyQR}>
          <Feather name="plus" size={32} color={Colors.primary} />
          <Text style={styles.emptyText}>Add QR Code</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (!qrCode && placeholder) {
    return (
      <View
        style={[
          styles.container,
          { width: getSize() + 20, height: getSize() + (showInfo ? 60 : 20) },
          style,
        ]}
      >
        {placeholder}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: getSize() + 20, height: getSize() + (showInfo ? 60 : 20) },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.qrContainer}>
        <QRCodePreview qrCode={qrCode} size={getSize()} />
        
        {onEdit && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEdit}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Feather name="edit-2" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
      
      {showInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.label} numberOfLines={1}>
            {qrCode.label}
          </Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(qrCode.updatedAt)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.large,
    backgroundColor: Colors.card,
    padding: Layout.spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  emptyQR: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.primary,
    fontWeight: '500',
    marginTop: Layout.spacing.xs,
  },
  infoContainer: {
    marginTop: Layout.spacing.s,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});