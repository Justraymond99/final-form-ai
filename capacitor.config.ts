import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.97e01a4005924d06bc0df350295addf5',
  appName: 'final-form-ai',
  webDir: 'dist',
  server: {
    url: "https://97e01a40-0592-4d06-bc0d-f350295addf5.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffffff',
      showSpinner: true,
      spinnerColor: '#999999',
    },
  },
};

export default config;