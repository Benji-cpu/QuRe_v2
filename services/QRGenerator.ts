// services/QRGenerator.ts
import {
    BitcoinData,
    ContactData,
    EmailData,
    InstagramData,
    LinkData,
    PayPalData,
    PhoneData,
    QRCodeType,
    QRCodeTypeData,
    WhatsAppData,
    WiseData
} from '../types/QRCode';

export class QRGenerator {
  private static normalizeUrl(url: string): string {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    // If it already contains a scheme like http:, https:, mailto:, etc., keep as-is
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed;
    // Default to https for bare domains like example.com or www.example.com
    return `https://${trimmed}`;
  }

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
      case 'paypal':
        return this.generatePayPalContent(data as PayPalData);
      case 'wise':
        return this.generateWiseContent(data as WiseData);
      case 'bitcoin':
        return this.generateBitcoinContent(data as BitcoinData);
      default:
        throw new Error(`Unsupported QR code type: ${type}`);
    }
  }

  private static generateLinkContent(data: LinkData): string {
    return this.normalizeUrl(data.url);
  }

  private static generateInstagramContent(data: InstagramData): string {
    const username = (data.username || '').replace(/^@/, '').trim();
    return `https://instagram.com/${encodeURIComponent(username)}`;
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

  private static generatePayPalContent(data: PayPalData): string {
    // Sanitize handle: remove spaces, leading @, and ensure it's clean
    const cleanHandle = (data.paypalme || '').replace(/^@/, '').replace(/\s+/g, '').trim();
    let url = `https://paypal.me/${encodeURIComponent(cleanHandle)}`;
    
    if (data.amount) {
      url += `/${data.amount}`;
      if (data.currency) {
        url += data.currency.toUpperCase();
      }
    }
    
    return url;
  }

  private static generateWiseContent(data: WiseData): string {
    // Use wiseTag if available, fallback to email (legacy support)
    const input = data.wiseTag || data.email || '';
    // Remove leading @ if user included it, as wise.com/pay/me/ expects just the handle
    const cleanTag = input.replace(/^@/, '').trim();
    
    let content = `https://wise.com/pay/me/${encodeURIComponent(cleanTag)}`;
    
    const params: string[] = [];
    if (data.amount) {
      params.push(`amount=${data.amount}`);
    }
    if (data.currency) {
      params.push(`currency=${data.currency.toUpperCase()}`);
    }
    
    if (params.length > 0) {
      content += `?${params.join('&')}`;
    }
    
    return content;
  }

  private static generateBitcoinContent(data: BitcoinData): string {
    let content = `bitcoin:${data.address}`;
    
    if (data.amount) {
      content += `?amount=${data.amount}`;
    }
    
    return content;
  }

  static generateLabel(type: QRCodeType, data: QRCodeTypeData): string {
    // Respect explicit blank labels: if a label field exists but is empty, keep it blank.
    if ('label' in data) {
      const explicit = (data as any).label as string | undefined;
      if (explicit !== undefined) {
        const trimmed = (explicit ?? '').trim();
        return trimmed; // may be empty string
      }
    }

    switch (type) {
      case 'link':
        const linkData = data as LinkData;
        try {
          const normalized = this.normalizeUrl(linkData.url);
          return new URL(normalized).hostname;
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
      case 'paypal':
        const paypalData = data as PayPalData;
        return `PayPal: ${paypalData.paypalme}`;
      case 'wise':
        const wiseData = data as WiseData;
        // Use wiseTag or fallback to email
        const wiseLabel = wiseData.wiseTag || wiseData.email || '';
        return `Wise: ${wiseLabel.replace(/^@/, '')}`;
      case 'bitcoin':
        const bitcoinData = data as BitcoinData;
        return `Bitcoin: ${bitcoinData.address.substring(0, 20)}...`;
      default:
        return 'QR Code';
    }
  }
}
