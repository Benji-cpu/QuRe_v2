// app.config.ts
export default {
  name: "QuRe",
  slug: "QuRe",
  owner: "benji000",
  version: "1.0.5",
  runtimeVersion: "1.0.4",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "qure",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.qure.app",
    buildNumber: "11"
  },
  
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.anonymous.QuRe",
    versionCode: 11,
    missingDimensionStrategy: {
      store: "play"
    },
    permissions: ["SET_WALLPAPER"]
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
        "backgroundColor": "#ffffff"
      }
    ],
    [
      "react-native-iap",
      {
        "paymentProvider": "Play Store"
      }
    ]
  ],
  
  experiments: {
    typedRoutes: true
  },
  
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "382a05a5-832d-4999-980f-2d14a15d4111"
    }
  },
  
  updates: {
    url: "https://u.expo.dev/382a05a5-832d-4999-980f-2d14a15d4111"
  }
};