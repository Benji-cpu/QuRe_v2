// services/PricingService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferencesService } from './UserPreferences';

const PRICING_KEY = '@qure_pricing_state';
const PURCHASE_KEY = '@qure_purchase_state';

export interface PricingState {
  currentTier: number; // 0 = $4.99, 1 = $3.99, 2 = $2.99
  rejectedOffers: string[]; // timestamps of rejections
  lastOfferDate?: string;
  purchaseDate?: string;
  purchasePrice?: number;
}

export interface PricingTier {
  tier: number;
  price: number;
  productId: string;
  displayPrice: string;
}

export const PRICING_TIERS: PricingTier[] = [
  { tier: 0, price: 4.99, productId: 'qure_premium_499', displayPrice: '$4.99' },
  { tier: 1, price: 3.99, productId: 'qure_premium_399', displayPrice: '$3.99' },
  { tier: 2, price: 2.99, productId: 'qure_premium_299', displayPrice: '$2.99' },
];

export class PricingService {
  static async getPricingState(): Promise<PricingState> {
    try {
      const data = await AsyncStorage.getItem(PRICING_KEY);
      return data ? JSON.parse(data) : { currentTier: 0, rejectedOffers: [] };
    } catch (error) {
      console.error('Error loading pricing state:', error);
      return { currentTier: 0, rejectedOffers: [] };
    }
  }

  static async savePricingState(state: PricingState): Promise<void> {
    try {
      await AsyncStorage.setItem(PRICING_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving pricing state:', error);
      throw error;
    }
  }

  static async recordRejection(): Promise<PricingTier> {
    try {
      const state = await this.getPricingState();
      state.rejectedOffers.push(new Date().toISOString());
      
      // Move to next tier if available
      if (state.currentTier < PRICING_TIERS.length - 1) {
        state.currentTier += 1;
      }
      
      state.lastOfferDate = new Date().toISOString();
      await this.savePricingState(state);
      
      return PRICING_TIERS[state.currentTier];
    } catch (error) {
      console.error('Error recording rejection:', error);
      return PRICING_TIERS[0];
    }
  }

  static async getCurrentPricingTier(): Promise<PricingTier> {
    try {
      const state = await this.getPricingState();
      return PRICING_TIERS[state.currentTier];
    } catch (error) {
      console.error('Error getting current tier:', error);
      return PRICING_TIERS[0];
    }
  }

  static async recordPurchase(price: number): Promise<void> {
    try {
      const state = await this.getPricingState();
      state.purchaseDate = new Date().toISOString();
      state.purchasePrice = price;
      await this.savePricingState(state);
      
      // Also update premium status
      await UserPreferencesService.setPremium(true);
    } catch (error) {
      console.error('Error recording purchase:', error);
      throw error;
    }
  }

  static async isPurchased(): Promise<boolean> {
    try {
      const state = await this.getPricingState();
      return !!state.purchaseDate;
    } catch (error) {
      console.error('Error checking purchase status:', error);
      return false;
    }
  }
}