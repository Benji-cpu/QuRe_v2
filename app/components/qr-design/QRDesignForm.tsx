// app/components/qr-design/QRDesignForm.tsx
import React from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';
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
  
  const updateDesign = (updates: Partial<QRCodeDesign>) => {
    if ('linearGradient' in updates) {
      updates.gradientDirection = [0, 0, 1, 1];
    }
    
    // Container background always follows QR background
    if ('backgroundColor' in updates) {
      updates.containerBackgroundColor = updates.backgroundColor;
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
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Design Details</Text>

      <View style={[styles.settingsContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.settingBlock}>
          <ColorPicker
            label="QR Code Color"
            selectedColor={design.color}
            onColorSelect={(color) => updateDesign({ color })}
          />
        </View>

        <View style={[styles.settingDivider, { backgroundColor: theme.borderLight }]} />

        <View style={styles.settingBlock}>
          <ColorPicker
            label="Background Color"
            selectedColor={design.backgroundColor}
            onColorSelect={(backgroundColor) => updateDesign({ backgroundColor })}
            showTransparent={true}
          />
        </View>

        <View style={[styles.settingDivider, { backgroundColor: theme.borderLight }]} />

        <View style={styles.settingBlock}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>Enable Gradient</Text>
            <Switch
              value={design.enableLinearGradient}
              onValueChange={(enableLinearGradient) => updateDesign({ enableLinearGradient })}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={Platform.OS === 'android' ? theme.primaryText : undefined}
            />
          </View>

          {design.enableLinearGradient && (
            <View style={styles.gradientPickerInline}>
              <GradientPicker
                selectedGradient={design.linearGradient || ['#FF0000', '#00FF00']}
                onGradientSelect={(linearGradient) => updateDesign({ linearGradient })}
                showLabel={false}
              />
            </View>
          )}
        </View>

        <View style={[styles.settingDivider, { backgroundColor: theme.borderLight }]} />

        <View style={[styles.settingBlock, styles.logoPickerBlock]}>
          <LogoPicker
            logo={design.logo || null}
            onLogoSelect={(logo) => updateDesign({ logo: logo || undefined })}
          />
        </View>

        {design.logo && (
          <View style={[styles.settingBlock, styles.logoSettingsBlock]}>
            <DesignSliders
              logoSize={design.logoSize || 20}
              logoMargin={design.logoMargin || 0}
              logoBorderRadius={design.logoBorderRadius || 0}
              onLogoSizeChange={(logoSize) => updateDesign({ logoSize })}
              onLogoMarginChange={(logoMargin) => updateDesign({ logoMargin })}
              onLogoBorderRadiusChange={(logoBorderRadius) => updateDesign({ logoBorderRadius })}
              hasLogo={!!design.logo}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 0,
  },
  settingsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingBlock: {
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  settingDivider: {
    height: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoPickerBlock: {
    paddingBottom: 8,
  },
  logoSettingsBlock: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  gradientPickerInline: {
    marginTop: 12,
  },
});