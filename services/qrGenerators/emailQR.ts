import { EmailQRCode, QRCodeType } from '../../types/qr-code';
import { createDefaultQRCode, generateUniqueId } from '../../utils/qrUtils';

export interface EmailQRInput {
  email: string;
  subject?: string;
  body?: string;
  label?: string;
}

export const createEmailQR = (input: EmailQRInput): EmailQRCode => {
  const { email, subject, body, label } = input;
  
  return {
    ...(createDefaultQRCode(QRCodeType.EMAIL) as Partial<EmailQRCode>),
    id: generateUniqueId(),
    type: QRCodeType.EMAIL,
    email,
    subject,
    body,
    label: label || email,
  } as EmailQRCode;
};