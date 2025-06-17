// app.config.ts

export default {
  name: "QuRe",
  slug: "QuRe",
  owner: "benji000",
  version: "1.0.4",
  runtimeVersion: "1.0.4",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "qure",
  userInterfaceStyle: "automatic",

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
    package: "com.qure.app",
    versionCode: 6
  },
  plugins: [
    "expo-router",
    [
      "react-native-iap",
      {
        android: {
          missingDimensionStrategy: ["store", "play"]
        }
      }
    ]
  ],
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