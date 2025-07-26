// services/WallpaperService.ts
import { Platform } from 'react-native';

export async function setLockScreenWallpaper(uri: string): Promise<boolean> {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    try {
      const Wallpapers = require('rn-wallpapers') as typeof import('rn-wallpapers');
      const { setWallpaper, TYPE_SCREEN } = Wallpapers;

      await setWallpaper({ uri }, TYPE_SCREEN.LOCK);
      return true;
    } catch (error) {
      console.error('[WallpaperService] Failed to set lock-screen wallpaper', error);
      return false;
    }
  }

  return false;
}