import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 20,
    round: 999,
  },
  qrCode: {
    previewSize: width * 0.6,
    cardSize: width * 0.8,
    miniSize: width * 0.15,
  },
  form: {
    inputHeight: 48,
    buttonHeight: 50,
  },
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  modalWidth: width * 0.9,
};