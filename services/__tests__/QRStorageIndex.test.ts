import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRStorage } from '../QRStorage';

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

describe('QRStorage index', () => {
  beforeEach(async () => {
    await (AsyncStorage as any).clear();
  });

  it('saves and fetches by id using index', async () => {
    const item = {
      id: 'abc',
      type: 'link',
      label: 'Test',
      data: { url: 'https://x.y' },
      content: 'https://x.y',
      createdAt: new Date().toISOString(),
    };
    await QRStorage.saveQRCode(item as any);

    const fetched = await QRStorage.getQRCodeById('abc');
    expect(fetched?.id).toBe('abc');
  });

  it('updates item and reflects in index', async () => {
    const item = {
      id: 'upd',
      type: 'link',
      label: 'A',
      data: { url: 'https://a' },
      content: 'https://a',
      createdAt: new Date().toISOString(),
    };
    await QRStorage.saveQRCode(item as any);
    await QRStorage.updateQRCode({ ...item, label: 'B' } as any);

    const fetched = await QRStorage.getQRCodeById('upd');
    expect(fetched?.label).toBe('B');
  });
});


