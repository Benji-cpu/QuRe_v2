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

export type QRCodeType = 'link' | 'whatsapp' | 'email' | 'phone' | 'contact' | 'text';

export type QRCodeTypeData = 
  | LinkData 
  | WhatsAppData
  | EmailData 
  | PhoneData 
  | ContactData 
  | TextData;

export interface LinkData {
  url: string;
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

export interface TextData {
  text: string;
  label?: string;
}