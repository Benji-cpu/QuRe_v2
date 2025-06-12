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
    
    const logoSizePixels = size * (finalDesign.logoSize || 20) / 100;
    
    return {
      uri: finalDesign.logo,
      width: logoSizePixels,
      height: logoSizePixels,
    };
  };
  
  const gradientProps = finalDesign.enableLinearGradient && finalDesign.linearGradient ? {
    enableLinearGradient: true,
    linearGradient: finalDesign.linearGradient,
    gradientDirection: finalDesign.gradientDirection || [0, 0, 1, 1],
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
        logoBackgroundColor={finalDesign.logoBackgroundColor}
        logoMargin={finalDesign.logoMargin}
        logoBorderRadius={finalDesign.logoBorderRadius}
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