import { QRCode, QRCodeType } from '../types/qr-code';
import { extractDomainFromUrl } from './validators';

export const formatPhone = (countryCode: string, phoneNumber: string): string => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  return `+${countryCode}${cleanedNumber}`;
};

export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateQRCodeLabel = (qrCode: QRCode): string => {
  switch (qrCode.type) {
    case QRCodeType.LINK:
      return qrCode.label || extractDomainFromUrl(qrCode.url);
    case QRCodeType.EMAIL:
      return qrCode.label || qrCode.email;
    case QRCodeType.PHONE:
      return qrCode.label || formatPhone(qrCode.countryCode, qrCode.phoneNumber);
    case QRCodeType.SMS:
      return qrCode.label || formatPhone(qrCode.countryCode, qrCode.phoneNumber);
    case QRCodeType.VCARD:
      return qrCode.label || `${qrCode.firstName} ${qrCode.lastName}`;
    case QRCodeType.WHATSAPP:
      return qrCode.label || formatPhone(qrCode.countryCode, qrCode.phoneNumber);
    case QRCodeType.TEXT:
      return qrCode.label || qrCode.content.substring(0, 20) + (qrCode.content.length > 20 ? '...' : '');
    default:
      return 'QR Code';
  }
};