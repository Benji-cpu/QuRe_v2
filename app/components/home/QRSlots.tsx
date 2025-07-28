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
  xPosition: number;  // 0-100 coordinate system (0=left, 100=right)
  yPosition: number;  // 0-100 coordinate system (0=bottom, 100=top)
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
  xPosition,
  yPosition,
  scale,
  onSlotPress,
  onRemoveQR,
  hideEmptySlots = false,
  singleQRMode = false,
}: QRSlotsProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const getQRSize = () => {
    const baseSize = singleQRMode ? 120 : 90;
    return baseSize * scale;
  };

  // Convert 0-100 coordinates to actual screen positions with safe boundaries
  const getContainerStyle = () => {
    const qrSize = getQRSize();
    const containerSize = qrSize + 20;
    
    // Ensure we have valid screen dimensions
    const validScreenHeight = screenHeight || 812; // iPhone X default
    
    // Calculate safe area boundaries with proper margins
    const safeMarginTop = 120; // Space from top for UI elements
    const safeMarginBottom = 100; // Space from bottom for navigation
    const availableHeight = validScreenHeight - safeMarginTop - safeMarginBottom;
    
    // Y position: 0=bottom, 100=top
    // At Y=0, QR should be at bottom of safe area
    // At Y=100, QR should be at top of safe area
    // At Y=50, QR should be centered
    const yPercent = Math.max(0, Math.min(100, yPosition));
    
    // Calculate position from bottom of screen
    // When Y=0, offset should position QR at bottom (small offset)
    // When Y=100, offset should position QR at top (large offset)
    const bottomOffset = safeMarginBottom + (yPercent / 100) * availableHeight;
    
    return {
      position: 'absolute' as const,
      bottom: bottomOffset,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      alignItems: 'center' as const,
    };
  };

  const getSlotStyle = (isLeft: boolean) => {
    const qrSize = getQRSize();
    const containerSize = qrSize + 20;
    
    // Ensure we have valid screen dimensions
    const validScreenWidth = screenWidth || 375; // iPhone X default
    
    if (singleQRMode) {
      // Convert x position to horizontal offset from center
      const maxOffset = Math.min(100, (validScreenWidth / 2) - containerSize / 2 - 20);
      const offsetPercent = ((xPosition - 50) / 50) * 100; // -100 to 100
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, (offsetPercent / 100) * maxOffset));
      
      return {
        transform: [{ translateX: clampedOffset }],
      };
    }
    
    // For double mode, apply horizontal positioning to both slots
    const spacer = Math.max(40, qrSize * 0.3);
    const maxOffset = Math.min(50, (validScreenWidth / 4) - containerSize / 2 - spacer / 2 - 10);
    const offsetPercent = ((xPosition - 50) / 50) * 100; // -100 to 100
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, (offsetPercent / 100) * maxOffset));
    const offset = isLeft ? -clampedOffset : clampedOffset;
    
    return {
      transform: [{ translateX: offset }],
    };
  };

  const renderQRSlot = (qr: QRCodeData | null, slot: 'primary' | 'secondary', isDefaultQuRe: boolean = false) => {
    if (qr || isDefaultQuRe) {
      const displayQR = qr || DEFAULT_QURE_QR;
      const hasCustomLabel = isDefaultQuRe || (displayQR.data && 'label' in displayQR.data && displayQR.data.label);
      
      return (
        <View style={styles.qrWrapper}>
          <View style={[styles.qrContainer, { width: getQRSize() + 20, height: getQRSize() + 20 }]}>
            <QRCodePreview 
              value={displayQR.content} 
              size={getQRSize()} 
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
      <View style={[styles.qrContainer, styles.qrPlaceholder, { width: getQRSize() + 20, height: getQRSize() + 20 }]}>
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
      <View style={[styles.qrSlotsContainer, styles.singleQRContainer, getContainerStyle()]}>
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
        <View style={[styles.qrSpacer, { width: Math.max(40, getQRSize() * 0.3) }]} />
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
    justifyContent: 'center',
  },
  singleQRContainer: {
    justifyContent: 'center',
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