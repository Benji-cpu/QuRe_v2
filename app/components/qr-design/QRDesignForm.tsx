// app/components/qr-design/QRDesignForm.tsx
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [hasShownLogoWarning, setHasShownLogoWarning] = useState(false);
  
  const updateDesign = (updates: Partial<QRCodeDesign>) => {
    if ('logo' in updates && updates.logo && !hasShownLogoWarning) {
      Alert.alert(
        'Logo Design Warning',
        'Adding a logo can make QR codes harder to scan. Please test your QR code after adding a logo to ensure it still works correctly.',
        [{ text: 'I Understand', style: 'default' }]
      );
      setHasShownLogoWarning(true);
    }
    
    if ('linearGradient' in updates) {
      updates.gradientDirection = [0, 0, 1, 1];
    }
    
    onDesignChange({ ...design, ...updates });
  };

  if (!isPremium) {
    return (
      <View style={styles.premiumContainer}>
        <Text style={styles.premiumIcon}>🔒</Text>
        <Text style={[styles.premiumTitle, { color: theme.text }]}>Premium Feature</Text>
        <Text style={[styles.premiumText, { color: theme.textSecondary }]}>
          Upgrade to Premium to customize your QR code design
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
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
          <Text style={[styles.switchLabel, { color: theme.text }]}>Enable Gradient</Text>
          <Switch
            value={design.enableLinearGradient}
            onValueChange={(enableLinearGradient) => updateDesign({ enableLinearGradient })}
            trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
            thumbColor={design.enableLinearGradient ? theme.primary : theme.surfaceVariant}
          />
        </View>

        {design.enableLinearGradient && (
          <GradientPicker
            selectedGradient={design.linearGradient || ['#FF0000', '#00FF00']}
            onGradientSelect={(linearGradient) => updateDesign({ linearGradient })}
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
          <View style={[styles.warningContainer, { backgroundColor: theme.warning + '20' }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningText, { color: theme.textSecondary }]}>
              Logos can affect QR code scanning. Test your code after export.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
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
    marginBottom: 10,
  },
  premiumText: {
    fontSize: 16,
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
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});