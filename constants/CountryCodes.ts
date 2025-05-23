export interface CountryCode {
    name: string;
    code: string;
    dialCode: string;
    flag: string;
  }
  
  export const COUNTRY_CODES: CountryCode[] = [
    { name: 'United States', code: 'US', dialCode: '1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: 'GB', dialCode: '44', flag: '🇬🇧' },
    { name: 'Canada', code: 'CA', dialCode: '1', flag: '🇨🇦' },
    { name: 'Australia', code: 'AU', dialCode: '61', flag: '🇦🇺' },
    { name: 'Germany', code: 'DE', dialCode: '49', flag: '🇩🇪' },
    { name: 'France', code: 'FR', dialCode: '33', flag: '🇫🇷' },
    { name: 'India', code: 'IN', dialCode: '91', flag: '🇮🇳' },
    { name: 'China', code: 'CN', dialCode: '86', flag: '🇨🇳' },
    { name: 'Japan', code: 'JP', dialCode: '81', flag: '🇯🇵' },
    { name: 'Brazil', code: 'BR', dialCode: '55', flag: '🇧🇷' },
    { name: 'Russia', code: 'RU', dialCode: '7', flag: '🇷🇺' },
    { name: 'Mexico', code: 'MX', dialCode: '52', flag: '🇲🇽' },
    { name: 'Spain', code: 'ES', dialCode: '34', flag: '🇪🇸' },
    { name: 'Italy', code: 'IT', dialCode: '39', flag: '🇮🇹' },
    { name: 'South Korea', code: 'KR', dialCode: '82', flag: '🇰🇷' },
    { name: 'Netherlands', code: 'NL', dialCode: '31', flag: '🇳🇱' },
    { name: 'Sweden', code: 'SE', dialCode: '46', flag: '🇸🇪' },
    { name: 'Switzerland', code: 'CH', dialCode: '41', flag: '🇨🇭' },
    { name: 'South Africa', code: 'ZA', dialCode: '27', flag: '🇿🇦' },
    { name: 'Singapore', code: 'SG', dialCode: '65', flag: '🇸🇬' },
    { name: 'New Zealand', code: 'NZ', dialCode: '64', flag: '🇳🇿' },
  ];
  
  export const findCountryByDialCode = (dialCode: string): CountryCode | undefined => {
    return COUNTRY_CODES.find((country) => country.dialCode === dialCode);
  };
  
  export const findCountryByCode = (code: string): CountryCode | undefined => {
    return COUNTRY_CODES.find((country) => country.code === code);
  };
  
  export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0];