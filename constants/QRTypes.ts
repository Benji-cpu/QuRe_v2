// constants/QRTypes.ts
import { QRCodeType } from '../types/QRCode';

export interface QRTypeConfig {
  type: QRCodeType;
  title: string;
  icon: string;
  description: string;
  useCases: string[];
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
    description: 'Create QR codes for any web link. Perfect for sharing websites, social media profiles, or online content.',
    useCases: [
      'Event registration & ticket booking',
      'Business website & portfolio links',
      'Social media profiles (Instagram, TikTok, LinkedIn)',
      'Affiliate & marketing links',
      'App downloads & file sharing',
      'Restaurant menus & booking systems',
      'Educational resources & course materials',
      'Google Maps locations & directions'
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
    type: 'paypal',
    title: 'PayPal',
    icon: '💳',
    description: 'Generate PayPal payment links for easy money transfers and payments.',
    useCases: [
      'PayPal.me links for quick payments',
      'Business payment collection',
      'Freelancer invoice payments',
      'Event ticket sales',
      'Donation collection',
      'Marketplace transactions'
    ],
    fields: [
      {
        key: 'paypalme',
        label: 'PayPal.me Username',
        required: true,
        placeholder: 'your-paypal-username',
        keyboardType: 'default'
      },
      {
        key: 'amount',
        label: 'Amount (Optional)',
        required: false,
        placeholder: '25.00',
        keyboardType: 'default'
      },
      {
        key: 'currency',
        label: 'Currency (Optional)',
        required: false,
        placeholder: 'USD'
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
    icon: '🌍',
    description: 'Create Wise payment requests for international money transfers.',
    useCases: [
      'International money transfers',
      'Multi-currency payments',
      'Business payments across borders',
      'Freelancer international payments',
      'Travel expense reimbursements',
      'Cross-border e-commerce'
    ],
    fields: [
      {
        key: 'email',
        label: 'Wise Email',
        required: true,
        placeholder: 'your-wise-email@example.com',
        keyboardType: 'email-address'
      },
      {
        key: 'amount',
        label: 'Amount (Optional)',
        required: false,
        placeholder: '100.00',
        keyboardType: 'default'
      },
      {
        key: 'currency',
        label: 'Currency (Optional)',
        required: false,
        placeholder: 'USD'
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
    description: 'Generate Bitcoin wallet address QR codes for cryptocurrency payments.',
    useCases: [
      'Bitcoin wallet addresses',
      'Cryptocurrency donations',
      'Digital payment collection',
      'Bitcoin ATM transactions',
      'Cold wallet addresses',
      'Lightning network payments'
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
        label: 'Amount in BTC (Optional)',
        required: false,
        placeholder: '0.001',
        keyboardType: 'default'
      },
      {
        key: 'label',
        label: 'Label (Optional)',
        required: false,
        placeholder: 'Bitcoin Payment'
      }
    ]
  },
  {
    type: 'instagram',
    title: 'Instagram',
    icon: '📸',
    description: 'Direct link to your Instagram profile for easy following and discovery.',
    useCases: [
      'Social media growth',
      'Business Instagram promotion',
      'Influencer profile sharing',
      'Event social media promotion',
      'Photography portfolio',
      'Brand awareness campaigns'
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
    description: 'Start WhatsApp conversations with pre-filled messages for customer support or business communication.',
    useCases: [
      'Customer support chat',
      'Business inquiries',
      'Order confirmations',
      'Appointment bookings',
      'Product information requests',
      'Technical support'
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
    description: 'Create email links with pre-filled subject and message for easy communication.',
    useCases: [
      'Customer support emails',
      'Business inquiries',
      'Feedback collection',
      'Newsletter subscriptions',
      'Contact forms',
      'Job applications'
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
    description: 'Direct phone call links for immediate contact and customer service.',
    useCases: [
      'Business phone numbers',
      'Customer service hotlines',
      'Emergency contacts',
      'Appointment scheduling',
      'Sales inquiries',
      'Technical support'
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
    description: 'Share complete contact information that can be saved directly to address books.',
    useCases: [
      'Business cards',
      'Professional networking',
      'Event contact sharing',
      'Real estate agent contacts',
      'Service provider information',
      'Team member contacts'
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
  }
];