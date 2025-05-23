import { DEFAULT_ERROR_CORRECTION } from '../../../constants/ErrorCorrectionLevels';
import { QRCodeType } from '../../../types/qr-code';
import {
    createDefaultDesignOptions,
    createDefaultQRCode,
    generateQRValue,
    generateUniqueId
} from '../../../utils/qrUtils';
  
  describe('QR Utilities', () => {
    describe('createDefaultDesignOptions', () => {
      it('should create default design options with expected values', () => {
        const options = createDefaultDesignOptions();
        
        expect(options).toEqual({
          color: '#000000',
          backgroundColor: '#FFFFFF',
          gradient: false,
          gradientStartColor: expect.any(String),
          gradientEndColor: expect.any(String),
          errorCorrectionLevel: DEFAULT_ERROR_CORRECTION,
          quietZone: 4,
        });
      });
    });
  
    describe('createDefaultQRCode', () => {
      it('should create default QR code with specified type', () => {
        const type = QRCodeType.TEXT;
        const qrCode = createDefaultQRCode(type);
        
        expect(qrCode).toEqual({
          id: expect.any(String),
          type,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          design: expect.objectContaining({
            color: '#000000',
            backgroundColor: '#FFFFFF',
            gradient: false,
            errorCorrectionLevel: DEFAULT_ERROR_CORRECTION,
            quietZone: 4,
          }),
        });
      });
    });
  
    describe('generateUniqueId', () => {
      it('should generate a unique string ID', () => {
        const id1 = generateUniqueId();
        const id2 = generateUniqueId();
        
        expect(typeof id1).toBe('string');
        expect(id1.length).toBeGreaterThan(0);
        expect(id1).not.toBe(id2); // IDs should be unique
      });
    });
  
    describe('generateQRValue', () => {
      it('should generate correct value for link QR code', () => {
        const qrCode = {
          type: QRCodeType.LINK,
          url: 'https://example.com',
          id: '1',
          label: 'Example',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRValue(qrCode)).toBe('https://example.com');
      });
  
      it('should generate correct value for email QR code', () => {
        const qrCode = {
          type: QRCodeType.EMAIL,
          email: 'test@example.com',
          id: '1',
          label: 'Email',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRValue(qrCode)).toBe('mailto:test@example.com');
        
        const qrCodeWithSubject = {
          ...qrCode,
          subject: 'Test Subject'
        };
        
        expect(generateQRValue(qrCodeWithSubject)).toBe('mailto:test@example.com?subject=Test%20Subject');
        
        const qrCodeWithBody = {
          ...qrCode,
          body: 'Test Body'
        };
        
        expect(generateQRValue(qrCodeWithBody)).toBe('mailto:test@example.com?body=Test%20Body');
        
        const qrCodeWithBoth = {
          ...qrCode,
          subject: 'Test Subject',
          body: 'Test Body'
        };
        
        expect(generateQRValue(qrCodeWithBoth)).toBe('mailto:test@example.com?subject=Test%20Subject&body=Test%20Body');
      });
  
      it('should generate correct value for phone QR code', () => {
        const qrCode = {
          type: QRCodeType.PHONE,
          countryCode: '1',
          phoneNumber: '5551234567',
          id: '1',
          label: 'Phone',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRValue(qrCode)).toBe('tel:15551234567');
      });
  
      it('should generate correct value for SMS QR code', () => {
        const qrCode = {
          type: QRCodeType.SMS,
          countryCode: '1',
          phoneNumber: '5551234567',
          id: '1',
          label: 'SMS',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRValue(qrCode)).toBe('sms:15551234567');
        
        const qrCodeWithMessage = {
          ...qrCode,
          message: 'Hello World'
        };
        
        expect(generateQRValue(qrCodeWithMessage)).toBe('sms:15551234567?body=Hello%20World');
      });
  
      it('should generate correct value for VCard QR code', () => {
        const qrCode = {
          type: QRCodeType.VCARD,
          firstName: 'John',
          lastName: 'Doe',
          id: '1',
          label: 'Contact',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        const value = generateQRValue(qrCode);
        
        expect(value).toContain('BEGIN:VCARD');
        expect(value).toContain('VERSION:3.0');
        expect(value).toContain('N:Doe;John;;;');
        expect(value).toContain('FN:John Doe');
        expect(value).toContain('END:VCARD');
        
        const qrCodeWithAllFields = {
          ...qrCode,
          phoneNumber: '5551234567',
          mobileNumber: '5559876543',
          email: 'john.doe@example.com',
          website: 'https://example.com',
          company: 'Example Corp',
          jobTitle: 'Software Engineer',
          fax: '5551112222',
          address: '123 Main St',
          city: 'Anytown',
          postCode: '12345',
          country: 'USA'
        };
        
        const fullValue = generateQRValue(qrCodeWithAllFields);
        
        expect(fullValue).toContain('TEL;TYPE=WORK,VOICE:5551234567');
        expect(fullValue).toContain('TEL;TYPE=CELL,VOICE:5559876543');
        expect(fullValue).toContain('EMAIL;TYPE=INTERNET:john.doe@example.com');
        expect(fullValue).toContain('URL:https://example.com');
        expect(fullValue).toContain('ORG:Example Corp');
        expect(fullValue).toContain('TITLE:Software Engineer');
        expect(fullValue).toContain('TEL;TYPE=FAX:5551112222');
        expect(fullValue).toContain('ADR;TYPE=WORK:;;123 Main St;Anytown;;12345;USA');
      });
  
      it('should generate correct value for WhatsApp QR code', () => {
        const qrCode = {
          type: QRCodeType.WHATSAPP,
          countryCode: '1',
          phoneNumber: '5551234567',
          id: '1',
          label: 'WhatsApp',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRValue(qrCode)).toBe('https://wa.me/15551234567');
        
        const qrCodeWithMessage = {
          ...qrCode,
          message: 'Hello from WhatsApp'
        };
        
        expect(generateQRValue(qrCodeWithMessage)).toBe('https://wa.me/15551234567?text=Hello%20from%20WhatsApp');
      });
  
      it('should generate correct value for text QR code', () => {
        const qrCode = {
          type: QRCodeType.TEXT,
          content: 'This is a test text',
          id: '1',
          label: 'Text',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRValue(qrCode)).toBe('This is a test text');
      });
  
      it('should return empty string for unknown QR code type', () => {
        const qrCode = {
          type: 'unknown' as QRCodeType,
          id: '1',
          label: 'Unknown',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          design: {}
        };
        
        expect(generateQRValue(qrCode as any)).toBe('');
      });
    });
  });