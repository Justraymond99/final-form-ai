import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.97e01a4005924d06bc0df350295addf5',
  appName: 'Final Form',
  webDir: 'dist',
  server: {
    url: "https://97e01a40-0592-4d06-bc0d-f350295addf5.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
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
    scheme: "Final Form",
    // Privacy descriptions for iOS permissions (required by Apple)
    // These go in Info.plist - add via Xcode or native config
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0a0a0f",
  },
};

export default config;
