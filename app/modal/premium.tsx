import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserPreferencesService } from '../../services/UserPreferences';

export default function PremiumModal() {
  const handleUpgrade = async () => {
    try {
      await UserPreferencesService.setPremium(true);
      Alert.alert('Success', 'Premium activated!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to activate premium');
    }
  };

  const features = [
    {
      icon: '🔧',
      title: 'Secondary QR Code',
      description: 'Add a second QR code to your wallpaper for more functionality'
    },
    {
      icon: '🎨',
      title: 'Premium Backgrounds',
      description: 'Access to exclusive gradient collections and custom themes'
    },
    {
      icon: '📱',
      title: 'Advanced Export',
      description: 'Export in multiple formats and resolutions'
    },
    {
      icon: '☁️',
      title: 'Cloud Sync',
      description: 'Sync your QR codes across multiple devices'
    },
    {
      icon: '🔒',
      title: 'Priority Support',
      description: 'Get help faster with premium customer support'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Unlock Premium</Text>
          <Text style={styles.subtitle}>
            Get the most out of QuRe with premium features
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <View style={styles.priceCard}>
            <Text style={styles.priceTitle}>Premium Plan</Text>
            <Text style={styles.priceAmount}>$4.99</Text>
            <Text style={styles.pricePeriod}>per month</Text>
          </View>
        </View>

        <View style={styles.guaranteeContainer}>
          <Text style={styles.guaranteeText}>
            ✓ 30-day money-back guarantee
          </Text>
          <Text style={styles.guaranteeText}>
            ✓ Cancel anytime
          </Text>
          <Text style={styles.guaranteeText}>
            ✓ Instant activation
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.upgradeButton} 
          onPress={handleUpgrade}
        >
          <Text style={styles.upgradeButtonText}>Start Premium Trial</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2196f3',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  pricingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  priceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#666',
  },
  guaranteeContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  guaranteeText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  upgradeButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});