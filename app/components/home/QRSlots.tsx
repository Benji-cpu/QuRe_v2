// app/components/home/QRSlots.tsx
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
  horizontalOffset: number;
  scale: number;
  onSlotPress: (slot: 'primary' | 'secondary') => void;
  onRemoveQR: (slot: 'primary' | 'secondary') => void;
}

const DEFAULT_QURE_QR: QRCodeData = {
  id: 'default-qure',
  type: 'link',
  label: 'QuRe',
  data: { url: 'https://qr.io/' },
  content: 'https://qr.io/',
  createdAt: new Date().toISOString(),
};

export default function QRSlots({
  primaryQR,
  secondaryQR,
  isPremium,
  showActionButtons,
  verticalOffset,
  horizontalOffset,
  scale,
  onSlotPress,
  onRemoveQR,
}: QRSlotsProps) {
  const getQRSize = () => {
    const baseSize = 90;
    return baseSize * scale;
  };

  const getContainerStyle = () => {
    return {
      marginBottom: verticalOffset,
      paddingHorizontal: Math.max(20 - Math.abs(horizontalOffset), 10),
    };
  };

  const getSlotStyle = (isLeft: boolean) => {
    const maxOffset = 30;
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, horizontalOffset));
    const offset = isLeft ? -clampedOffset : clampedOffset;
    return {
      transform: [{ translateX: offset }],
    };
  };

  return (
    <View style={[styles.qrSlotsContainer, getContainerStyle()]}>
      <TouchableOpacity 
        style={[styles.qrSlot, getSlotStyle(true)]} 
        onPress={() => onSlotPress('primary')}
      >
        {primaryQR ? (
          <View style={styles.qrWrapper}>
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
            <View style={styles.qrContent}>
              <QRCodePreview 
                value={primaryQR.content} 
                size={getQRSize()} 
                design={primaryQR.design}
              />
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
        style={[styles.qrSlot, getSlotStyle(false)]} 
        onPress={() => onSlotPress('secondary')}
      >
        {isPremium ? (
          secondaryQR ? (
            <View style={styles.qrWrapper}>
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
              <View style={styles.qrContent}>
                <QRCodePreview 
                  value={secondaryQR.content} 
                  size={getQRSize()} 
                  design={secondaryQR.design}
                />
              </View>
              <Text style={styles.qrLabel}>{secondaryQR.label}</Text>
            </View>
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderIcon}>+</Text>
              <Text style={styles.qrPlaceholderText}>CREATE QR{'\n'}CODE</Text>
            </View>
          )
        ) : (
          <View style={styles.qrWrapper}>
            <View style={styles.qrContent}>
              <QRCodePreview 
                value={DEFAULT_QURE_QR.content} 
                size={getQRSize()} 
                design={DEFAULT_QURE_QR.design}
              />
            </View>
            <Text style={styles.qrLabel}>{DEFAULT_QURE_QR.label}</Text>
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
    position: 'relative',
  },
  qrContent: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 1,
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
    height: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
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
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});