import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { QRCodeData } from '../../types/QRCode';
import QRCodePreview from '../QRCodePreview';

interface QRSlotsProps {
  primaryQR: QRCodeData | null;
  secondaryQR: QRCodeData | null;
  isPremium: boolean;
  showActionButtons: boolean;
  insets: EdgeInsets;
  onRemoveQR: (slot: 'primary' | 'secondary') => Promise<void>;
}

export default function QRSlots({ 
  primaryQR, 
  secondaryQR, 
  isPremium, 
  showActionButtons, 
  insets, 
  onRemoveQR 
}: QRSlotsProps) {
  
  const handleQRSlotPress = (slot: 'primary' | 'secondary') => {
    if (slot === 'secondary' && !isPremium) {
      router.push('/modals/premium');
      return;
    }

    const existingQR = slot === 'primary' ? primaryQR : secondaryQR;
    
    if (existingQR) {
      router.push({
        pathname: '/modals/view',
        params: { id: existingQR.id, slot: slot }
      });
    } else {
      router.push({
        pathname: '/modals/create',
        params: { slot: slot }
      });
    }
  };

  return (
    <View style={[styles.qrSlotsContainer, { marginBottom: insets.bottom + 80 }]}>
      <TouchableOpacity 
        style={styles.qrSlot} 
        onPress={() => handleQRSlotPress('primary')}
      >
        {primaryQR ? (
          <View style={styles.qrContent}>
            {showActionButtons && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => onRemoveQR('primary')}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
            <View style={styles.qrCodeContainer}>
              <QRCodePreview value={primaryQR.content} size={60} />
            </View>
            <Text style={styles.qrLabel}>{primaryQR.label}</Text>
          </View>
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderIcon}>+</Text>
            <Text style={styles.qrPlaceholderText}>CREATE QR{'\n'}CODE</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.qrSpacer} />

      <TouchableOpacity 
        style={styles.qrSlot} 
        onPress={() => handleQRSlotPress('secondary')}
      >
        {secondaryQR && isPremium ? (
          <View style={styles.qrContent}>
            {showActionButtons && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => onRemoveQR('secondary')}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
            <View style={styles.qrCodeContainer}>
              <QRCodePreview value={secondaryQR.content} size={60} />
            </View>
            <Text style={styles.qrLabel}>{secondaryQR.label}</Text>
          </View>
        ) : (
          <View style={[styles.qrPlaceholder, !isPremium && styles.qrPlaceholderPremium]}>
            <Text style={styles.qrPlaceholderIcon}>+</Text>
            <Text style={styles.qrPlaceholderText}>CREATE QR{'\n'}CODE</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  qrSlotsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 'auto',
  },
  qrSlot: {
    flex: 1,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
  },
  qrSpacer: {
    width: 30,
  },
  qrContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 6,
  },
  qrLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 6,
  },
  qrPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
  qrPlaceholderPremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  qrPlaceholderIcon: {
    fontSize: 28,
    color: 'white',
    marginBottom: 4,
  },
  qrPlaceholderText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 