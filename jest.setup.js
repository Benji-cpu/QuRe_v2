// Mock timers
// jest.useFakeTimers();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock the native modules
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock the expo modules
jest.mock('expo-font');
jest.mock('expo-splash-screen');
jest.mock('expo-status-bar');
jest.mock('expo-constants');
jest.mock('expo-linking');
jest.mock('expo-router');

// Mock the react-native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock the react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock the react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }) => (
      <View style={style}>{children}</View>
    ),
  };
});

// Mock for react-native-qrcode-svg
jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native');
  return function MockQRCode(props) {
    return <View testID="qrcode-svg" {...props} />;
  };
});

// Silence warning from react-native-gesture-handler
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock console methods
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress specific expected warnings
  if (
    args[0].includes('Warning:') &&
    (args[0].includes('React.createElement') ||
      args[0].includes('React does not recognize the') ||
      args[0].includes('The tag'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

global.window = {};