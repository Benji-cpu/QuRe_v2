import { QR_TYPES } from '../../constants/QRTypes';
import { QRCodeType, QRCodeTypeData } from '../../types/QRCode';

type FormLikeData = Partial<Record<string, unknown>> | QRCodeTypeData;

/**
 * Determines whether the provided form data satisfies the required fields for the given QR code type.
 */
export function canGenerateQRCode(type: QRCodeType, data: FormLikeData | null | undefined): boolean {
  if (!data) {
    return false;
  }

  const typeConfig = QR_TYPES.find(config => config.type === type);
  if (!typeConfig) {
    return false;
  }

  return typeConfig.fields
    .filter(field => field.required)
    .every(field => {
      const rawValue = (data as Record<string, unknown>)[field.key];
      if (typeof rawValue === 'number') {
        return !Number.isNaN(rawValue);
      }
      if (rawValue === null || rawValue === undefined) {
        return false;
      }
      return String(rawValue).trim().length > 0;
    });
}

