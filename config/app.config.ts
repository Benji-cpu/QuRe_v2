// app.config.ts

export default {
  name: "qure",
  slug: "qure",
  owner: "benji000",
  version: "1.0.4", // We will match this in package.json
  runtimeVersion: "1.0.4",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "qure",
  userInterfaceStyle: "automatic",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.qure.app", // Using this one consistently
    buildNumber: "6"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.qure.app", // Using this one consistently
    versionCode: 6 
  },
  plugins: [
    "expo-router",
  ],
  extra: {
    router: {
      origin: false
    },
    eas: {
      // The CORRECT, ORIGINAL project ID
      projectId: "382a05a5-832d-4999-980f-2d14a15d4111" 
    }
  },
  updates: {
    // The CORRECT URL with the ORIGINAL project ID
    url: "https://u.expo.dev/382a05a5-832d-4999-980f-2d14a15d4111"
  }
};