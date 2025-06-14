// config/IAPConfig.ts
import { Platform } from 'react-native';

export const GOOGLE_PLAY_LICENSE_KEY = '';
export const APP_STORE_SHARED_SECRET = '';

export const PRODUCT_IDS = {
  ios: {
    tier1: 'com.anonymous.QuRe.premium_499',
    tier2: 'com.anonymous.QuRe.premium_399',
    tier3: 'com.anonymous.QuRe.premium_299',
  },
  android: {
    tier1: 'qure_premium_499',
    tier2: 'qure_premium_399',
    tier3: 'qure_premium_299',
  }
};

export const ALL_PRODUCT_IDS = Platform.select({
  ios: Object.values(PRODUCT_IDS.ios),
  android: Object.values(PRODUCT_IDS.android),
}) || [];