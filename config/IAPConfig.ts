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

// Use a union of iOS and Android SKUs so we fetch whichever exists for the store.
// This helps when product IDs differ between platforms or were configured differently.
export const ALL_PRODUCT_IDS = Array.from(
  new Set([
    ...Object.values(PRODUCT_IDS.ios),
    ...Object.values(PRODUCT_IDS.android),
  ]),
);
