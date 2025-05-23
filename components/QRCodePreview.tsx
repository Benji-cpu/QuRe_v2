// components/QRCodePreview.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodePreviewProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
}

export default function QRCodePreview({ 
  value, 
  size = 200, 
  backgroundColor = 'white', 
  color = 'black' 
}: QRCodePreviewProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <QRCode 
        value={value}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});