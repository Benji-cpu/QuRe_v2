import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QRCodeData } from '../../../types/QRCode';
import QRCodePreview from '../QRCodePreview';

interface QRSlotsProps {
  primaryQR: QRCodeData | null;
  secondaryQR: QRCodeData | null;
  isPremium: boolean;
  showActionButtons: boolean;
  onSlotPress: (slot: 'primary' | 'secondary') => void;
  onRemoveQR: (slot: 'primary' | 'secondary') => void;
}

export default function QRSlots({
  primaryQR,
  secondaryQR,
  isPremium,
  showActionButtons,
  onSlotPress,
  onRemoveQR,
}: QRSlotsProps) {
  return (
    <View style={styles.qrSlotsContainer}>
      <TouchableOpacity 
        style={styles.qrSlot} 
        onPress={() => onSlotPress('primary')}
        activeOpacity={0.8}
      >
        {primaryQR ? (
          <View style={styles.qrContentWrapper}>
            {showActionButtons && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onRemoveQR('primary');
                }}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
            <View style={styles.qrCodeBox}>
              <QRCodePreview value={primaryQR.content} size={80} />
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
        onPress={() => onSlotPress('secondary')}
        activeOpacity={0.8}
      >
        {secondaryQR && isPremium ? (
          <View style={styles.qrContentWrapper}>
            {showActionButtons && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onRemoveQR('secondary');
                }}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
            <View style={styles.qrCodeBox}>
              <QRCodePreview value={secondaryQR.content} size={80} />
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
    marginBottom: 20,
  },
  qrSlot: {
    flex: 1,
    height: 140,
  },
  qrSpacer: {
    width: 15,
  },
  qrContentWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  qrCodeBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  qrLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  qrPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  qrPlaceholderPremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  qrPlaceholderIcon: {
    fontSize: 32,
    color: 'white',
    marginBottom: 4,
    fontWeight: '300',
  },
  qrPlaceholderText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});