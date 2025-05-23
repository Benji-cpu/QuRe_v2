export const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  export const ensureHttps = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };
  
  export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9]{6,15}$/;
    return phoneRegex.test(phone);
  };
  
  export const extractDomainFromUrl = (url: string): string => {
    try {
      const parsedUrl = new URL(ensureHttps(url));
      return parsedUrl.hostname.replace(/^www\./, '');
    } catch (err) {
      return url;
    }
  };