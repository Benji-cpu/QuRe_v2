// services/IAPService.ts
import { Platform } from 'react-native';
import {
  endConnection,
  ErrorCode,
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
import { ALL_PRODUCT_IDS } from '../config/IAPConfig';

export class IAPService {
  static purchaseUpdateSubscription: any = null;
  static purchaseErrorSubscription: any = null;
  static isInitialized = false;
  static products: Product[] = [];

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
      
      await this.fetchProducts();
    } catch (error: any) {
      if (error.message?.includes('Billing is unavailable')) {
        console.warn('IAP not available - this is normal in development/emulator');
      } else {
        console.error('Failed to initialize IAP:', error);
      }
    }
  }

  static async fetchProducts(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      this.products = await getProducts({ skus: ALL_PRODUCT_IDS });
      console.log('Products fetched:', this.products.length);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }

  static async getAvailableProducts(productIds: string[] = ALL_PRODUCT_IDS): Promise<Product[]> {
    if (!this.isInitialized) {
      console.warn('IAP not initialized, returning empty products');
      return [];
    }
    
    if (this.products.length === 0) {
      await this.fetchProducts();
    }
    
    return this.products;
  }

  static async purchaseProduct(
    productId: string,
    onSuccess: (purchase: Purchase) => void,
    onError: (error: PurchaseError) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      const error: PurchaseError = {
        code: 'E_UNKNOWN' as ErrorCode,
        message: 'IAP not initialized',
        name: 'IAPError',
        productId: productId
      };
      onError(error);
      return;
    }
    
    try {
      if (this.products.length === 0) {
        await this.fetchProducts();
        
        if (this.products.length === 0) {
          const error: PurchaseError = {
            code: 'E_UNKNOWN' as ErrorCode,
            message: 'No products available. Please try again later.',
            name: 'IAPError',
            productId: productId
          };
          onError(error);
          return;
        }
      }

      const product = this.products.find(p => p.productId === productId);
      if (!product) {
        const error: PurchaseError = {
          code: 'E_UNKNOWN' as ErrorCode,
          message: 'Product not found. Please try again.',
          name: 'IAPError',
          productId: productId
        };
        onError(error);
        return;
      }

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
      this.products = [];
    }
  }
}