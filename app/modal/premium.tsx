// app/modal/premium.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PRICING_TIERS, PricingService, PricingTier } from '../../services/PricingService';
import { UserPreferencesService } from '../../services/UserPreferences';

export default function PremiumModal() {
  const [currentTier, setCurrentTier] = useState<PricingTier>(PRICING_TIERS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    loadCurrentTier();
  }, []);

  const loadCurrentTier = async () => {
    try {
      const tier = await PricingService.getCurrentPricingTier();
      setCurrentTier(tier);
    } catch (error) {
      console.error('Error loading pricing tier:', error);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    
    try {
      // For now, simulate the purchase
      // In production, this would call RevenueCat's purchaseProduct method
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await PricingService.recordPurchase(currentTier.price);
      await UserPreferencesService.setPremium(true);
      
      Alert.alert(
        'Success!', 
        'Welcome to QuRe Premium! You now have access to all features.',
        [{ text: 'Great!', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleReject = async () => {
    try {
      const newTier = await PricingService.recordRejection();
      
      if (newTier.tier === currentTier.tier) {
        // No more discounts available
        Alert.alert(
          'Last Chance!',
          `This is our best offer at ${currentTier.displayPrice}. Premium features help support continued development.`,
          [
            { text: 'I\'ll think about it', onPress: () => router.back() },
            { text: 'OK, I\'ll upgrade', onPress: handlePurchase }
          ]
        );
      } else {
        // Show the next discount
        setCurrentTier(newTier);
        Alert.alert(
          'Special Offer!',
          `We\'d love to have you join QuRe Premium. How about ${newTier.displayPrice} instead?`,
          [
            { text: 'Show me', style: 'default' }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling rejection:', error);
      router.back();
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
      icon: '🚫',
      title: 'No Branding',
      description: 'Remove QuRe branding from your wallpapers'
    },
    {
      icon: '🔒',
      title: 'Priority Support',
      description: 'Get help faster with premium customer support'
    }
  ];

  const getSavingsText = () => {
    const originalPrice = PRICING_TIERS[0].price;
    const savings = originalPrice - currentTier.price;
    
    if (savings > 0) {
      return `Save $${savings.toFixed(2)} today!`;
    }
    return null;
  };

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
            
            {currentTier.tier > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>SPECIAL OFFER</Text>
              </View>
            )}
            
            <View style={styles.priceRow}>
              {currentTier.tier > 0 && (
                <Text style={styles.originalPrice}>${PRICING_TIERS[0].price}</Text>
              )}
              <Text style={styles.priceAmount}>{currentTier.displayPrice}</Text>
            </View>
            
            <Text style={styles.pricePeriod}>one-time purchase</Text>
            
            {getSavingsText() && (
              <Text style={styles.savingsText}>{getSavingsText()}</Text>
            )}
          </View>
        </View>

        <View style={styles.guaranteeContainer}>
          <Text style={styles.guaranteeText}>
            ✓ Lifetime access
          </Text>
          <Text style={styles.guaranteeText}>
            ✓ All future updates included
          </Text>
          <Text style={styles.guaranteeText}>
            ✓ Instant activation
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.upgradeButton, isPurchasing && styles.disabledButton]} 
          onPress={handlePurchase}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.upgradeButtonText}>
              Unlock Premium - {currentTier.displayPrice}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleReject}
          disabled={isPurchasing}
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
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    transform: [{ rotate: '10deg' }],
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  originalPrice: {
    fontSize: 24,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  savingsText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 10,
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
  disabledButton: {
    opacity: 0.6,
  },
});