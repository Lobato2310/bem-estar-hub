import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lobato.myfitlife',
  appName: 'MyFitLife',
  webDir: 'dist',
  server: {
    url: 'https://5bbadde6-f01e-4a77-92ad-cfd2520ff0cb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    },
    App: {
      // Deep links configuration
      scheme: 'myfitlife',
      hostname: 'myfitlife.lovable.app'
    }
  },
  ios: {
    // iOS specific configuration
    scheme: 'MyFitLife',
    path: 'ios'
  },
  android: {
    // Android specific configuration
    path: 'android',
    // Allow mixed content for development
    allowMixedContent: true
  }
};

export default config;