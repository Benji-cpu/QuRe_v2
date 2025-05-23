import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';
const COLOR_SCHEME_KEY = 'qure_color_scheme';

export function useColorScheme(): ColorScheme {
  const systemColorScheme = useNativeColorScheme() as ColorScheme;
  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(null);

  useEffect(() => {
    const loadColorScheme = async () => {
      try {
        const savedColorScheme = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
        if (savedColorScheme === 'light' || savedColorScheme === 'dark') {
          setColorScheme(savedColorScheme);
        } else {
          setColorScheme(systemColorScheme || 'light');
        }
      } catch (error) {
        console.error('Error loading color scheme:', error);
        setColorScheme(systemColorScheme || 'light');
      }
    };

    loadColorScheme();
  }, [systemColorScheme]);

  // Default to light if not yet loaded
  return colorScheme || 'light';
}

export async function setColorScheme(colorScheme: ColorScheme): Promise<void> {
  try {
    await AsyncStorage.setItem(COLOR_SCHEME_KEY, colorScheme);
  } catch (error) {
    console.error('Error saving color scheme:', error);
  }
}