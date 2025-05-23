import { QRCodeType, VCardQRCode } from '../../types/qr-code';
import { createDefaultQRCode, generateUniqueId } from '../../utils/qrUtils';

export interface VCardQRInput {
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
  label?: string;
}

export const createVCardQR = (input: VCardQRInput): VCardQRCode => {
  const {
    firstName,
    lastName,
    phoneNumber,
    mobileNumber,
    email,
    website,
    company,
    jobTitle,
    fax,
    address,
    city,
    postCode,
    country,
    label,
  } = input;
  
  const fullName = `${firstName} ${lastName}`;
  
  return {
    ...(createDefaultQRCode(QRCodeType.VCARD) as Partial<VCardQRCode>),
    id: generateUniqueId(),
    type: QRCodeType.VCARD,
    firstName,
    lastName,
    phoneNumber,
    mobileNumber,
    email,
    website,
    company,
    jobTitle,
    fax,
    address,
    city,
    postCode,
    country,
    label: label || fullName,
  } as VCardQRCode;
};