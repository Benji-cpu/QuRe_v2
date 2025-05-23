import { LinkQRCode, QRCodeType } from '../../types/qr-code';
import { createDefaultQRCode, generateUniqueId } from '../../utils/qrUtils';
import { ensureHttps, extractDomainFromUrl } from '../../utils/validators';

export interface LinkQRInput {
  url: string;
  label?: string;
}

export const createLinkQR = (input: LinkQRInput): LinkQRCode => {
  const { url, label } = input;
  
  const formattedUrl = ensureHttps(url);
  const defaultLabel = extractDomainFromUrl(formattedUrl);
  
  return {
    ...(createDefaultQRCode(QRCodeType.LINK) as Partial<LinkQRCode>),
    id: generateUniqueId(),
    type: QRCodeType.LINK,
    url: formattedUrl,
    label: label || defaultLabel,
  } as LinkQRCode;
};