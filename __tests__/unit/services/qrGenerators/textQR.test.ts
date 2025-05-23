import { createTextQR } from '../../../../services/qrGenerators/textQR';
import { QRCodeType } from '../../../../types/qr-code';
import * as qrUtils from '../../../../utils/qrUtils';

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

describe('TextQR Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a text QR code with given content', () => {
    const input = {
      content: 'Test content'
    };

    const result = createTextQR(input);

    expect(qrUtils.createDefaultQRCode).toHaveBeenCalledWith(QRCodeType.TEXT);
    expect(result).toEqual(expect.objectContaining({
      id: 'generated-id',
      type: QRCodeType.TEXT,
      content: 'Test content',
      label: 'Test content',
    }));
  });

  it('should truncate long content for label if label not provided', () => {
    const longContent = 'This is a very long content that should be truncated for the label';
    
    const input = {
      content: longContent
    };

    const result = createTextQR(input);

    expect(result.label).toBe('This is a very long co...');
  });

  it('should use provided label if available', () => {
    const input = {
      content: 'Test content',
      label: 'Custom Label'
    };

    const result = createTextQR(input);

    expect(result.label).toBe('Custom Label');
  });

  it('should use generated ID from utils', () => {
    const input = {
      content: 'Test content'
    };

    const result = createTextQR(input);

    expect(qrUtils.generateUniqueId).toHaveBeenCalled();
    expect(result.id).toBe('generated-id');
  });
});