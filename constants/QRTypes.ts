// constants/QRTypes.ts
import { QRCodeType } from '../types/QRCode';

export interface QRTypeConfig {
  type: QRCodeType;
  title: string;
  icon: string;
  description?: string;
  useCases?: string[];
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
    description: 'Create QR codes for any web link. Perfect for sharing websites, online content, and digital resources.',
    useCases: [
      'Event registration & check-in links',
      'Affiliate & referral marketing',
      'Social media profiles & campaigns',
      'Business websites & landing pages',
      'Product catalogs & e-commerce',
      'Surveys & feedback forms',
      'Educational resources & assignments',
      'Portfolio & resume links'
    ],
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
    type: 'instagram',
    title: 'Instagram',
    icon: '📸',
    description: 'Share your Instagram profile instantly. Perfect for networking, business cards, and social media marketing.',
    useCases: [
      'Business networking & promotion',
      'Influencer profile sharing',
      'Event marketing campaigns',
      'Personal branding',
      'Social media growth'
    ],
    fields: [
      {
        key: 'username',
        label: 'Instagram Username',
        required: true,
        placeholder: '@username (without @)',
        keyboardType: 'default'
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'Follow me on Instagram'
      }
    ]
  },
  {
    type: 'whatsapp',
    title: 'WhatsApp',
    icon: '💬',
    description: 'Enable instant WhatsApp conversations with pre-filled messages for seamless communication.',
    useCases: [
      'Customer support & service',
      'Business inquiries & orders',
      'Event contact & coordination',
      'Personal networking',
      'Quick contact sharing'
    ],
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
        label: 'Pre-filled Message (Optional)',
        required: false,
        placeholder: 'Hello! I saw your QR code...',
        multiline: true
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'WhatsApp Chat'
      }
    ]
  },
  {
    type: 'email',
    title: 'Email',
    icon: '📧',
    description: 'Create instant email compositions with pre-filled subjects and messages for efficient communication.',
    useCases: [
      'Business contact & inquiries',
      'Customer feedback & support',
      'Event registration & info',
      'Professional networking',
      'Marketing & lead generation'
    ],
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
    description: 'Enable one-tap phone calls for immediate communication and customer connection.',
    useCases: [
      'Business contact numbers',
      'Emergency & support lines',
      'Sales & customer service',
      'Personal contact sharing',
      'Professional networking'
    ],
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
    type: 'contact',
    title: 'Contact',
    icon: '👤',
    description: 'Share complete contact information as a digital business card for easy address book saving.',
    useCases: [
      'Digital business cards',
      'Professional networking',
      'Event contact exchange',
      'Team member directories',
      'Personal contact sharing'
    ],
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
    type: 'paypal',
    title: 'PayPal',
    icon: '💰',
    description: 'Create QR codes for PayPal payment requests and money transfers.',
    useCases: [
      'PayPal.me payment links',
      'Business payment requests',
      'Split bills & shared expenses',
      'Donations & fundraising',
      'Service payments & invoicing'
    ],
    fields: [
      {
        key: 'paypalLink',
        label: 'PayPal Link',
        required: true,
        placeholder: 'https://paypal.me/username',
        keyboardType: 'default'
      },
      {
        key: 'amount',
        label: 'Amount (Optional)',
        required: false,
        placeholder: '10.00',
        keyboardType: 'default'
      },
      {
        key: 'currency',
        label: 'Currency (Optional)',
        required: false,
        placeholder: 'USD'
      },
      {
        key: 'description',
        label: 'Description (Optional)',
        required: false,
        placeholder: 'Payment for services',
        multiline: true
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'PayPal Payment'
      }
    ]
  },
  {
    type: 'wise',
    title: 'Wise',
    icon: '💸',
    description: 'Create QR codes for Wise (formerly TransferWise) payment requests and international transfers.',
    useCases: [
      'International money transfers',
      'Multi-currency payments',
      'Business invoicing',
      'Freelancer payments',
      'Cross-border transactions'
    ],
    fields: [
      {
        key: 'wiseLink',
        label: 'Wise Link',
        required: true,
        placeholder: 'https://wise.com/pay/...',
        keyboardType: 'default'
      },
      {
        key: 'amount',
        label: 'Amount (Optional)',
        required: false,
        placeholder: '50.00',
        keyboardType: 'default'
      },
      {
        key: 'currency',
        label: 'Currency (Optional)',
        required: false,
        placeholder: 'EUR'
      },
      {
        key: 'description',
        label: 'Description (Optional)',
        required: false,
        placeholder: 'Payment description',
        multiline: true
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'Wise Transfer'
      }
    ]
  },
  {
    type: 'bitcoin',
    title: 'Bitcoin',
    icon: '₿',
    description: 'Create QR codes for Bitcoin wallet addresses and cryptocurrency payments.',
    useCases: [
      'Bitcoin wallet addresses',
      'Cryptocurrency donations',
      'Digital asset payments',
      'Crypto merchant payments',
      'P2P Bitcoin transfers'
    ],
    fields: [
      {
        key: 'address',
        label: 'Bitcoin Address',
        required: true,
        placeholder: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        keyboardType: 'default'
      },
      {
        key: 'amount',
        label: 'Amount (BTC, Optional)',
        required: false,
        placeholder: '0.001',
        keyboardType: 'default'
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'Bitcoin Payment'
      },
      {
        key: 'message',
        label: 'Message (Optional)',
        required: false,
        placeholder: 'Payment for services',
        multiline: true
      }
    ]
  }
];