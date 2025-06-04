// components/qr-design/QRDesignForm.tsx
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { QRCodeDesign } from '../../../types/QRCode';
import ColorPicker from './ColorPicker';
import DesignSliders from './DesignSliders';
import GradientPicker from './GradientPicker';
import LogoPicker from './LogoPicker';

interface QRDesignFormProps {
  design: QRCodeDesign;
  onDesignChange: (design: QRCodeDesign) => void;
  isPremium: boolean;
}

export default function QRDesignForm({ design, onDesignChange, isPremium }: QRDesignFormProps) {
  const updateDesign = (updates: Partial<QRCodeDesign>) => {
    onDesignChange({ ...design, ...updates });
  };

  if (!isPremium) {
    return (
      <View style={styles.premiumContainer}>
        <Text style={styles.premiumIcon}>🔒</Text>
        <Text style={styles.premiumTitle}>Premium Feature</Text>
        <Text style={styles.premiumText}>
          Upgrade to Premium to customize your QR code design
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ColorPicker
        label="QR Code Color"
        selectedColor={design.color}
        onColorSelect={(color) => updateDesign({ color })}
      />

      <ColorPicker
        label="Background Color"
        selectedColor={design.backgroundColor}
        onColorSelect={(backgroundColor) => updateDesign({ backgroundColor })}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Gradient</Text>
        <Switch
          value={design.enableLinearGradient}
          onValueChange={(enableLinearGradient) => updateDesign({ enableLinearGradient })}
          trackColor={{ false: '#ddd', true: '#2196f3' }}
        />
      </View>

      {design.enableLinearGradient && (
        <GradientPicker
          selectedGradient={design.linearGradient || ['#FF0000', '#00FF00']}
          onGradientSelect={(linearGradient) => updateDesign({ 
            linearGradient,
            gradientDirection: [170, 0, 0, 0]
          })}
        />
      )}

      <LogoPicker
        logo={design.logo || null}
        onLogoSelect={(logo) => updateDesign({ logo: logo || undefined })}
      />

      <DesignSliders
        logoSize={design.logoSize || 20}
        logoMargin={design.logoMargin || 2}
        logoBorderRadius={design.logoBorderRadius || 0}
        onLogoSizeChange={(logoSize) => updateDesign({ logoSize })}
        onLogoMarginChange={(logoMargin) => updateDesign({ logoMargin })}
        onLogoBorderRadiusChange={(logoBorderRadius) => updateDesign({ logoBorderRadius })}
        hasLogo={!!design.logo}
      />

      {design.logo && (
        <ColorPicker
          label="Logo Background Color"
          selectedColor={design.logoBackgroundColor || '#FFFFFF'}
          onColorSelect={(logoBackgroundColor) => updateDesign({ logoBackgroundColor })}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  premiumContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  premiumIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  premiumText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});