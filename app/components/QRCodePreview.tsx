// app/components/QRCodePreview.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRCodeDesign } from '../../types/QRCode';
import { getLogoIconByValue } from '../constants/logoIcons';

interface QRCodePreviewProps {
  value: string;
  size?: number;
  design?: QRCodeDesign;
}

function QRCodePreview({ 
  value, 
  size = 200, 
  design
}: QRCodePreviewProps) {
  const defaultDesign: QRCodeDesign = {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    containerBackgroundColor: '#FFFFFF',
    enableLinearGradient: false,
    logoSize: 20,
    logoBackgroundColor: '#FFFFFF',
    logoMargin: 0, // Changed default to 0
    logoBorderRadius: 0,
  };

  const finalDesign = React.useMemo(() => ({ ...defaultDesign, ...design }), [design]);
  
  const memoizedLogoProps = React.useMemo(() => {
    if (!finalDesign.logo) return undefined;
    const isDataUri = finalDesign.logo.startsWith('data:');
    if (!isDataUri) return undefined;
    const logoSizePercent = Math.max(10, Math.min(40, finalDesign.logoSize || 20));
    const logoSizePixels = Math.round((size * logoSizePercent) / 100);
    const finalLogoSize = Math.max(20, logoSizePixels);
    return { uri: finalDesign.logo, width: finalLogoSize, height: finalLogoSize };
  }, [finalDesign.logo, finalDesign.logoSize, size]);

  const memoizedOverlayLogo = React.useMemo(() => {
    if (!finalDesign.logo) return null;
    const isDataUri = finalDesign.logo.startsWith('data:');
    if (isDataUri) return null;
    const logoDefinition = getLogoIconByValue(finalDesign.logo);
    const isEmoji =
      !finalDesign.logo.startsWith('icon:') &&
      (logoDefinition?.type === 'emoji' || finalDesign.logo.length <= 4);
    if (!logoDefinition && !isEmoji) return null;
    const logoSizePercent = Math.max(10, Math.min(40, finalDesign.logoSize || 20));
    const logoSizePixels = Math.round((size * logoSizePercent) / 100);
    const finalLogoSize = Math.max(20, logoSizePixels);
    const margin = finalDesign.logoMargin ?? 2;
    const containerBackground =
      logoDefinition && logoDefinition.type === 'vector' && logoDefinition.backgroundColor
        ? logoDefinition.backgroundColor
        : finalDesign.logoBackgroundColor || '#FFFFFF';
    let content = null as React.ReactNode;
    if (logoDefinition) {
      if (logoDefinition.type === 'vector') {
        const Icon = logoDefinition.Icon;
        const iconColor = logoDefinition.color || finalDesign.color || '#000000';
        const sizeScale = logoDefinition.sizeScale ?? 0.72;
        content = (
          <Icon
            name={logoDefinition.iconName as never}
            size={Math.round(finalLogoSize * sizeScale)}
            color={iconColor}
          />
        );
      } else {
        content = (
          <Text style={{ fontSize: finalLogoSize * 0.72, lineHeight: finalLogoSize * 0.76 }}>
            {logoDefinition.emoji}
          </Text>
        );
      }
    } else if (isEmoji) {
      content = (
        <Text style={{ fontSize: finalLogoSize * 0.72, lineHeight: finalLogoSize * 0.76 }}>
          {finalDesign.logo}
        </Text>
      );
    }
    if (!content) return null;
    return (
      <View
        style={[
          styles.emojiLogo,
          {
            width: finalLogoSize + margin * 2,
            height: finalLogoSize + margin * 2,
            backgroundColor: containerBackground,
            borderRadius: finalDesign.logoBorderRadius ?? 0,
            overflow: 'hidden',
          },
        ]}
      >
        {content}
      </View>
    );
  }, [
    finalDesign.logo,
    finalDesign.logoSize,
    finalDesign.logoMargin,
    finalDesign.logoBackgroundColor,
    finalDesign.logoBorderRadius,
    finalDesign.color,
    size,
  ]);
  
  const gradientProps = React.useMemo(() => {
    if (finalDesign.enableLinearGradient && finalDesign.linearGradient) {
      return {
        enableLinearGradient: true,
        linearGradient: finalDesign.linearGradient,
        gradientDirection: (finalDesign.gradientDirection || [0, 0, 1, 1]).map(String),
      };
    }
    return {};
  }, [finalDesign.enableLinearGradient, finalDesign.linearGradient, finalDesign.gradientDirection]);

  // When background is transparent, don't show container at all
  if (finalDesign.backgroundColor === 'transparent') {
    return (
      <View style={styles.qrContainer}>
        <QRCode 
          value={value}
          size={size}
          color={finalDesign.enableLinearGradient ? undefined : finalDesign.color}
          backgroundColor="transparent"
          quietZone={0}
          {...gradientProps}
          logo={memoizedLogoProps}
          logoBackgroundColor={finalDesign.logoBackgroundColor || '#FFFFFF'}
          logoMargin={finalDesign.logoMargin ?? 2}
          logoBorderRadius={finalDesign.logoBorderRadius ?? 0}
        />
        {memoizedOverlayLogo}
      </View>
    );
  }

  // Container takes the background color
  return (
    <View style={[styles.container, { 
      width: size + 10, 
      height: size + 10,
      backgroundColor: finalDesign.backgroundColor
    }]}>
      <View style={styles.qrContainer}>
        <QRCode 
          value={value}
          size={size}
          color={finalDesign.enableLinearGradient ? undefined : finalDesign.color}
          backgroundColor={finalDesign.backgroundColor}
          quietZone={0}
          {...gradientProps}
          logo={memoizedLogoProps}
          logoBackgroundColor={finalDesign.logoBackgroundColor || '#FFFFFF'}
          logoMargin={finalDesign.logoMargin ?? 2}
          logoBorderRadius={finalDesign.logoBorderRadius ?? 0}
        />
        {memoizedOverlayLogo}
      </View>
    </View>
  );
}

export default React.memo(QRCodePreview);

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiLogo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});