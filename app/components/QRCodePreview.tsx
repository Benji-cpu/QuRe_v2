// app/components/QRCodePreview.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRCodeDesign } from '../../types/QRCode';

interface QRCodePreviewProps {
  value: string;
  size?: number;
  design?: QRCodeDesign;
}

export default function QRCodePreview({ 
  value, 
  size = 200, 
  design
}: QRCodePreviewProps) {
  const defaultDesign: QRCodeDesign = {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    enableLinearGradient: false,
    logoSize: 20,
    logoBackgroundColor: '#FFFFFF',
    logoMargin: 2,
    logoBorderRadius: 0,
  };

  const finalDesign = { ...defaultDesign, ...design };
  
  const getLogoProps = () => {
    if (!finalDesign.logo) return undefined;
    
    // Ensure logo size is reasonable (between 10% and 40% of QR code size)
    const logoSizePercent = Math.max(10, Math.min(40, finalDesign.logoSize || 20));
    const logoSizePixels = Math.round(size * logoSizePercent / 100);
    
    // For very small QR codes, ensure minimum logo size of 20px
    const finalLogoSize = Math.max(20, logoSizePixels);
    
    return {
      uri: finalDesign.logo,
      width: finalLogoSize,
      height: finalLogoSize,
    };
  };
  
  const gradientProps = finalDesign.enableLinearGradient && finalDesign.linearGradient ? {
    enableLinearGradient: true,
    linearGradient: finalDesign.linearGradient,
    gradientDirection: (finalDesign.gradientDirection || [0, 0, 1, 1]).map(String),
  } : {};

  return (
    <View style={[styles.container, { width: size + 10, height: size + 10 }]}>
      <QRCode 
        value={value}
        size={size}
        color={finalDesign.enableLinearGradient ? undefined : finalDesign.color}
        backgroundColor={finalDesign.backgroundColor}
        quietZone={0}
        {...gradientProps}
        logo={getLogoProps()}
        logoBackgroundColor={finalDesign.logoBackgroundColor || '#FFFFFF'}
        logoMargin={Math.max(0, finalDesign.logoMargin || 2)}
        logoBorderRadius={Math.max(0, finalDesign.logoBorderRadius || 0)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});