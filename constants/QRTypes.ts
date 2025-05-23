// constants/QRTypes.ts
import { QRCodeType } from '../types/QRCode';

export interface QRTypeConfig {
  type: QRCodeType;
  title: string;
  icon: string;
  fields: QRTypeField[];
}

export interface QRTypeField {
  key: string;
  label: string;
  required: boolean;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}

export const QR_TYPES: QRTypeConfig[] = [
  {
    type: 'link',
    title: 'Link',
    icon: '🔗',
    fields: [
      {
        key: 'url',
        label: 'URL',
        required: true,
        placeholder: 'https://example.com',
        keyboardType: 'default'
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'My Website'
      }
    ]
  },
  {
    type: 'email',
    title: 'Email',
    icon: '📧',
    fields: [
      {
        key: 'email',
        label: 'Email Address',
        required: true,
        placeholder: 'email@example.com',
        keyboardType: 'email-address'
      },
      {
        key: 'subject',
        label: 'Subject (Optional)',
        required: false,
        placeholder: 'Email subject'
      },
      {
        key: 'message',
        label: 'Message (Optional)',
        required: false,
        placeholder: 'Email message',
        multiline: true
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'Email Label'
      }
    ]
  },
  {
    type: 'phone',
    title: 'Phone Call',
    icon: '📞',
    fields: [
      {
        key: 'phone',
        label: 'Phone Number',
        required: true,
        placeholder: '+1234567890',
        keyboardType: 'phone-pad'
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'Phone Label'
      }
    ]
  },
  {
    type: 'sms',
    title: 'SMS',
    icon: '💬',
    fields: [
      {
        key: 'phone',
        label: 'Phone Number',
        required: true,
        placeholder: '+1234567890',
        keyboardType: 'phone-pad'
      },
      {
        key: 'message',
        label: 'Message (Optional)',
        required: false,
        placeholder: 'SMS message',
        multiline: true
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'SMS Label'
      }
    ]
  },
  {
    type: 'contact',
    title: 'Contact',
    icon: '👤',
    fields: [
      {
        key: 'firstName',
        label: 'First Name',
        required: true,
        placeholder: 'John'
      },
      {
        key: 'lastName',
        label: 'Last Name',
        required: true,
        placeholder: 'Doe'
      },
      {
        key: 'phone',
        label: 'Phone (Optional)',
        required: false,
        placeholder: '+1234567890',
        keyboardType: 'phone-pad'
      },
      {
        key: 'email',
        label: 'Email (Optional)',
        required: false,
        placeholder: 'john@example.com',
        keyboardType: 'email-address'
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'Contact Label'
      }
    ]
  },
  {
    type: 'text',
    title: 'Text',
    icon: '📝',
    fields: [
      {
        key: 'text',
        label: 'Text Content',
        required: true,
        placeholder: 'Enter your text here',
        multiline: true
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'Text Label'
      }
    ]
  }
];