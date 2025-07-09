import { Platform } from 'react-native';

/*
 * Wrapper around the `rn-wallpapers` native module so the rest of the codebase
 * does not need to interact with the library directly. If the platform does
 * not support programmatic wallpaper updates we simply resolve with `false` so
 * the caller can gracefully fall back to the old, manual instructions flow.
 */
export async function setLockScreenWallpaper(uri: string): Promise<boolean> {
  // Dynamically import to avoid issues on platforms where the native module is
  // not present (e.g. Expo Go on iOS).
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    try {
      // `rn-wallpapers` uses ES module export style so we have to import like
      // this rather than a static import at the top of the file.  The dynamic
      // import also means the JavaScript bundle for platforms that do not have
      // the native module will not try to require it and therefore will not
      // crash.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Wallpapers = require('rn-wallpapers') as typeof import('rn-wallpapers');
      const { setWallpaper, TYPE_SCREEN } = Wallpapers;

      // The library expects a remote or local URI and the screen type we want
      // to update. We only target the lock-screen.
      await setWallpaper({ uri }, TYPE_SCREEN.LOCK);
      return true;
    } catch (error) {
      console.error('[WallpaperService] Failed to set lock-screen wallpaper', error);
      return false;
    }
  }

  // Unsupported platform (e.g. web).  Caller should display manual instructions.
  return false;
} 