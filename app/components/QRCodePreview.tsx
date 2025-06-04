// components/QRCodePreview.tsx
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

  return (
    <View style={[styles.container, { width: size + 10, height: size + 10 }]}>
      <QRCode 
        value={value}
        size={size}
        color={finalDesign.color}
        backgroundColor={finalDesign.backgroundColor}
        quietZone={0}
        enableLinearGradient={finalDesign.enableLinearGradient}
        linearGradient={finalDesign.linearGradient}
        gradientDirection={finalDesign.gradientDirection}
        logo={finalDesign.logo ? { uri: finalDesign.logo } : undefined}
        logoSize={finalDesign.logo ? (size * (finalDesign.logoSize || 20) / 100) : undefined}
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