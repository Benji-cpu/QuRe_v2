export default {
  name: "QuRe",
  slug: "QuRe",
  owner: "benji000", 
  version: "1.0.4",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "qure",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  runtimeVersion: "1.0.4",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.qure.app",
    buildNumber: "6"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true,
    package: "com.qure.app",
    versionCode: 6
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#2196f3"
      }
    ],
    [
      "react-native-iap",
      {
        "paymentProvider": "Play Store"
      }
    ],
    [
      "expo-updates",
      {
        "username": "benji000"
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {},
    eas: {
      projectId: "3bb00633-0ef4-4ac5-918a-be69c0027772"
    }
  },
  updates: {
    url: "https://u.expo.dev/3bb00633-0ef4-4ac5-918a-be69c0027772"
  }
};