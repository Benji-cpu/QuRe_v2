module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo|@expo-google-fonts|expo-.*|react-native-.*|@unimodules/.*|unimodules|sentry-expo|native-base)',
  ],
};

