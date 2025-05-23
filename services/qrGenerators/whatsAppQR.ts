import { QRCodeType, WhatsAppQRCode } from '../../types/qr-code';
import { formatPhone } from '../../utils/formatters';
import { createDefaultQRCode, generateUniqueId } from '../../utils/qrUtils';

export interface WhatsAppQRInput {
  countryCode: string;
  phoneNumber: string;
  message?: string;
  label?: string;
}

export const createWhatsAppQR = (input: WhatsAppQRInput): WhatsAppQRCode => {
  const { countryCode, phoneNumber, message, label } = input;
  
  const formattedNumber = formatPhone(countryCode, phoneNumber);
  
  return {
    ...(createDefaultQRCode(QRCodeType.WHATSAPP) as Partial<WhatsAppQRCode>),
    id: generateUniqueId(),
    type: QRCodeType.WHATSAPP,
    countryCode,
    phoneNumber,
    message,
    label: label || formattedNumber,
  } as WhatsAppQRCode;
};