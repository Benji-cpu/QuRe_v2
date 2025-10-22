declare module 'expo-clipboard' {
  export const getStringAsync: () => Promise<string>;
  export const setStringAsync: (text: string) => Promise<void>;
  export const getImageAsync: () => Promise<{ data: string; mimeType: string } | null>;
  export const setImageAsync: (data: Uint8Array | ArrayBuffer | string, options?: { imageMimeType?: string }) => Promise<void>;
  export const hasStringAsync: () => Promise<boolean>;
  export const hasImageAsync: () => Promise<boolean>;
  export const addClipboardListener: (listener: () => void) => { remove: () => void };
  export const removeClipboardListener: (subscription: { remove: () => void }) => void;
}
