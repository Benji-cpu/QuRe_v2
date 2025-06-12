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
    validateReceiptAndroid,
    validateReceiptIos,
} from 'react-native-iap';
import { ALL_PRODUCT_IDS, APP_STORE_SHARED_SECRET, GOOGLE_PLAY_LICENSE_KEY } from '../config/IAPConfig';

export class IAPService {
  static purchaseUpdateSubscription: any = null;
  static purchaseErrorSubscription: any = null;
  static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await initConnection();
      
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

  static async getAvailableProducts(productIds: string[] = ALL_PRODUCT_IDS): Promise<Product[]> {
    try {
      const products = await getProducts({ skus: productIds });
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  static async validatePurchase(purchase: Purchase): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const receipt = purchase.purchaseToken;
        if (receipt) {
          const result = await validateReceiptAndroid({
            packageName: 'com.anonymous.QuRe',
            productId: purchase.productId,
            purchaseToken: receipt,
            accessToken: GOOGLE_PLAY_LICENSE_KEY,
          });
          return result.isValid;
        }
      } else if (Platform.OS === 'ios') {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          const result = await validateReceiptIos({
            receiptBody: {
              'receipt-data': receipt,
              password: APP_STORE_SHARED_SECRET,
            },
            isTest: __DEV__,
          });
          return result.status === 0;
        }
      }
      return true;
    } catch (error) {
      console.error('Purchase validation failed:', error);
      return true;
    }
  }

  static async purchaseProduct(
    productId: string,
    onSuccess: (purchase: Purchase) => void,
    onError: (error: PurchaseError) => void
  ): Promise<void> {
    try {
      this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: Purchase) => {
        console.log('Purchase successful:', purchase);
        
        const isValid = await this.validatePurchase(purchase);
        
        if (isValid) {
          await finishTransaction({ 
            purchase, 
            isConsumable: false
          });
          
          onSuccess(purchase);
        } else {
          console.error('Purchase validation failed');
          onError({ code: 'E_VALIDATION_FAILED', message: 'Purchase validation failed' } as PurchaseError);
        }
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
    await endConnection();
    this.isInitialized = false;
  }
}