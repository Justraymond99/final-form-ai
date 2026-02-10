import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finalform.app',
  appName: 'Final Form',
  webDir: 'dist',
  // NOTE: For local development, uncomment the server block below.
  // It MUST remain commented out for production/App Store builds.
  // server: {
  //   url: "https://97e01a40-0592-4d06-bc0d-f350295addf5.lovableproject.com?forceHideBadge=true",
  //   cleartext: true,
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#f36d33",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0a0a0f",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "FinalForm",
    // Privacy descriptions for iOS permissions are in Info.plist.
    // See ios/App/App/Info.plist.template for required keys.
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0a0a0f",
  },
};

export default config;
