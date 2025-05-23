export const Colors = {
    primary: '#6A5AE0',
    secondary: '#FF9900',
    background: '#F8F9FA',
    backgroundDark: '#1A1A1A',
    card: '#FFFFFF',
    cardDark: '#2A2A2A',
    text: '#333333',
    textDark: '#FFFFFF',
    border: '#E0E0E0',
    borderDark: '#444444',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    inactive: '#CDCDCD',
    inactiveDark: '#555555',
  };
  
  export const QRColors = {
    presets: [
      '#000000', // Black
      '#6A5AE0', // Primary
      '#FF9900', // Secondary
      '#FF3B30', // Red
      '#34C759', // Green
      '#007AFF', // Blue
      '#5856D6', // Purple
      '#FF2D55', // Pink
    ],
    backgroundPresets: [
      '#FFFFFF', // White
      '#F8F9FA', // Light Gray
      '#FFE5CC', // Light Orange
      '#E5FFCC', // Light Green
      '#CCE5FF', // Light Blue
      '#FFCCE5', // Light Pink
      '#E5CCFF', // Light Purple
      '#FFCCCC', // Light Red
    ],
    gradientPresets: [
      { start: '#6A5AE0', end: '#9747FF' }, // Purple gradient
      { start: '#FF9900', end: '#FF5C00' }, // Orange gradient
      { start: '#007AFF', end: '#00C2FF' }, // Blue gradient
      { start: '#34C759', end: '#00FF91' }, // Green gradient
      { start: '#FF3B30', end: '#FF6B5C' }, // Red gradient
      { start: '#5856D6', end: '#C644FC' }, // Violet gradient
      { start: '#FF2D55', end: '#FF7790' }, // Pink gradient
      { start: '#000000', end: '#666666' }, // Gray gradient
    ],
  };
  
  export const getColorForMode = (
    lightColor: string,
    darkColor: string,
    colorMode: 'light' | 'dark'
  ) => {
    return colorMode === 'light' ? lightColor : darkColor;
  };