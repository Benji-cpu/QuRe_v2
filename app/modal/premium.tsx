import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product, PurchaseError } from 'react-native-iap';
import { PRODUCT_IDS } from '../../config/IAPConfig';
import { useTheme } from '../../contexts/ThemeContext';
import { EngagementPricingService, PricingOffer } from '../../services/EngagementPricingService';
import { IAPService } from '../../services/IAPService';
import { UserPreferencesService } from '../../services/UserPreferences';

export default function PremiumModal() {
  const { theme, mode } = useTheme();
  const [offer, setOffer] = useState<PricingOffer | null>(null);
  const [baseProduct, setBaseProduct] = useState<Product | null>(null); // tier1 (normal price)
  const [offerProduct, setOfferProduct] = useState<Product | null>(null); // current offer
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [iapAvailable, setIapAvailable] = useState(true);

  useEffect(() => {
    initializeScreen();
    
    return () => {
      IAPService.cleanup();
    };
  }, []);

  const initializeScreen = async () => {
    const platform = Platform.OS as 'ios' | 'android';
    const normalPid = PRODUCT_IDS[platform].tier1;
    
    try {
      await IAPService.initialize();
      setIapAvailable(IAPService.isInitialized);

      /* fetch all products with locale-aware pricing */
      const products = await IAPService.getAvailableProducts();
      
      const currentOffer = await EngagementPricingService.determineOffer();
      const engagementInsights = await EngagementPricingService.getEngagementInsights();
      
      if (!currentOffer) {
        const defaultOffer: PricingOffer = {
          price: 4.99,
          productId: normalPid,
          displayPrice: '$4.99',
          trigger: 'default',
          message: 'Unlock all premium features'
        };
        setOffer(defaultOffer);
      } else {
        setOffer(currentOffer);
        await EngagementPricingService.recordOfferShown(currentOffer);
      }

      /* map store products to UI */
      setBaseProduct(products.find(p => p.productId === normalPid) || null);
      if (currentOffer) {
        setOfferProduct(products.find(p => p.productId === currentOffer.productId) || null);
      } else {
        // For default offer, the offer product is the same as base product
        setOfferProduct(products.find(p => p.productId === normalPid) || null);
      }
      
      setInsights(engagementInsights);
    } catch (error) {
      console.error('Failed to initialize premium screen:', error);
      setIapAvailable(false);
      
      const defaultOffer: PricingOffer = {
        price: 4.99,
        productId: normalPid,
        displayPrice: '$4.99',
        trigger: 'default',
        message: 'Unlock all premium features'
      };
      setOffer(defaultOffer);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!offer) return;
    
    if (!iapAvailable) {
      Alert.alert(
        'Purchase Unavailable',
        'In-app purchases are not available on this device. This typically happens in emulators or development builds. Please try on a real device with Google Play Store.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsPurchasing(true);
    
    try {
      await IAPService.purchaseProduct(
        offer.productId,
        async (purchase) => {
          await EngagementPricingService.recordPurchase(offer.price);
          await UserPreferencesService.setPremium(true);
          
          setIsPurchasing(false);
          
          Alert.alert(
            'Welcome to QuRe Premium!', 
            'You now have access to all features including secondary QR codes and custom designs.',
            [{ text: 'Awesome!', onPress: () => router.back() }]
          );
        },
        (error: PurchaseError) => {
          setIsPurchasing(false);
          
          if (error.code === 'E_USER_CANCELLED') {
            return;
          }
          
          Alert.alert(
            'Purchase Failed', 
            error.message || 'Unable to complete purchase. Please try again.',
            [{ text: 'OK' }]
          );
        }
      );
    } catch (error: any) {
      setIsPurchasing(false);
      Alert.alert(
        'Error', 
        'Unable to start purchase. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const features = [
    {
      icon: '🎯',
      title: 'Secondary QR Code',
      description: 'Add a second QR code to your lock screen for more functionality'
    },
    {
      icon: '🎨',
      title: 'Custom QR Designs',
      description: 'Customize colors, gradients, and add logos to your QR codes'
    },
    {
      icon: '🌈',
      title: 'Premium Backgrounds',
      description: 'Access exclusive gradient collections and themes'
    },
    {
      icon: '✨',
      title: 'No Watermarks',
      description: 'Export lock screens without QuRe branding'
    },
    {
      icon: '🚀',
      title: 'Future Updates',
      description: 'All future premium features included'
    }
  ];

  const getSpecialMessage = () => {
    if (!offer || !insights) return null;

    if (offer.trigger === 'launch_discount') {
      return 'Limited-time launch offer! Get premium features at a special discounted price.';
    }

    if (offer.trigger === 'secondary_slot') {
      return 'We noticed you tried to add a second QR code. Unlock this feature now!';
    }
    
    if (offer.trigger === 'high_engagement' && insights.totalQRCodes >= 3) {
      return `You've created ${insights.totalQRCodes} QR codes! Here's a special offer for power users.`;
    }
    
    if (offer.trigger === 'loyal_user' && insights.daysActive >= 7) {
      return `Thanks for using QuRe for ${insights.daysActive} days! Here's an exclusive offer.`;
    }
    
    if (offer.trigger === 'export_wallpaper') {
      return 'Love creating lock screens? Remove watermarks and get premium backgrounds!';
    }

    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Premium</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>Unlock Premium</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {offer?.message || 'Get the most out of QuRe'}
          </Text>
        </View>

        {getSpecialMessage() && (
          <View style={[styles.specialMessageContainer, { backgroundColor: theme.warning + '20', borderLeftColor: theme.warning }]}>
            <Text style={[styles.specialMessage, { color: theme.text }]}>{getSpecialMessage()}</Text>
          </View>
        )}

        <View style={[styles.featuresContainer, { backgroundColor: theme.surface }]}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <View style={[styles.priceCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.priceTitle, { color: theme.text }]}>One-Time Purchase</Text>
            
            {offer && offerProduct && baseProduct && offerProduct.price < baseProduct.price && (
              <View style={[styles.discountBadge, { backgroundColor: theme.success }]}>
                <Text style={styles.discountText}>SPECIAL PRICE</Text>
              </View>
            )}
            
            <View style={styles.priceRow}>
              {offerProduct && baseProduct && offerProduct.price < baseProduct.price && (
                <Text style={[styles.originalPrice, { color: theme.textTertiary }]}>{baseProduct.localizedPrice}</Text>
              )}
              <Text style={[styles.priceAmount, { color: theme.primary }]}>
                {offerProduct?.localizedPrice || offer?.displayPrice || baseProduct?.localizedPrice || '$4.99'}
              </Text>
            </View>
            
            <Text style={[styles.pricePeriod, { color: theme.textSecondary }]}>lifetime access</Text>
            
            {offerProduct && baseProduct && offerProduct.price < baseProduct.price && (
              <Text style={[styles.savingsText, { color: theme.success }]}>
                {(() => {
                  const diff = (Number(baseProduct.price) - Number(offerProduct.price)).toFixed(2);
                  const symbol = (baseProduct.localizedPrice || '').replace(/[\d.,\s]/g, '') || '$';
                  return `Save ${symbol}${diff} with this offer!`;
                })()}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.guaranteeContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.guaranteeText, { color: theme.success }]}>✓ Lifetime access to all features</Text>
          <Text style={[styles.guaranteeText, { color: theme.success }]}>✓ All future updates included</Text>
          <Text style={[styles.guaranteeText, { color: theme.success }]}>✓ No recurring charges</Text>
          <Text style={[styles.guaranteeText, { color: theme.success }]}>✓ Instant activation</Text>
        </View>

        {!iapAvailable && (
          <View style={[styles.warningContainer, { backgroundColor: theme.primary + '20', borderLeftColor: theme.primary }]}>
            <Text style={styles.warningIcon}>ℹ️</Text>
            <Text style={[styles.warningText, { color: theme.text }]}>
              In-app purchases not available in emulator. Test on a real device.
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[
            styles.upgradeButton, 
            { 
              backgroundColor: mode === 'dark' ? theme.surfaceVariant : theme.primary,
              borderWidth: mode === 'dark' ? 2 : 0,
              borderColor: mode === 'dark' ? theme.primary : 'transparent'
            }, 
            isPurchasing && styles.disabledButton
          ]} 
          onPress={handlePurchase}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color={mode === 'dark' ? theme.primary : theme.primaryText} />
          ) : (
            <Text style={[
              styles.upgradeButtonText, 
              { color: mode === 'dark' ? theme.primary : theme.primaryText }
            ]}>
              Unlock Premium - {offerProduct?.localizedPrice || offer?.displayPrice || baseProduct?.localizedPrice || '$4.99'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  specialMessageContainer: {
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  specialMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresContainer: {
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
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  pricingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  priceCard: {
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  originalPrice: {
    fontSize: 24,
    textDecorationLine: 'line-through',
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: 16,
    marginTop: 5,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  guaranteeContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  guaranteeText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    paddingBottom: 40,
  },
  upgradeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});