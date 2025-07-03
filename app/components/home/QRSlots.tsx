import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { QRCodeData } from '../../../types/QRCode';
import QRCodePreview from '../QRCodePreview';

interface QRSlotsProps {
  primaryQR: QRCodeData | null;
  secondaryQR: QRCodeData | null;
  isPremium: boolean;
  showActionButtons: boolean;
  verticalOffset: number;  // Percentage (0-100)
  horizontalOffset: number;  // Percentage (-50 to 50)
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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Convert percentage values to pixels
  const verticalOffsetPixels = (verticalOffset / 100) * screenHeight;
  const horizontalOffsetPixels = (horizontalOffset / 100) * screenWidth;

  const getQRSize = () => {
    const baseSize = singleQRMode ? 120 : 90;
    return baseSize * scale;
  };

  const getContainerStyle = () => {
    return {
      transform: [{ translateY: -verticalOffsetPixels }],
      paddingHorizontal: 20,
    };
  };

  const getSlotStyle = (isLeft: boolean) => {
    const qrSize = getQRSize();
    const containerSize = qrSize + 20;
    const halfContainer = containerSize / 2;
    
    if (singleQRMode) {
      // Calculate max safe offset to prevent cropping
      // Allow more movement but clamp at screen edges
      const maxSafeOffset = (screenWidth / 2) - halfContainer - 10; // Half screen - half QR - minimal padding
      const clampedOffset = Math.max(-maxSafeOffset, Math.min(maxSafeOffset, horizontalOffsetPixels));
      
      return {
        transform: [{ translateX: clampedOffset }],
      };
    }
    
    // For double mode, apply safe clamping to avoid cropping
    const sideHalf = (screenWidth / 2);
    const available = sideHalf - halfContainer - dynamicSpacer / 2 - 10; // 10 padding
    const clampedOffset = Math.max(-available, Math.min(available, horizontalOffsetPixels));
    const offset = isLeft ? -clampedOffset : clampedOffset;
    return {
      transform: [{ translateX: offset }],
    };
  };

  const qrSize = getQRSize();
  const containerSize = qrSize + 20;
  const dynamicSpacer = Math.max(40, qrSize * 0.3);

  const renderQRSlot = (qr: QRCodeData | null, slot: 'primary' | 'secondary', isDefaultQuRe: boolean = false) => {
    if (qr || isDefaultQuRe) {
      const displayQR = qr || DEFAULT_QURE_QR;
      // Check if the QR has a user-provided label
      // For default QuRe QR, always show the label
      const hasCustomLabel = isDefaultQuRe || (displayQR.data && 'label' in displayQR.data && displayQR.data.label);
      
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
          {hasCustomLabel && <Text style={styles.qrLabel}>{displayQR.label}</Text>}
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
        <View style={[styles.qrSpacer, { width: dynamicSpacer }]} />
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
    marginTop: 'auto',
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