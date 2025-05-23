import { QRCodeType } from '../../../types/qr-code';
import {
    formatDateTime,
    formatPhone,
    generateQRCodeLabel
} from '../../../utils/formatters';
  
  describe('Formatters', () => {
    describe('formatPhone', () => {
      it('should format phone numbers with country code', () => {
        expect(formatPhone('1', '5551234567')).toBe('+15551234567');
        expect(formatPhone('44', '1234567890')).toBe('+441234567890');
      });
  
      it('should remove non-numeric characters from the phone number', () => {
        expect(formatPhone('1', '(555) 123-4567')).toBe('+15551234567');
        expect(formatPhone('44', '123 456 7890')).toBe('+441234567890');
      });
    });
  
    describe('formatDateTime', () => {
      it('should format timestamps into readable date-time strings', () => {
        const timestamp = new Date('2023-01-01T12:00:00').getTime();
        const formattedDateTime = formatDateTime(timestamp);
        
        // Since the exact formatting can vary by locale, we'll just check if it's a non-empty string
        expect(typeof formattedDateTime).toBe('string');
        expect(formattedDateTime.length).toBeGreaterThan(0);
        
        // Should contain year
        expect(formattedDateTime).toContain('2023');
      });
    });
  
    describe('generateQRCodeLabel', () => {
      it('should generate label for link QR code', () => {
        const qrCode = {
          type: QRCodeType.LINK,
          url: 'https://example.com',
          label: '',
          id: '1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRCodeLabel({...qrCode, label: 'Custom Label'})).toBe('Custom Label');
        expect(generateQRCodeLabel(qrCode)).toBe('example.com');
      });
  
      it('should generate label for email QR code', () => {
        const qrCode = {
          type: QRCodeType.EMAIL,
          email: 'test@example.com',
          label: '',
          id: '1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRCodeLabel({...qrCode, label: 'Custom Label'})).toBe('Custom Label');
        expect(generateQRCodeLabel(qrCode)).toBe('test@example.com');
      });
  
      it('should generate label for phone QR code', () => {
        const qrCode = {
          type: QRCodeType.PHONE,
          countryCode: '1',
          phoneNumber: '5551234567',
          label: '',
          id: '1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRCodeLabel({...qrCode, label: 'Custom Label'})).toBe('Custom Label');
        expect(generateQRCodeLabel(qrCode)).toBe('+15551234567');
      });
  
      it('should generate label for SMS QR code', () => {
        const qrCode = {
          type: QRCodeType.SMS,
          countryCode: '1',
          phoneNumber: '5551234567',
          message: 'Hello',
          label: '',
          id: '1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRCodeLabel({...qrCode, label: 'Custom Label'})).toBe('Custom Label');
        expect(generateQRCodeLabel(qrCode)).toBe('+15551234567');
      });
  
      it('should generate label for VCard QR code', () => {
        const qrCode = {
          type: QRCodeType.VCARD,
          firstName: 'John',
          lastName: 'Doe',
          label: '',
          id: '1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRCodeLabel({...qrCode, label: 'Custom Label'})).toBe('Custom Label');
        expect(generateQRCodeLabel(qrCode)).toBe('John Doe');
      });
  
      it('should generate label for WhatsApp QR code', () => {
        const qrCode = {
          type: QRCodeType.WHATSAPP,
          countryCode: '1',
          phoneNumber: '5551234567',
          message: 'Hello',
          label: '',
          id: '1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRCodeLabel({...qrCode, label: 'Custom Label'})).toBe('Custom Label');
        expect(generateQRCodeLabel(qrCode)).toBe('+15551234567');
      });
  
      it('should generate label for text QR code', () => {
        const qrCode = {
          type: QRCodeType.TEXT,
          content: 'This is a long text that should be truncated',
          label: '',
          id: '1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRCodeLabel({...qrCode, label: 'Custom Label'})).toBe('Custom Label');
        expect(generateQRCodeLabel(qrCode)).toBe('This is a long text t...');
      });
  
      it('should return default label for unknown QR code type', () => {
        const qrCode = {
          type: 'unknown' as QRCodeType,
          id: '1',
          label: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRCodeLabel(qrCode as any)).toBe('QR Code');
      });
    });
  });