// services/IAPService.ts
import { Platform } from 'react-native';
import {
    endConnection,
    finishTransaction,
    flushFailedPurchasesCachedAsPendingAndroid,
    getProducts,
    initConnection,
    Product,
    Purchase,
    PurchaseError,
    purchaseErrorListener,
    purchaseUpdatedListener,
    requestPurchase,
} from 'react-native-iap';

export class IAPService {
  static purchaseUpdateSubscription: any = null;
  static purchaseErrorSubscription: any = null;
  static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await initConnection();
      
      // Flush any failed purchases on Android
      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid();
      }

      this.isInitialized = true;
      console.log('IAP initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      throw error;
    }
  }

  static async getAvailableProducts(productIds: string[]): Promise<Product[]> {
    try {
      const products = await getProducts({ skus: productIds });
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  static async purchaseProduct(
    productId: string,
    onSuccess: (purchase: Purchase) => void,
    onError: (error: PurchaseError) => void
  ): Promise<void> {
    try {
      // Set up listeners
      this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: Purchase) => {
        console.log('Purchase successful:', purchase);
        
        // Acknowledge the purchase
        await finishTransaction({ 
          purchase, 
          isConsumable: false // Non-consumable for premium
        });
        
        onSuccess(purchase);
      });

      this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
        console.error('Purchase error:', error);
        onError(error);
      });

      // Request the purchase
      if (Platform.OS === 'ios') {
        await requestPurchase({ sku: productId });
      } else {
        await requestPurchase({ 
          skus: [productId],
          andDangerouslyFinishTransactionAutomaticallyIOS: false
        });
      }
    } catch (error) {
      console.error('Purchase request failed:', error);
      throw error;
    }
  }

  static cleanup(): void {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }

  static async disconnect(): Promise<void> {
    this.cleanup();
    await endConnection();
    this.isInitialized = false;
  }
}