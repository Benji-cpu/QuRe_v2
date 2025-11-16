import { canGenerateQRCode } from '../qrValidation';
import { QRCodeType } from '../../../types/QRCode';

describe('canGenerateQRCode', () => {
  const validDataByType: Record<QRCodeType, Record<string, string>> = {
    link: { url: 'https://example.com' },
    instagram: { username: 'handle' },
    whatsapp: { phone: '+1234567890' },
    email: { email: 'user@example.com' },
    phone: { phone: '+1987654321' },
    contact: { firstName: 'Jane', lastName: 'Doe' },
    paypal: { paypalme: 'janedoe' },
    wise: { email: 'wise@example.com' },
    bitcoin: { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  };

  it.each(Object.entries(validDataByType))(
    'returns true for %s when required fields provided',
    (type, data) => {
      expect(canGenerateQRCode(type as QRCodeType, data)).toBe(true);
    },
  );

  it('returns false when required fields are missing or blank', () => {
    expect(canGenerateQRCode('paypal', { paypalme: '' })).toBe(false);
    expect(canGenerateQRCode('wise', { email: '   ' })).toBe(false);
    expect(canGenerateQRCode('contact', { firstName: 'Jane' })).toBe(false);
  });

  it('returns false when unknown type is provided', () => {
    expect(
      // @ts-expect-error - intentionally using unsupported type to test guard
      canGenerateQRCode('unsupported', { foo: 'bar' }),
    ).toBe(false);
  });
});

