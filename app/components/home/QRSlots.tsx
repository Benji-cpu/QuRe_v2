import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

function QRSlots({
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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSingleSlotMode = !!singleQRMode;

  const getQRSize = () => {
    const baseSize = isSingleSlotMode ? 120 : 90;
    return baseSize * scale;
  };

  // Convert 0-100 coordinates to actual screen positions with safe boundaries
  const getContainerStyle = () => {
    const qrSize = getQRSize();
    const containerSize = qrSize + 20;
    
    // Ensure we have valid screen dimensions
    const validScreenHeight = screenHeight || 812; // iPhone X default
    
    // Calculate safe area boundaries using dynamic insets with additional UI margins
    const additionalTopMargin = 80; // Space for UI elements (time display, etc.)
    const additionalBottomMargin = 20; // Minimal bottom margin for edge proximity
    const safeMarginTop = insets.top + additionalTopMargin;
    const safeMarginBottom = insets.bottom + additionalBottomMargin;
    const availableHeight = Math.max(200, validScreenHeight - safeMarginTop - safeMarginBottom); // Ensure minimum height
    
    // Y position: 0=bottom, 100=top
    // At Y=0, QR should be at bottom of safe area
    // At Y=100, QR should be at top of safe area
    // At Y=50, QR should be centered
    const yPercent = Math.max(0, Math.min(100, yPosition));
    
    // Calculate position from bottom of screen
    // When Y=0, offset should position QR at bottom (small offset)
    // When Y=100, offset should position QR at top (large offset)
    // We need to ensure QR never goes above the safe area
    const maxBottomOffset = validScreenHeight - safeMarginTop - containerSize;
    const minBottomOffset = safeMarginBottom;
    
    // Linear interpolation between min and max positions
    const bottomOffset = minBottomOffset + (yPercent / 100) * (maxBottomOffset - minBottomOffset);
    
    return {
      position: 'absolute' as const,
      bottom: bottomOffset,
      left: 0,
      right: 0,
      paddingHorizontal: 8, // Reduced from 20 to 8 for closer edge positioning
      alignItems: 'center' as const,
    };
  };

  const getSlotStyle = (isLeft: boolean) => {
    const qrSize = getQRSize();
    const containerSize = qrSize + 20;
    
    // Ensure we have valid screen dimensions
    const validScreenWidth = screenWidth || 375; // iPhone X default
    
    if (isSingleSlotMode) {
      // Convert x position to horizontal offset from center
      const maxOffset = Math.min(100, (validScreenWidth / 2) - containerSize / 2 - 8); // Reduced from 20 to 8
      const offsetPercent = ((xPosition - 50) / 50) * 100; // -100 to 100
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, (offsetPercent / 100) * maxOffset));
      
      return {
        transform: [{ translateX: clampedOffset }],
      };
    }
    
    // For double mode, apply horizontal positioning to both slots
    const spacer = Math.max(40, qrSize * 0.3);
    const maxOffset = Math.min(50, (validScreenWidth / 4) - containerSize / 2 - spacer / 2 - 4); // Reduced from 10 to 4
    const offsetPercent = ((xPosition - 50) / 50) * 100; // -100 to 100
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, (offsetPercent / 100) * maxOffset));
    const offset = isLeft ? -clampedOffset : clampedOffset;
    
    return {
      transform: [{ translateX: offset }],
    };
  };

  const renderQRSlot = (qr: QRCodeData | null, slot: 'primary' | 'secondary') => {
    if (qr) {
      const hasCustomLabel = qr.label && qr.label !== qr.type;
      
      // Determine container background color - always use QR background color
      const getContainerBackgroundColor = () => {
        // Container always matches QR background (including transparent)
        return qr.design?.backgroundColor || '#FFFFFF';
      };
      
      const containerBg = getContainerBackgroundColor();
      const isTransparent = containerBg === 'transparent';

      return (
        <View style={styles.qrWrapper}>
          <View style={[
            styles.qrContainer,
            {
              width: isTransparent ? getQRSize() : getQRSize() + 20,
              height: isTransparent ? getQRSize() : getQRSize() + 20,
              backgroundColor: containerBg,
              padding: isTransparent ? 0 : 1,
              borderRadius: isTransparent ? 0 : 14
            }
          ]}>
            <QRCodePreview 
              value={qr.content} 
              size={getQRSize()} 
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
          <View style={styles.labelContainer}>
            {hasCustomLabel && (
              <Text style={styles.qrLabel} numberOfLines={2} ellipsizeMode="tail">
                {qr.label}
              </Text>
            )}
          </View>
        </View>
      );
    }

    // If hideEmptySlots is true, render an invisible placeholder to maintain layout
    if (hideEmptySlots) {
      return (
        <View style={styles.qrWrapper}>
          <View
            style={[
              styles.qrContainer,
              {
                width: getQRSize() + 20,
                height: getQRSize() + 20,
                opacity: 0,
              },
            ]}
          />
          <View style={styles.labelContainer} />
        </View>
      );
    }

    return (
      <View style={styles.qrWrapper}>
        <View style={[styles.qrContainer, styles.qrPlaceholder, { width: getQRSize() + 20, height: getQRSize() + 20 }]}>
          <Text style={styles.qrPlaceholderIcon}>+</Text>
          <Text style={styles.qrPlaceholderText}>CREATE QR{'\n'}CODE</Text>
        </View>
        <View style={styles.labelContainer} />
      </View>
    );
  };

  // Always show slots in dual mode to maintain layout, regardless of hideEmptySlots
  const shouldShowPrimary = true;
  const shouldShowSecondary = !isSingleSlotMode;

  if (isSingleSlotMode) {
    return (
      <View style={[styles.qrSlotsContainer, styles.singleQRContainer, getContainerStyle()]}>
        <TouchableOpacity 
          style={[styles.qrSlot, getSlotStyle(false)]} 
          onPress={() => onSlotPress('primary')}
        >
          {renderQRSlot(primaryQR, 'primary')}
        </TouchableOpacity>
        
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

      {(shouldShowPrimary && shouldShowSecondary) && (
        <View style={[styles.qrSpacer, { width: Math.max(40, getQRSize() * 0.3) }]} />
      )}

      {shouldShowSecondary && (
        <TouchableOpacity 
          style={[styles.qrSlot, getSlotStyle(false)]} 
          onPress={() => onSlotPress('secondary')}
        >
          {renderQRSlot(secondaryQR, 'secondary')}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default React.memo(QRSlots);

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
    justifyContent: 'flex-end',
  },
  qrSpacer: {
    width: 40,
  },
  qrWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  labelContainer: {
    marginTop: 6,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    width: '100%',
  },
  qrContainer: {
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    width: '100%',
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
});
