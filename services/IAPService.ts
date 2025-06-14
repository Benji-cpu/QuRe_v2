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
      const result = await initConnection();
      
      if (!result) {
        console.warn('IAP connection failed - this is normal in development/emulator');
        return;
      }
      
      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid().catch(() => {});
      }

      this.isInitialized = true;
      console.log('IAP initialized successfully');
    } catch (error: any) {
      if (error.message?.includes('Billing is unavailable')) {
        console.warn('IAP not available - this is normal in development/emulator');
      } else {
        console.error('Failed to initialize IAP:', error);
      }
    }
  }

  static async getAvailableProducts(productIds: string[]): Promise<Product[]> {
    if (!this.isInitialized) {
      console.warn('IAP not initialized, returning empty products');
      return [];
    }
    
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
    if (!this.isInitialized) {
      onError({ code: 'E_NOT_INITIALIZED', message: 'IAP not initialized' } as PurchaseError);
      return;
    }
    
    try {
      this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: Purchase) => {
        console.log('Purchase successful:', purchase);
        
        await finishTransaction({ 
          purchase, 
          isConsumable: false
        });
        
        onSuccess(purchase);
      });

      this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
        console.error('Purchase error:', error);
        onError(error);
      });

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
    if (this.isInitialized) {
      await endConnection();
      this.isInitialized = false;
    }
  }
}