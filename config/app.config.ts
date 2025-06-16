// app.config.js
export default {
    expo: {
      name: "QuRe",
      slug: "QuRe",
      version: "1.0.5",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "qure",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
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
        router: {},
        eas: {
          projectId: "382a05a5-832d-4999-980f-2d14a15d4111"
        }
      },
      runtimeVersion: "1.0.2",
      updates: {
        url: "https://u.expo.dev/382a05a5-832d-4999-980f-2d14a15d4111"
      }
    }
  };