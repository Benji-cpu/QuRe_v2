// types/QRCode.ts
export interface QRCodeData {
    id: string;
    type: QRCodeType;
    label: string;
    data: QRCodeTypeData;
    content: string;
    createdAt: string;
  }
  
  export type QRCodeType = 'link' | 'email' | 'phone' | 'sms' | 'contact' | 'text';
  
  export type QRCodeTypeData = 
    | LinkData 
    | EmailData 
    | PhoneData 
    | SMSData 
    | ContactData 
    | TextData;
  
  export interface LinkData {
    url: string;
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
  
  export interface SMSData {
    phone: string;
    message?: string;
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