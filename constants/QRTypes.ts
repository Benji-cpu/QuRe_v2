import { QRCodeType } from '../types/qr-code';

export interface QRTypeInfo {
  type: QRCodeType;
  label: string;
  icon: string;
  description: string;
}

export const QR_TYPES: QRTypeInfo[] = [
  {
    type: QRCodeType.LINK,
    label: 'Link',
    icon: 'link',
    description: 'Create a QR code that opens a website or web page',
  },
  {
    type: QRCodeType.EMAIL,
    label: 'Email',
    icon: 'mail',
    description: 'Create a QR code that composes an email',
  },
  {
    type: QRCodeType.PHONE,
    label: 'Phone Call',
    icon: 'phone',
    description: 'Create a QR code that makes a phone call',
  },
  {
    type: QRCodeType.SMS,
    label: 'SMS',
    icon: 'message-circle',
    description: 'Create a QR code that sends an SMS message',
  },
  {
    type: QRCodeType.VCARD,
    label: 'Contact',
    icon: 'user',
    description: 'Create a QR code with contact information',
  },
  {
    type: QRCodeType.WHATSAPP,
    label: 'WhatsApp',
    icon: 'message-square',
    description: 'Create a QR code that starts a WhatsApp conversation',
  },
  {
    type: QRCodeType.TEXT,
    label: 'Text',
    icon: 'align-left',
    description: 'Create a QR code with plain text content',
  },
];