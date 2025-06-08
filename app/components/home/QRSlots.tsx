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
  hideEmptySlots?: boolean;
  slotCount?: 1 | 2;
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
  hideEmptySlots = false,
  slotCount = 2,
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

  const qrSize = getQRSize();
  const containerSize = qrSize + 20;

  const renderQRSlot = (qr: QRCodeData | null, slot: 'primary' | 'secondary') => {
    if (qr) {
      return (
        <View style={styles.qrWrapper}>
          <View style={[styles.qrContainer, { width: containerSize, height: containerSize }]}>
            <QRCodePreview 
              value={qr.content} 
              size={qrSize} 
              design={qr.design}
            />
            {showActionButtons && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onRemoveQR(slot);
                }}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.qrLabel}>{qr.label}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.qrWrapper, { opacity: hideEmptySlots ? 0 : 1 }]}>
        <View style={[styles.qrContainer, styles.qrPlaceholder, { width: containerSize, height: containerSize }]}>
          <Text style={styles.qrPlaceholderIcon}>+</Text>
          <Text style={styles.qrPlaceholderText}>CREATE QR{'\n'}CODE</Text>
        </View>
      </View>
    );
  };

  const shouldShowPrimary = true;
  const shouldShowSecondary = isPremium || !hideEmptySlots;
  const shouldShowSecondSlot = slotCount === 2;


  return (
    <View style={[styles.qrSlotsContainer, getContainerStyle()]}>
      <TouchableOpacity 
        style={[
          styles.qrSlot, 
          !shouldShowSecondSlot ? styles.centerSlot : getSlotStyle(true)
        ]} 
        onPress={() => onSlotPress('primary')}
        disabled={hideEmptySlots && !primaryQR}
      >
        {renderQRSlot(primaryQR, 'primary')}
      </TouchableOpacity>

      {shouldShowSecondSlot && (
        <>
          <View style={styles.qrSpacer} />

          <TouchableOpacity 
            style={[styles.qrSlot, getSlotStyle(false)]} 
            onPress={() => onSlotPress('secondary')}
            disabled={hideEmptySlots && !isPremium}
          >
            {isPremium ? (
              renderQRSlot(secondaryQR, 'secondary')
            ) : (
              <View style={[styles.qrWrapper, { opacity: hideEmptySlots ? 0 : 1 }]}>
                <View style={[styles.qrContainer, { width: containerSize, height: containerSize }]}>
                  <QRCodePreview 
                    value={DEFAULT_QURE_QR.content} 
                    size={qrSize} 
                    design={DEFAULT_QURE_QR.design}
                  />
                  {showActionButtons && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        onSlotPress('secondary');
                      }}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.qrLabel}>{DEFAULT_QURE_QR.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerSlot: {
    alignItems: 'center',
    transform: [{ translateX: 0 }], // Override any offset when single slot
  },
  qrSlotsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 80,
  },
  qrSlot: {
    flex: 1,
    alignItems: 'center',
  },
  qrSpacer: {
    width: 40,
  },
  qrWrapper: {
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
  },
  qrPlaceholderIcon: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  qrPlaceholderText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  removeButtonText: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 18,
  },
});