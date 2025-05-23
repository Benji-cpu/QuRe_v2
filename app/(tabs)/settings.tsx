import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useContext, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { PremiumContext } from '../../context/PremiumContext';
import { setColorScheme, useColorScheme } from '../../hooks/useColorScheme';

export default function SettingsScreen() {
  const { isPremium, setPremiumStatus, expiryDate } = useContext(PremiumContext);
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const handleToggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    const newColorScheme = value ? 'dark' : 'light';
    await setColorScheme(newColorScheme);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpgradeToPremium = () => {
    if (isPremium) {
      Alert.alert(
        'Already Premium',
        'You already have premium access',
        [{ text: 'OK' }]
      );
      return;
    }

    // In a real app, this would show a payment UI
    Alert.alert(
      'Upgrade to Premium',
      'Get access to all premium features for $4.99/month',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            // Simulate a successful purchase
            const expiryDate = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
            await setPremiumStatus(true, expiryDate);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'You are now a premium user!');
          },
        },
      ]
    );
  };

  const handleRestorePurchases = () => {
    // In a real app, this would verify purchases with the app store
    Alert.alert(
      'Restore Purchases',
      'Checking for previous purchases...',
      [{ text: 'OK' }]
    );
  };

  const formatExpiryDate = (timestamp: number | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Premium Section */}
      <View style={styles.premiumContainer}>
        <View style={styles.premiumBadge}>
          <Feather name="star" size={40} color={Colors.secondary} />
        </View>
        <Text style={styles.premiumTitle}>
          {isPremium ? 'Premium User' : 'Upgrade to Premium'}
        </Text>
        <Text style={styles.premiumDescription}>
          {isPremium
            ? `Access all premium features until ${formatExpiryDate(expiryDate)}`
            : 'Get unlimited access to all features and remove restrictions'}
        </Text>

        {isPremium ? (
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Feather name="check" size={18} color={Colors.success} style={styles.featureIcon} />
              <Text style={styles.featureText}>Customize secondary QR code slot</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check" size={18} color={Colors.success} style={styles.featureIcon} />
              <Text style={styles.featureText}>Access to all gradient styles</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check" size={18} color={Colors.success} style={styles.featureIcon} />
              <Text style={styles.featureText}>Advanced QR code customization</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradeToPremium}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Feather name="moon" size={20} color={Colors.text} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="white"
            ios_backgroundColor={Colors.inactive}
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleRestorePurchases}>
          <View style={styles.settingInfo}>
            <Feather name="refresh-cw" size={20} color={Colors.text} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Restore Purchases</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#777" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Feather name="info" size={20} color={Colors.text} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          QuRe - QR Code Generator
        </Text>
        <Text style={styles.copyrightText}>
          © 2025 QuRe App
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.spacing.l,
  },
  premiumContainer: {
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.l,
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumBadge: {
    width: 80,
    height: 80,
    marginBottom: Layout.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: Layout.spacing.xs,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
  },
  featuresContainer: {
    width: '100%',
    marginTop: Layout.spacing.s,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Layout.spacing.xs,
  },
  featureIcon: {
    marginRight: Layout.spacing.s,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
  },
  upgradeButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.medium,
    marginTop: Layout.spacing.m,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: Layout.spacing.m,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  versionText: {
    fontSize: 14,
    color: '#777',
  },
  footer: {
    alignItems: 'center',
    marginTop: Layout.spacing.l,
    marginBottom: Layout.spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});