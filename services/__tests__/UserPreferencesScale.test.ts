import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferencesService } from '../UserPreferences';

jest.mock('@react-native-async-storage/async-storage', () => {
  const mem = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (k: string) => mem.get(k) ?? null,
      setItem: async (k: string, v: string) => { mem.set(k, v); },
      removeItem: async (k: string) => { mem.delete(k); },
      clear: async () => { mem.clear(); },
    },
  };
});

describe('UserPreferences scale clamping', () => {
  beforeEach(async () => {
    await (AsyncStorage as any).clear();
  });

  it('clamps to MIN_SINGLE_QR_SCALE when single mode', async () => {
    const prefs = await UserPreferencesService.getPreferences();
    await UserPreferencesService.savePreferences({ ...prefs, qrSlotMode: 'single' });
    await UserPreferencesService.updateQRScale(0.01);
    const updated = await UserPreferencesService.getPreferences();
    expect(updated.qrScale!).toBeGreaterThanOrEqual(0.5);
  });

  it('clamps to MIN_DOUBLE_QR_SCALE when double mode', async () => {
    const prefs = await UserPreferencesService.getPreferences();
    await UserPreferencesService.savePreferences({ ...prefs, qrSlotMode: 'double' });
    await UserPreferencesService.updateQRScale(0.1);
    const updated = await UserPreferencesService.getPreferences();
    expect(updated.qrScale!).toBeGreaterThanOrEqual(0.7);
  });
});


