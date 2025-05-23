import { QRCodeType, TextQRCode } from '../../types/qr-code';
import { createDefaultQRCode, generateUniqueId } from '../../utils/qrUtils';

export interface TextQRInput {
  content: string;
  label?: string;
}

export const createTextQR = (input: TextQRInput): TextQRCode => {
  const { content, label } = input;
  
  const defaultLabel = content.length > 20
    ? `${content.substring(0, 20)}...`
    : content;
  
  return {
    ...(createDefaultQRCode(QRCodeType.TEXT) as Partial<TextQRCode>),
    id: generateUniqueId(),
    type: QRCodeType.TEXT,
    content,
    label: label || defaultLabel,
  } as TextQRCode;
};