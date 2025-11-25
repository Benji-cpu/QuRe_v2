import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  spacing: {
    screenPadding: 20,
    headerPadding: 16,
    sectionSpacing: 24,
    itemSpacing: 12,
    small: 8,
    xsmall: 4,
  },
  typography: {
    header: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      lineHeight: 28,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      lineHeight: 34,
    },
    section: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      lineHeight: 28,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
  },
};

