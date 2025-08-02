// services/WallpaperService.ts
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export async function setLockScreenWallpaper(uri: string): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      // iOS doesn't support programmatically setting wallpapers
      // Save to photo library and share so user can set manually
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        // Also share it so user can easily set as wallpaper
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: 'public.image',
            mimeType: 'image/png',
          });
        }
        return true;
      }
      return false;
    } else if (Platform.OS === 'android') {
      // Android supports setting wallpapers programmatically
      try {
        const Wallpapers = require('rn-wallpapers') as typeof import('rn-wallpapers');
        const { setWallpaper, TYPE_SCREEN } = Wallpapers;
        await setWallpaper({ uri }, TYPE_SCREEN.LOCK);
        return true;
      } catch (error) {
        console.error('[WallpaperService] Failed to set Android wallpaper', error);
        return false;
      }
    }
  } catch (error) {
    console.error('[WallpaperService] Failed to save wallpaper', error);
    return false;
  }

  return false;
}