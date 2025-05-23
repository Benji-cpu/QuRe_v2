// services/QRGenerator.ts
import { ContactData, EmailData, LinkData, PhoneData, QRCodeType, QRCodeTypeData, SMSData, TextData } from '../types/QRCode';

export class QRGenerator {
  static generateContent(type: QRCodeType, data: QRCodeTypeData): string {
    switch (type) {
      case 'link':
        return this.generateLinkContent(data as LinkData);
      case 'email':
        return this.generateEmailContent(data as EmailData);
      case 'phone':
        return this.generatePhoneContent(data as PhoneData);
      case 'sms':
        return this.generateSMSContent(data as SMSData);
      case 'contact':
        return this.generateContactContent(data as ContactData);
      case 'text':
        return this.generateTextContent(data as TextData);
      default:
        throw new Error(`Unsupported QR code type: ${type}`);
    }
  }

  private static generateLinkContent(data: LinkData): string {
    return data.url;
  }

  private static generateEmailContent(data: EmailData): string {
    let content = `mailto:${data.email}`;
    const params: string[] = [];
    
    if (data.subject) {
      params.push(`subject=${encodeURIComponent(data.subject)}`);
    }
    
    if (data.message) {
      params.push(`body=${encodeURIComponent(data.message)}`);
    }
    
    if (params.length > 0) {
      content += `?${params.join('&')}`;
    }
    
    return content;
  }

  private static generatePhoneContent(data: PhoneData): string {
    return `tel:${data.phone}`;
  }

  private static generateSMSContent(data: SMSData): string {
    let content = `smsto:${data.phone}`;
    if (data.message) {
      content += `:${data.message}`;
    }
    return content;
  }

  private static generateContactContent(data: ContactData): string {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${data.lastName};${data.firstName}`,
      `FN:${data.firstName} ${data.lastName}`
    ];

    if (data.phone) {
      vcard.push(`TEL:${data.phone}`);
    }

    if (data.email) {
      vcard.push(`EMAIL:${data.email}`);
    }

    vcard.push('END:VCARD');
    
    return vcard.join('\n');
  }

  private static generateTextContent(data: TextData): string {
    return data.text;
  }

  static generateLabel(type: QRCodeType, data: QRCodeTypeData): string {
    if ('label' in data && data.label) {
      return data.label;
    }

    switch (type) {
      case 'link':
        const linkData = data as LinkData;
        try {
          return new URL(linkData.url).hostname;
        } catch {
          return linkData.url;
        }
      case 'email':
        return (data as EmailData).email;
      case 'phone':
        return (data as PhoneData).phone;
      case 'sms':
        return (data as SMSData).phone;
      case 'contact':
        const contactData = data as ContactData;
        return `${contactData.firstName} ${contactData.lastName}`;
      case 'text':
        const textData = data as TextData;
        return textData.text.length > 20 ? 
          textData.text.substring(0, 20) + '...' : 
          textData.text;
      default:
        return 'QR Code';
    }
  }
}