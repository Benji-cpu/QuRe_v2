import { QRGenerator } from '../QRGenerator';

describe('QRGenerator.generateContent', () => {
  describe('paypal', () => {
    it('generates a basic PayPal.me link', () => {
      const content = QRGenerator.generateContent('paypal', {
        paypalme: 'janedoe',
      });

      expect(content).toBe('https://paypal.me/janedoe');
    });

    it('sanitizes username with spaces and @', () => {
      const content = QRGenerator.generateContent('paypal', {
        paypalme: '@jane doe',
      });

      expect(content).toBe('https://paypal.me/janedoe');
    });

    it('includes amount and currency when provided', () => {
      const content = QRGenerator.generateContent('paypal', {
        paypalme: 'janedoe',
        amount: '25',
        currency: 'usd',
      });

      expect(content).toBe('https://paypal.me/janedoe/25USD');
    });
  });

  describe('wise', () => {
    it('creates a Wise payment link with wiseTag', () => {
      const content = QRGenerator.generateContent('wise', {
        wiseTag: 'janedoe',
        email: 'ignored@example.com', // wiseTag takes precedence
      });

      expect(content).toBe('https://wise.com/pay/me/janedoe');
    });

    it('supports legacy email field as tag', () => {
      const content = QRGenerator.generateContent('wise', {
        email: 'janedoe', // No wiseTag provided
      });

      expect(content).toBe('https://wise.com/pay/me/janedoe');
    });

    it('strips @ from tag', () => {
      const content = QRGenerator.generateContent('wise', {
        wiseTag: '@janedoe',
      });

      expect(content).toBe('https://wise.com/pay/me/janedoe');
    });

    it('appends query parameters for amount and currency', () => {
      const content = QRGenerator.generateContent('wise', {
        wiseTag: 'janedoe',
        amount: '100',
        currency: 'eur',
      });

      expect(content).toBe(
        'https://wise.com/pay/me/janedoe?amount=100&currency=EUR',
      );
    });
  });

  describe('bitcoin', () => {
    it('creates a bitcoin address payload', () => {
      const content = QRGenerator.generateContent('bitcoin', {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      });

      expect(content).toBe(
        'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      );
    });

    it('includes amount parameter when provided', () => {
      const content = QRGenerator.generateContent('bitcoin', {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        amount: '0.5',
      });

      expect(content).toBe(
        'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.5',
      );
    });
  });

  describe('phone', () => {
    it('returns a tel link', () => {
      const content = QRGenerator.generateContent('phone', {
        phone: '+1234567890',
      });

      expect(content).toBe('tel:+1234567890');
    });
  });
});

