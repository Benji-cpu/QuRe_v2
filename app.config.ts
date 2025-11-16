import { ConfigContext, ExpoConfig } from "@expo/config";

const resolveVariant = () => {
  const variant = process.env.APP_VARIANT ?? process.env.EXPO_PUBLIC_APP_VARIANT;
  if (!variant) {
    return "prod";
  }
  return variant.toLowerCase();
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = resolveVariant();
  const isDevVariant = variant === "dev" || process.env.EXPO_DEV_CLIENT === "true";

  const androidPackage = isDevVariant ? "com.anonymous.QuRe.dev" : "com.anonymous.QuRe";
  const iosBundleIdentifier = isDevVariant ? "com.qureapp.app.dev" : "com.qureapp.app";

  const androidConfig = {
    versionCode: 46,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: androidPackage,
    missingDimensionStrategy: {
      store: "play"
    },
    permissions: ["SET_WALLPAPER"]
  } as ExpoConfig["android"] & {
    missingDimensionStrategy: {
      store: string;
    };
  };

  return {
    name: isDevVariant ? "QuRe Dev" : "QuRe",
    slug: "QuRe",
    owner: "benji000",
    version: "1.0.5",
    runtimeVersion: "1.0.4",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "qure",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,

    ios: {
      supportsTablet: true,
      bundleIdentifier: iosBundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          "QuRe needs access to your photo library to save wallpapers and select custom backgrounds.",
        NSPhotoLibraryAddUsageDescription:
          "QuRe needs permission to save generated wallpapers to your photo library."
      },
      buildNumber: "46"
    },

    android: androidConfig,

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
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "react-native-iap",
        {
          paymentProvider: "both"
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
      },
      appVariant: variant
    },

    updates: {
      url: "https://u.expo.dev/382a05a5-832d-4999-980f-2d14a15d4111"
    }
  };
};
