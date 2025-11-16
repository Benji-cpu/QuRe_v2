import {
    Entypo,
    Feather,
    FontAwesome,
    FontAwesome5,
    Ionicons,
    MaterialIcons
} from '@expo/vector-icons';
import React from 'react';

export type LogoIconCategory =
  | 'crypto'
  | 'payment'
  | 'social'
  | 'contact'
  | 'utility'
  | 'misc';

type IconComponent = React.ComponentType<{ name: string; color?: string; size?: number }>;
const asIcon = (Icon: React.ComponentType<any>) => Icon as unknown as IconComponent;

interface BaseLogoIconDefinition {
  value: string;
  label: string;
  category: LogoIconCategory;
}

interface VectorLogoIconDefinition extends BaseLogoIconDefinition {
  type: 'vector';
  Icon: IconComponent;
  iconName: string;
  color?: string;
  backgroundColor?: string;
  sizeScale?: number;
}

interface EmojiLogoIconDefinition extends BaseLogoIconDefinition {
  type: 'emoji';
  emoji: string;
}

export type LogoIconDefinition =
  | VectorLogoIconDefinition
  | EmojiLogoIconDefinition;

const facebookBlue = '#1877F2';
const whatsappGreen = '#25D366';
const instagramPink = '#E4405F';
const twitterBlue = '#1DA1F2';
const linkedinBlue = '#0A66C2';
const paypalBlue = '#00457C';

export const LOGO_ICONS: LogoIconDefinition[] = [
  // Crypto
  {
    type: 'vector',
    value: 'icon:bitcoin',
    label: 'Bitcoin',
    category: 'crypto',
    Icon: asIcon(FontAwesome5),
    iconName: 'bitcoin',
    color: '#F7931A',
  },
  {
    type: 'vector',
    value: 'icon:ethereum',
    label: 'Ethereum',
    category: 'crypto',
    Icon: asIcon(FontAwesome5),
    iconName: 'ethereum',
    color: '#3C3C3D',
  },

  // Payment
  {
    type: 'vector',
    value: 'icon:paypal',
    label: 'PayPal',
    category: 'payment',
    Icon: asIcon(FontAwesome5),
    iconName: 'paypal',
    color: paypalBlue,
  },
  {
    type: 'emoji',
    value: '💸',
    label: 'Venmo',
    category: 'payment',
    emoji: '💸',
  },

  // Social
  {
    type: 'vector',
    value: 'icon:whatsapp',
    label: 'WhatsApp',
    category: 'social',
    Icon: asIcon(FontAwesome),
    iconName: 'whatsapp',
    color: whatsappGreen,
  },
  {
    type: 'vector',
    value: 'icon:instagram',
    label: 'Instagram',
    category: 'social',
    Icon: asIcon(FontAwesome),
    iconName: 'instagram',
    color: instagramPink,
  },
  {
    type: 'vector',
    value: 'icon:twitter',
    label: 'Twitter',
    category: 'social',
    Icon: asIcon(FontAwesome),
    iconName: 'twitter',
    color: twitterBlue,
  },
  {
    type: 'vector',
    value: 'icon:facebook',
    label: 'Facebook',
    category: 'social',
    Icon: asIcon(FontAwesome),
    iconName: 'facebook',
    color: facebookBlue,
  },
  {
    type: 'vector',
    value: 'icon:linkedin',
    label: 'LinkedIn',
    category: 'social',
    Icon: asIcon(FontAwesome),
    iconName: 'linkedin',
    color: linkedinBlue,
  },

  // Contact
  {
    type: 'vector',
    value: 'icon:email',
    label: 'Email',
    category: 'contact',
    Icon: asIcon(MaterialIcons),
    iconName: 'email',
  },
  {
    type: 'vector',
    value: 'icon:phone',
    label: 'Phone',
    category: 'contact',
    Icon: asIcon(Feather),
    iconName: 'phone-call',
  },
  {
    type: 'vector',
    value: 'icon:person',
    label: 'Person',
    category: 'contact',
    Icon: asIcon(Ionicons),
    iconName: 'person',
  },

  // Utility
  {
    type: 'vector',
    value: 'icon:location',
    label: 'Location',
    category: 'utility',
    Icon: asIcon(Entypo),
    iconName: 'location-pin',
    color: '#FF5555',
  },
  {
    type: 'vector',
    value: 'icon:wifi',
    label: 'Wi-Fi',
    category: 'utility',
    Icon: asIcon(MaterialIcons),
    iconName: 'wifi',
  },
  {
    type: 'vector',
    value: 'icon:link',
    label: 'Link',
    category: 'utility',
    Icon: asIcon(Feather),
    iconName: 'link',
  },
  // Misc
  {
    type: 'emoji',
    value: '❤️',
    label: 'Heart',
    category: 'misc',
    emoji: '❤️',
  },
  {
    type: 'emoji',
    value: '⭐',
    label: 'Star',
    category: 'misc',
    emoji: '⭐',
  },
  {
    type: 'emoji',
    value: '🏠',
    label: 'Home',
    category: 'misc',
    emoji: '🏠',
  },
  {
    type: 'emoji',
    value: '🎵',
    label: 'Music',
    category: 'misc',
    emoji: '🎵',
  },
];

export const LOGO_ICON_CATEGORIES: LogoIconCategory[] = [
  'crypto',
  'payment',
  'social',
  'contact',
  'utility',
  'misc',
];

export const LOGO_ICON_CATEGORY_LABELS: Record<LogoIconCategory, string> = {
  crypto: 'Cryptocurrency',
  payment: 'Payment',
  social: 'Social Media',
  contact: 'Contact',
  utility: 'Utility',
  misc: 'Miscellaneous',
};

export const getLogoIconByValue = (
  value: string | null | undefined,
): LogoIconDefinition | undefined =>
  LOGO_ICONS.find((icon) => icon.value === value);


