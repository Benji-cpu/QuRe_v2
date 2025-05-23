export enum QRCodeType {
    LINK = 'link',
    EMAIL = 'email',
    PHONE = 'phone',
    SMS = 'sms',
    VCARD = 'vcard',
    WHATSAPP = 'whatsapp',
    TEXT = 'text',
  }
  
  export interface BaseQRCode {
    id: string;
    type: QRCodeType;
    label: string;
    createdAt: number;
    updatedAt: number;
    design: QRDesignOptions;
  }
  
  export interface QRDesignOptions {
    color: string;
    backgroundColor: string;
    gradient: boolean;
    gradientStartColor: string;
    gradientEndColor: string;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    quietZone: number;
  }
  
  export interface LinkQRCode extends BaseQRCode {
    type: QRCodeType.LINK;
    url: string;
  }
  
  export interface EmailQRCode extends BaseQRCode {
    type: QRCodeType.EMAIL;
    email: string;
    subject?: string;
    body?: string;
  }
  
  export interface PhoneQRCode extends BaseQRCode {
    type: QRCodeType.PHONE;
    countryCode: string;
    phoneNumber: string;
  }
  
  export interface SMSQRCode extends BaseQRCode {
    type: QRCodeType.SMS;
    countryCode: string;
    phoneNumber: string;
    message?: string;
  }
  
  export interface VCardQRCode extends BaseQRCode {
    type: QRCodeType.VCARD;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    mobileNumber?: string;
    email?: string;
    website?: string;
    company?: string;
    jobTitle?: string;
    fax?: string;
    address?: string;
    city?: string;
    postCode?: string;
    country?: string;
  }
  
  export interface WhatsAppQRCode extends BaseQRCode {
    type: QRCodeType.WHATSAPP;
    countryCode: string;
    phoneNumber: string;
    message?: string;
  }
  
  export interface TextQRCode extends BaseQRCode {
    type: QRCodeType.TEXT;
    content: string;
  }
  
  export type QRCode =
    | LinkQRCode
    | EmailQRCode
    | PhoneQRCode
    | SMSQRCode
    | VCardQRCode
    | WhatsAppQRCode
    | TextQRCode;
  
  export interface QRCodeHistory {
    codes: QRCode[];
    primarySlot: string | null;
    secondarySlot: string | null;
  }