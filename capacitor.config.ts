import { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.NODE_ENV !== 'production';

const config: CapacitorConfig = {
  appId: 'com.lobato.myfitlife',
  appName: 'MyFitLife',
  webDir: 'dist',
  bundledWebRuntime: false,
  ...(isDev && {
    server: {
      url: 'https://5bbadde6-f01e-4a77-92ad-cfd2520ff0cb.lovableproject.com?forceHideBadge=true',
      cleartext: true
    }
  }),
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    App: {
      scheme: 'myfitlife',
      hostname: 'myfitlife.lovable.app'
    },
    StatusBar: {
      backgroundColor: "#ffffff",
      style: "DARK"
    }
  },
  ios: {
    scheme: 'MyFitLife',
    path: 'ios',
    buildOptions: {
      releaseScheme: 'MyFitLife',
      developmentTeam: 'YOUR_TEAM_ID' // Substituir pelo Team ID real
    }
  },
  android: {
    path: 'android',
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'myfitlife-key',
      releaseType: 'AAB' // Android App Bundle
    }
  }
};

export default config;