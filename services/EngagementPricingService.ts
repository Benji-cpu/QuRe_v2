// services/EngagementPricingService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { PRODUCT_IDS } from '../config/IAPConfig';

const ENGAGEMENT_KEY = '@qure_engagement_metrics';
const OFFER_KEY = '@qure_offer_history';

export interface EngagementMetrics {
  qrCodesCreated: number;
  qrCodesEdited: number;
  historyVisits: number;
  settingsOpened: number;
  wallpapersExported: number;
  sessionCount: number;
  lastActiveDate: string;
  firstUseDate: string;
  secondarySlotAttempts: number;
  totalTimeSpent: number;
}

export interface OfferHistory {
  offersShown: OfferRecord[];
  lastOfferDate?: string;
  purchaseDate?: string;
  purchasePrice?: number;
}

export interface OfferRecord {
  date: string;
  price: number;
  trigger: string;
  accepted: boolean;
}

export interface PricingOffer {
  price: number;
  productId: string;
  displayPrice: string;
  trigger: string;
  message: string;
}

export class EngagementPricingService {
  static async getEngagementMetrics(): Promise<EngagementMetrics> {
    try {
      const data = await AsyncStorage.getItem(ENGAGEMENT_KEY);
      return data ? JSON.parse(data) : this.getDefaultMetrics();
    } catch (error) {
      console.error('Error loading engagement metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  static getDefaultMetrics(): EngagementMetrics {
    const now = new Date().toISOString();
    return {
      qrCodesCreated: 0,
      qrCodesEdited: 0,
      historyVisits: 0,
      settingsOpened: 0,
      wallpapersExported: 0,
      sessionCount: 0,
      lastActiveDate: now,
      firstUseDate: now,
      secondarySlotAttempts: 0,
      totalTimeSpent: 0,
    };
  }

  static async saveEngagementMetrics(metrics: EngagementMetrics): Promise<void> {
    try {
      await AsyncStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error saving engagement metrics:', error);
    }
  }

  static async trackAction(action: keyof Omit<EngagementMetrics, 'lastActiveDate' | 'firstUseDate' | 'totalTimeSpent'>): Promise<void> {
    try {
      const metrics = await this.getEngagementMetrics();
      metrics[action] = (metrics[action] || 0) + 1;
      metrics.lastActiveDate = new Date().toISOString();
      await this.saveEngagementMetrics(metrics);
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  }

  static async trackSession(duration: number): Promise<void> {
    try {
      const metrics = await this.getEngagementMetrics();
      metrics.sessionCount += 1;
      metrics.totalTimeSpent += duration;
      metrics.lastActiveDate = new Date().toISOString();
      await this.saveEngagementMetrics(metrics);
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  }

  static async getOfferHistory(): Promise<OfferHistory> {
    try {
      const data = await AsyncStorage.getItem(OFFER_KEY);
      return data ? JSON.parse(data) : { offersShown: [] };
    } catch (error) {
      console.error('Error loading offer history:', error);
      return { offersShown: [] };
    }
  }

  static async saveOfferHistory(history: OfferHistory): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFER_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving offer history:', error);
    }
  }

  static async determineOffer(): Promise<PricingOffer | null> {
    try {
      /* ----------------------------------------------------------
         Global launch-discount (remove after the launch period)
         ---------------------------------------------------------- */
      const LAUNCH_DISCOUNT_END = new Date('2025-07-31');   // <-- adjust / remote-config later
      const platform = Platform.OS as 'ios' | 'android';

      if (Date.now() < LAUNCH_DISCOUNT_END.getTime()) {
        return {
          price: 3.99,                                     // numeric fallback
          productId: PRODUCT_IDS[platform].tier2,          // tier below normal
          displayPrice: '$3.99',                           // will be replaced by UI with
          trigger: 'launch_discount',                      //   store-formatted price
          message: 'Limited-time launch offer – unlock all premium features'
        };
      }

      const metrics = await this.getEngagementMetrics();
      const history = await this.getOfferHistory();

      if (history.purchaseDate) {
        return null;
      }

      const lastOfferDate = history.lastOfferDate ? new Date(history.lastOfferDate) : null;
      const daysSinceLastOffer = lastOfferDate 
        ? (Date.now() - lastOfferDate.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (daysSinceLastOffer < 3) {
        return null;
      }

      const engagementScore = this.calculateEngagementScore(metrics);

      if (metrics.secondarySlotAttempts >= 2 && !this.hasSeenTrigger(history, 'secondary_slot')) {
        return {
          price: 3.99,
          productId: PRODUCT_IDS[platform].tier2,
          displayPrice: '$3.99',
          trigger: 'secondary_slot',
          message: 'Unlock a second QR code slot and all premium features'
        };
      }

      if (metrics.qrCodesCreated >= 3 && engagementScore >= 50) {
        const price = this.calculateDynamicPrice(engagementScore, history);
        const tier = price === 4.99 ? 'tier1' : price === 3.99 ? 'tier2' : 'tier3';
        
        return {
          price,
          productId: PRODUCT_IDS[platform][tier],
          displayPrice: `$${price.toFixed(2)}`,
          trigger: 'high_engagement',
          message: 'You\'re getting great value from QuRe! Unlock all features'
        };
      }

      if (metrics.wallpapersExported >= 2 && !this.hasSeenTrigger(history, 'export_wallpaper')) {
        return {
          price: 4.99,
          productId: PRODUCT_IDS[platform].tier1,
          displayPrice: '$4.99',
          trigger: 'export_wallpaper',
          message: 'Love your wallpapers? Remove watermarks and unlock premium backgrounds'
        };
      }

      const daysSinceFirstUse = (Date.now() - new Date(metrics.firstUseDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceFirstUse >= 7 && metrics.sessionCount >= 5 && engagementScore >= 30) {
        const price = this.calculateDynamicPrice(engagementScore, history);
        const tier = price === 4.99 ? 'tier1' : price === 3.99 ? 'tier2' : 'tier3';
        
        return {
          price,
          productId: PRODUCT_IDS[platform][tier],
          displayPrice: `$${price.toFixed(2)}`,
          trigger: 'loyal_user',
          message: 'Thanks for being a loyal user! Special offer just for you'
        };
      }

      return null;
    } catch (error) {
      console.error('Error determining offer:', error);
      return null;
    }
  }

  static calculateEngagementScore(metrics: EngagementMetrics): number {
    const weights = {
      qrCodesCreated: 20,
      qrCodesEdited: 10,
      historyVisits: 5,
      settingsOpened: 3,
      wallpapersExported: 15,
      sessionCount: 2,
      secondarySlotAttempts: 25,
    };

    let score = 0;
    score += Math.min(metrics.qrCodesCreated * weights.qrCodesCreated, 100);
    score += Math.min(metrics.qrCodesEdited * weights.qrCodesEdited, 50);
    score += Math.min(metrics.historyVisits * weights.historyVisits, 25);
    score += Math.min(metrics.settingsOpened * weights.settingsOpened, 15);
    score += Math.min(metrics.wallpapersExported * weights.wallpapersExported, 45);
    score += Math.min(metrics.sessionCount * weights.sessionCount, 20);
    score += Math.min(metrics.secondarySlotAttempts * weights.secondarySlotAttempts, 50);

    const avgSessionTime = metrics.totalTimeSpent / Math.max(metrics.sessionCount, 1);
    if (avgSessionTime > 300000) { 
      score += 20;
    }

    return Math.min(score, 100);
  }

  static calculateDynamicPrice(engagementScore: number, history: OfferHistory): number {
    const rejectedOffers = history.offersShown.filter(o => !o.accepted).length;
    
    if (engagementScore >= 80) {
      if (rejectedOffers === 0) return 4.99;
      if (rejectedOffers === 1) return 3.99;
      return 2.99;
    } else if (engagementScore >= 50) {
      if (rejectedOffers === 0) return 3.99;
      return 2.99;
    } else {
      return 2.99;
    }
  }

  static hasSeenTrigger(history: OfferHistory, trigger: string): boolean {
    return history.offersShown.some(offer => offer.trigger === trigger);
  }

  static async recordOfferShown(offer: PricingOffer): Promise<void> {
    try {
      const history = await this.getOfferHistory();
      history.offersShown.push({
        date: new Date().toISOString(),
        price: offer.price,
        trigger: offer.trigger,
        accepted: false,
      });
      history.lastOfferDate = new Date().toISOString();
      await this.saveOfferHistory(history);
    } catch (error) {
      console.error('Error recording offer shown:', error);
    }
  }

  static async recordPurchase(price: number): Promise<void> {
    try {
      const history = await this.getOfferHistory();
      
      if (history.offersShown.length > 0) {
        history.offersShown[history.offersShown.length - 1].accepted = true;
      }
      
      history.purchaseDate = new Date().toISOString();
      history.purchasePrice = price;
      await this.saveOfferHistory(history);
    } catch (error) {
      console.error('Error recording purchase:', error);
    }
  }

  static async getEngagementInsights(): Promise<{
    isHighlyEngaged: boolean;
    daysActive: number;
    avgSessionTime: number;
    totalQRCodes: number;
    readyForOffer: boolean;
  }> {
    try {
      const metrics = await this.getEngagementMetrics();
      const history = await this.getOfferHistory();
      
      const daysActive = Math.floor(
        (Date.now() - new Date(metrics.firstUseDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const avgSessionTime = metrics.totalTimeSpent / Math.max(metrics.sessionCount, 1);
      const engagementScore = this.calculateEngagementScore(metrics);
      
      const lastOfferDate = history.lastOfferDate ? new Date(history.lastOfferDate) : null;
      const daysSinceLastOffer = lastOfferDate 
        ? (Date.now() - lastOfferDate.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      return {
        isHighlyEngaged: engagementScore >= 50,
        daysActive,
        avgSessionTime: avgSessionTime / 1000,
        totalQRCodes: metrics.qrCodesCreated,
        readyForOffer: daysSinceLastOffer >= 3 && !history.purchaseDate,
      };
    } catch (error) {
      console.error('Error getting engagement insights:', error);
      return {
        isHighlyEngaged: false,
        daysActive: 0,
        avgSessionTime: 0,
        totalQRCodes: 0,
        readyForOffer: false,
      };
    }
  }
}