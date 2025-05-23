export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface ErrorCorrectionInfo {
  level: ErrorCorrectionLevel;
  label: string;
  description: string;
  recoveryCapability: string;
}

export const ERROR_CORRECTION_LEVELS: ErrorCorrectionInfo[] = [
  {
    level: 'L',
    label: 'Low',
    description: 'Low error correction',
    recoveryCapability: 'Can recover up to 7% of data',
  },
  {
    level: 'M',
    label: 'Medium',
    description: 'Medium error correction',
    recoveryCapability: 'Can recover up to 15% of data',
  },
  {
    level: 'Q',
    label: 'Quality',
    description: 'High error correction',
    recoveryCapability: 'Can recover up to 25% of data',
  },
  {
    level: 'H',
    label: 'High',
    description: 'Very high error correction',
    recoveryCapability: 'Can recover up to 30% of data',
  },
];

export const DEFAULT_ERROR_CORRECTION: ErrorCorrectionLevel = 'M';