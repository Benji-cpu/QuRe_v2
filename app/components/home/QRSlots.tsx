import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QRCodeData } from '../../../types/QRCode';
import QRCodePreview from '../QRCodePreview';

interface QRSlotsProps {
  primaryQR: QRCodeData | null;
  secondaryQR: QRCodeData | null;
  isPremium: boolean;
  showActionButtons: boolean;
  verticalOffset: number;
  onSlotPress: (slot: 'primary' | 'secondary') => void;
  onRemoveQR: (slot: 'primary' | 'secondary') => void;
}

export default function QRSlots({
  primaryQR,
  secondaryQR,
  isPremium,
  showActionButtons,
  verticalOffset,
  onSlotPress,
  onRemoveQR,
}: QRSlotsProps) {
  return (
    <View style={[styles.qrSlotsContainer, { marginBottom: verticalOffset }]}>
      <TouchableOpacity 
        style={styles.qrSlot} 
        onPress={() => onSlotPress('primary')}
      >
        {primaryQR ? (
          <View style={styles.qrWrapper}>
            <View style={styles.qrContent}>
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
              <QRCodePreview value={primaryQR.content} size={90} />
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
      >
        {secondaryQR && isPremium ? (
          <View style={styles.qrWrapper}>
            <View style={styles.qrContent}>
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
              <QRCodePreview value={secondaryQR.content} size={90} />
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
    marginBottom: 80,
  },
  qrSlot: {
    flex: 1,
  },
  qrSpacer: {
    width: 40,
  },
  qrWrapper: {
    alignItems: 'center',
  },
  qrContent: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  qrPlaceholder: {
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
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
    zIndex: 1,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});