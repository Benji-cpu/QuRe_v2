import { QRColors } from '../constants/Colors';
import { DEFAULT_ERROR_CORRECTION } from '../constants/ErrorCorrectionLevels';
import { QRCode, QRCodeType, QRDesignOptions } from '../types/qr-code';

export const createDefaultDesignOptions = (): QRDesignOptions => {
  return {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    gradient: false,
    gradientStartColor: QRColors.gradientPresets[0].start,
    gradientEndColor: QRColors.gradientPresets[0].end,
    errorCorrectionLevel: DEFAULT_ERROR_CORRECTION,
    quietZone: 4,
  };
};

export const createDefaultQRCode = (type: QRCodeType): Partial<QRCode> => {
  return {
    id: generateUniqueId(),
    type,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    design: createDefaultDesignOptions(),
  };
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const generateQRValue = (qrCode: QRCode): string => {
  switch (qrCode.type) {
    case QRCodeType.LINK:
      return qrCode.url;
    case QRCodeType.EMAIL: {
      let mailtoUrl = `mailto:${qrCode.email}`;
      if (qrCode.subject) {
        mailtoUrl += `?subject=${encodeURIComponent(qrCode.subject)}`;
      }
      if (qrCode.body) {
        mailtoUrl += `${qrCode.subject ? '&' : '?'}body=${encodeURIComponent(qrCode.body)}`;
      }
      return mailtoUrl;
    }
    case QRCodeType.PHONE:
      return `tel:${qrCode.countryCode}${qrCode.phoneNumber}`;
    case QRCodeType.SMS: {
      let smsUrl = `sms:${qrCode.countryCode}${qrCode.phoneNumber}`;
      if (qrCode.message) {
        smsUrl += `?body=${encodeURIComponent(qrCode.message)}`;
      }
      return smsUrl;
    }
    case QRCodeType.VCARD: {
      let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
      vcard += `N:${qrCode.lastName};${qrCode.firstName};;;\n`;
      vcard += `FN:${qrCode.firstName} ${qrCode.lastName}\n`;
      
      if (qrCode.phoneNumber) {
        vcard += `TEL;TYPE=WORK,VOICE:${qrCode.phoneNumber}\n`;
      }
      
      if (qrCode.mobileNumber) {
        vcard += `TEL;TYPE=CELL,VOICE:${qrCode.mobileNumber}\n`;
      }
      
      if (qrCode.email) {
        vcard += `EMAIL;TYPE=INTERNET:${qrCode.email}\n`;
      }
      
      if (qrCode.website) {
        vcard += `URL:${qrCode.website}\n`;
      }
      
      if (qrCode.company) {
        vcard += `ORG:${qrCode.company}\n`;
      }
      
      if (qrCode.jobTitle) {
        vcard += `TITLE:${qrCode.jobTitle}\n`;
      }
      
      if (qrCode.fax) {
        vcard += `TEL;TYPE=FAX:${qrCode.fax}\n`;
      }
      
      if (qrCode.address || qrCode.city || qrCode.postCode || qrCode.country) {
        vcard += `ADR;TYPE=WORK:;;${qrCode.address || ''}`;
        vcard += `;${qrCode.city || ''}`;
        vcard += `;`;
        vcard += `;${qrCode.postCode || ''}`;
        vcard += `;${qrCode.country || ''}\n`;
      }
      
      vcard += 'END:VCARD';
      return vcard;
    }
    case QRCodeType.WHATSAPP: {
      let whatsappUrl = `https://wa.me/${qrCode.countryCode}${qrCode.phoneNumber}`;
      if (qrCode.message) {
        whatsappUrl += `?text=${encodeURIComponent(qrCode.message)}`;
      }
      return whatsappUrl;
    }
    case QRCodeType.TEXT:
      return qrCode.content;
    default:
      return '';
  }
};