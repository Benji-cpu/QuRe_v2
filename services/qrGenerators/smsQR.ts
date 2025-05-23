import { QRCodeType, SMSQRCode } from '../../types/qr-code';
import { formatPhone } from '../../utils/formatters';
import { createDefaultQRCode, generateUniqueId } from '../../utils/qrUtils';

export interface SMSQRInput {
  countryCode: string;
  phoneNumber: string;
  message?: string;
  label?: string;
}

export const createSMSQR = (input: SMSQRInput): SMSQRCode => {
  const { countryCode, phoneNumber, message, label } = input;
  
  const formattedNumber = formatPhone(countryCode, phoneNumber);
  
  return {
    ...(createDefaultQRCode(QRCodeType.SMS) as Partial<SMSQRCode>),
    id: generateUniqueId(),
    type: QRCodeType.SMS,
    countryCode,
    phoneNumber,
    message,
    label: label || formattedNumber,
  } as SMSQRCode;
};