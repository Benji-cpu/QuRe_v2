import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  singleQRMode?: boolean;
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
  singleQRMode = false,
}: QRSlotsProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  const getQRSize = () => {
    const baseSize = singleQRMode ? 120 : 90;
    return baseSize * scale;
  };

  const getContainerStyle = () => {
    return {
      marginBottom: verticalOffset,
      paddingHorizontal: singleQRMode ? 20 : Math.max(20 - Math.abs(horizontalOffset), 10),
    };
  };

  const getSlotStyle = (isLeft: boolean) => {
    if (singleQRMode) {
      return {
        transform: [{ translateX: horizontalOffset }],
      };
    }
    const maxOffset = 30;
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, horizontalOffset));
    const offset = isLeft ? -clampedOffset : clampedOffset;
    return {
      transform: [{ translateX: offset }],
    };
  };

  const qrSize = getQRSize();
  const containerSize = qrSize + 20;

  const renderQRSlot = (qr: QRCodeData | null, slot: 'primary' | 'secondary', isDefaultQuRe: boolean = false) => {
    if (qr || isDefaultQuRe) {
      const displayQR = qr || DEFAULT_QURE_QR;
      return (
        <View style={styles.qrWrapper}>
          <View style={[styles.qrContainer, { width: containerSize, height: containerSize }]}>
            <QRCodePreview 
              value={displayQR.content} 
              size={qrSize} 
              design={displayQR.design}
            />
            {showActionButtons && !isDefaultQuRe && (
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
          <Text style={styles.qrLabel}>{displayQR.label}</Text>
        </View>
      );
    }

    if (hideEmptySlots) {
      return null;
    }

    return (
      <View style={[styles.qrContainer, styles.qrPlaceholder, { width: containerSize, height: containerSize }]}>
        <Text style={styles.qrPlaceholderIcon}>+</Text>
        <Text style={styles.qrPlaceholderText}>CREATE QR{'\n'}CODE</Text>
      </View>
    );
  };

  const shouldShowPrimary = primaryQR || !hideEmptySlots;
  const shouldShowSecondary = !singleQRMode && (isPremium && (secondaryQR || !hideEmptySlots));
  const shouldShowDefaultQuRe = !singleQRMode && !isPremium;

  if (singleQRMode) {
    return (
      <View style={[styles.qrSlotsContainer, getContainerStyle(), styles.singleQRContainer]}>
        <TouchableOpacity 
          style={[styles.qrSlot, getSlotStyle(false)]} 
          onPress={() => onSlotPress('primary')}
        >
          {renderQRSlot(primaryQR, 'primary')}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => setShowInstructions(true)}
        >
          <Feather name="help-circle" size={20} color="white" />
        </TouchableOpacity>
        
        <Modal
          visible={showInstructions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowInstructions(false)}
        >
          <TouchableOpacity 
            style={styles.instructionsOverlay}
            onPress={() => setShowInstructions(false)}
            activeOpacity={1}
          >
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>QR Code Layout</Text>
              <Text style={styles.instructionsText}>
                • Single QR: One centered QR code with more horizontal movement{'\n\n'}
                • Double QR: Two QR codes side by side (Premium){'\n\n'}
                • Tap on empty slots to add QR codes{'\n\n'}
                • Tap the X to remove QR codes
              </Text>
              <TouchableOpacity 
                style={styles.instructionsClose}
                onPress={() => setShowInstructions(false)}
              >
                <Text style={styles.instructionsCloseText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.qrSlotsContainer, getContainerStyle()]}>
      {shouldShowPrimary && (
        <TouchableOpacity 
          style={[styles.qrSlot, getSlotStyle(true)]} 
          onPress={() => onSlotPress('primary')}
        >
          {renderQRSlot(primaryQR, 'primary')}
        </TouchableOpacity>
      )}

      {(shouldShowPrimary && (shouldShowSecondary || shouldShowDefaultQuRe)) && (
        <View style={styles.qrSpacer} />
      )}

      {(shouldShowSecondary || shouldShowDefaultQuRe) && (
        <TouchableOpacity 
          style={[styles.qrSlot, getSlotStyle(false)]} 
          onPress={() => onSlotPress('secondary')}
        >
          {isPremium ? (
            renderQRSlot(secondaryQR, 'secondary')
          ) : (
            renderQRSlot(null, 'secondary', true)
          )}
        </TouchableOpacity>
      )}
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
  singleQRContainer: {
    justifyContent: 'center',
    position: 'relative',
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
  helpButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxWidth: 350,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  instructionsClose: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  instructionsCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});