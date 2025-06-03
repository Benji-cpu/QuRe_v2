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
    <View style={[styles.container, { width: size + 10, height: size + 10, backgroundColor }]}>
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
    padding: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});