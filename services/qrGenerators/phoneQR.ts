import { PhoneQRCode, QRCodeType } from '../../types/qr-code';
import { formatPhone } from '../../utils/formatters';
import { createDefaultQRCode, generateUniqueId } from '../../utils/qrUtils';

export interface PhoneQRInput {
  countryCode: string;
  phoneNumber: string;
  label?: string;
}

export const createPhoneQR = (input: PhoneQRInput): PhoneQRCode => {
  const { countryCode, phoneNumber, label } = input;
  
  const formattedNumber = formatPhone(countryCode, phoneNumber);
  
  return {
    ...(createDefaultQRCode(QRCodeType.PHONE) as Partial<PhoneQRCode>),
    id: generateUniqueId(),
    type: QRCodeType.PHONE,
    countryCode,
    phoneNumber,
    label: label || formattedNumber,
  } as PhoneQRCode;
};