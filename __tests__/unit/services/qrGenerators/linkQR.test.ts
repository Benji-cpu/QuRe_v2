import { createLinkQR } from '../../../../services/qrGenerators/linkQR';
import { QRCodeType } from '../../../../types/qr-code';
import * as qrUtils from '../../../../utils/qrUtils';
import * as validators from '../../../../utils/validators';

jest.mock('../../../../utils/qrUtils', () => ({
  createDefaultQRCode: jest.fn().mockReturnValue({
    id: 'mock-id',
    createdAt: 1000,
    updatedAt: 1000,
    design: {
      color: '#000000',
      backgroundColor: '#FFFFFF',
      gradient: false,
      gradientStartColor: '#000000',
      gradientEndColor: '#000000',
      errorCorrectionLevel: 'M',
      quietZone: 4,
    },
  }),
  generateUniqueId: jest.fn().mockReturnValue('generated-id'),
}));

jest.mock('../../../../utils/validators', () => ({
  ensureHttps: jest.fn(url => url.startsWith('http') ? url : `https://${url}`),
  extractDomainFromUrl: jest.fn(url => {
    if (url.includes('example.com')) return 'example.com';
    if (url.includes('test.com')) return 'test.com';
    return url;
  }),
}));

describe('LinkQR Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a link QR code with given URL', () => {
    const input = {
      url: 'example.com'
    };

    const result = createLinkQR(input);

    expect(qrUtils.createDefaultQRCode).toHaveBeenCalledWith(QRCodeType.LINK);
    expect(validators.ensureHttps).toHaveBeenCalledWith('example.com');
    expect(validators.extractDomainFromUrl).toHaveBeenCalled();
    
    expect(result).toEqual(expect.objectContaining({
      id: 'generated-id',
      type: QRCodeType.LINK,
      url: 'https://example.com',
      label: 'example.com',
    }));
  });

  it('should not modify URLs that already have http/https', () => {
    const input = {
      url: 'https://test.com'
    };

    const result = createLinkQR(input);

    expect(validators.ensureHttps).toHaveBeenCalledWith('https://test.com');
    expect(result.url).toBe('https://test.com');
  });

  it('should use provided label if available', () => {
    const input = {
      url: 'example.com',
      label: 'My Website'
    };

    const result = createLinkQR(input);

    expect(result.label).toBe('My Website');
  });

  it('should use domain as label if no label provided', () => {
    const input = {
      url: 'test.com'
    };

    const result = createLinkQR(input);

    expect(validators.extractDomainFromUrl).toHaveBeenCalled();
    expect(result.label).toBe('test.com');
  });

  it('should use generated ID from utils', () => {
    const input = {
      url: 'example.com'
    };

    const result = createLinkQR(input);

    expect(qrUtils.generateUniqueId).toHaveBeenCalled();
    expect(result.id).toBe('generated-id');
  });
});