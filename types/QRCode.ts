// types/QRCode.ts
export interface QRCodeData {
  id: string;
  type: QRCodeType;
  label: string;
  data: QRCodeTypeData;
  content: string;
  createdAt: string;
  design?: QRCodeDesign;
}

export interface QRCodeDesign {
  color: string;
  backgroundColor: string;
  enableLinearGradient: boolean;
  linearGradient?: string[];
  gradientDirection?: number[];
  logo?: string;
  logoSize?: number;
  logoBackgroundColor?: string;
  logoMargin?: number;
  logoBorderRadius?: number;
}

export type QRCodeType = 'link' | 'instagram' | 'whatsapp' | 'email' | 'phone' | 'contact' | 'paypal' | 'wise' | 'bitcoin';

export type QRCodeTypeData = 
  | LinkData 
  | InstagramData
  | WhatsAppData
  | EmailData 
  | PhoneData 
  | ContactData
  | PayPalData
  | WiseData
  | BitcoinData;

export interface LinkData {
  url: string;
  label?: string;
}

export interface InstagramData {
  username: string;
  label?: string;
}

export interface WhatsAppData {
  phone: string;
  message?: string;
  label?: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  message?: string;
  label?: string;
}

export interface PhoneData {
  phone: string;
  label?: string;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  label?: string;
}

export interface PayPalData {
  paypalLink: string;
  amount?: string;
  currency?: string;
  description?: string;
  label?: string;
}

export interface WiseData {
  wiseLink: string;
  amount?: string;
  currency?: string;
  description?: string;
  label?: string;
}

export interface BitcoinData {
  address: string;
  amount?: string;
  label?: string;
  message?: string;
}