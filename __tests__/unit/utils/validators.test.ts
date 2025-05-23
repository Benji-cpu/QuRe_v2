import {
    ensureHttps,
    extractDomainFromUrl,
    isValidEmail,
    isValidPhone,
    isValidUrl
} from '../../../utils/validators';
  
  describe('Validators', () => {
    describe('isValidUrl', () => {
      it('should return true for valid URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
        expect(isValidUrl('http://example.com')).toBe(true);
        expect(isValidUrl('https://www.example.co.uk/path?query=1')).toBe(true);
      });
  
      it('should return false for invalid URLs', () => {
        expect(isValidUrl('example')).toBe(false);
        expect(isValidUrl('example.com')).toBe(false);
        expect(isValidUrl('htp:/example.com')).toBe(false);
      });
    });
  
    describe('ensureHttps', () => {
      it('should add https:// prefix to URLs without protocol', () => {
        expect(ensureHttps('example.com')).toBe('https://example.com');
        expect(ensureHttps('www.example.com')).toBe('https://www.example.com');
      });
  
      it('should not modify URLs that already have a protocol', () => {
        expect(ensureHttps('https://example.com')).toBe('https://example.com');
        expect(ensureHttps('http://example.com')).toBe('http://example.com');
      });
    });
  
    describe('isValidEmail', () => {
      it('should return true for valid email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('test.name@example.co.uk')).toBe(true);
        expect(isValidEmail('test+tag@example.com')).toBe(true);
      });
  
      it('should return false for invalid email addresses', () => {
        expect(isValidEmail('test')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('test@example')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('test example.com')).toBe(false);
      });
    });
  
    describe('isValidPhone', () => {
      it('should return true for valid phone numbers', () => {
        expect(isValidPhone('+15551234567')).toBe(true);
        expect(isValidPhone('+44123456789')).toBe(true);
        expect(isValidPhone('+12345678901234')).toBe(true);
      });
  
      it('should return false for invalid phone numbers', () => {
        expect(isValidPhone('1234')).toBe(false); // Too short
        expect(isValidPhone('test')).toBe(false); // Not numeric
        expect(isValidPhone('12345678901234567890')).toBe(false); // Too long
        expect(isValidPhone('5551234567')).toBe(false); // Missing +
      });
    });
  
    describe('extractDomainFromUrl', () => {
      it('should extract domain from URLs', () => {
        expect(extractDomainFromUrl('https://example.com')).toBe('example.com');
        expect(extractDomainFromUrl('http://www.example.com')).toBe('example.com');
        expect(extractDomainFromUrl('https://subdomain.example.co.uk/path')).toBe('subdomain.example.co.uk');
      });
  
      it('should handle URLs without protocol by first adding https://', () => {
        expect(extractDomainFromUrl('example.com')).toBe('example.com');
        expect(extractDomainFromUrl('www.example.com')).toBe('example.com');
      });
  
      it('should return the input if extraction fails', () => {
        expect(extractDomainFromUrl('invalid')).toBe('invalid');
      });
    });
  });