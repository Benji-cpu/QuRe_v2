import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Layout from '../constants/Layout';
import { QRCode as QRCodeType } from '../types/qr-code';
import { generateQRValue } from '../utils/qrUtils';

interface QRCodePreviewProps {
  qrCode: QRCodeType;
  size?: number;
  style?: ViewStyle;
}

export const QRCodePreview: React.FC<QRCodePreviewProps> = ({
  qrCode,
  size = Layout.qrCode.previewSize,
  style,
}) => {
  const qrValue = useMemo(() => generateQRValue(qrCode), [qrCode]);
  
  const { design } = qrCode;
  const {
    color,
    backgroundColor,
    gradient,
    gradientStartColor,
    gradientEndColor,
    errorCorrectionLevel,
    quietZone,
  } = design;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {gradient ? (
        <LinearGradient
          colors={[gradientStartColor, gradientEndColor]}
          style={[styles.gradient, { borderRadius: 12 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValue}
              size={size - quietZone * 2}
              color={color}
              backgroundColor="transparent"
              ecl={errorCorrectionLevel}
              quietZone={quietZone}
            />
          </View>
        </LinearGradient>
      ) : (
        <View style={[
          styles.qrWrapper, 
          { backgroundColor, borderRadius: 12 }
        ]}>
          <QRCode
            value={qrValue}
            size={size - quietZone * 2}
            color={color}
            backgroundColor={backgroundColor}
            ecl={errorCorrectionLevel}
            quietZone={quietZone}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});