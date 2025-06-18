// services/QRGenerator.ts
import { ContactData, EmailData, InstagramData, LinkData, PhoneData, QRCodeType, QRCodeTypeData, WhatsAppData } from '../types/QRCode';

export class QRGenerator {
  static generateContent(type: QRCodeType, data: QRCodeTypeData): string {
    switch (type) {
      case 'link':
        return this.generateLinkContent(data as LinkData);
      case 'instagram':
        return this.generateInstagramContent(data as InstagramData);
      case 'whatsapp':
        return this.generateWhatsAppContent(data as WhatsAppData);
      case 'email':
        return this.generateEmailContent(data as EmailData);
      case 'phone':
        return this.generatePhoneContent(data as PhoneData);
      case 'contact':
        return this.generateContactContent(data as ContactData);
      default:
        throw new Error(`Unsupported QR code type: ${type}`);
    }
  }

  private static generateLinkContent(data: LinkData): string {
    return data.url;
  }

  private static generateInstagramContent(data: InstagramData): string {
    const username = data.username.replace('@', '');
    return `https://instagram.com/${username}`;
  }

  private static generateWhatsAppContent(data: WhatsAppData): string {
    const cleanPhone = data.phone.replace(/[^0-9]/g, '');
    let url = `https://wa.me/${cleanPhone}`;
    
    if (data.message) {
      url += `?text=${encodeURIComponent(data.message)}`;
    }
    
    return url;
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
      case 'instagram':
        const igData = data as InstagramData;
        return `@${igData.username.replace('@', '')}`;
      case 'whatsapp':
        return `WhatsApp: ${(data as WhatsAppData).phone}`;
      case 'email':
        return (data as EmailData).email;
      case 'phone':
        return (data as PhoneData).phone;
      case 'contact':
        const contactData = data as ContactData;
        return `${contactData.firstName} ${contactData.lastName}`;
      default:
        return 'QR Code';
    }
  }
}