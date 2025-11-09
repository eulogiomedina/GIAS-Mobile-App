export default ({ config }) => ({
  ...config,
  expo: {
    name: "GIAS-Mobile-App",
    slug: "GIAS-Mobile-App",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "giasmobileapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.giasmobileapp"
    },

    android: {
      package: "com.giasmobileapp",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "giasmobileapp",
              host: "oauth2redirect",
              pathPrefix: "/google"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },

    web: {
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
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "expo-secure-store",
      "expo-font",
      "expo-web-browser"
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },

    // ✅ Extra — configuración para CI/CD en EAS
    extra: {
      API_URL: process.env.API_URL ?? "https://backendgias.onrender.com",
      APP_VARIANT: process.env.APP_VARIANT ?? "preview",
      FEATURE_GAMIFY: process.env.FEATURE_GAMIFY === "true",

      eas: {
        projectId: "d7957d37-7366-4421-8f09-f30878397842"
      }
    }
  }
});
