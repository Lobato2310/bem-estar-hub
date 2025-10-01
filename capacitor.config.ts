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
      splashImmersive: true,
      useDialog: true
    },
    App: {
      scheme: 'myfitlife',
      hostname: 'myfitlife.lovable.app'
    },
    StatusBar: {
      backgroundColor: "#ffffff",
      style: "DARK"
    },
    Permissions: {
      // Definir permissões específicas que o app solicita
      permissions: [
        'camera',
        'storage'
      ]
    }
  },
  ios: {
    scheme: 'MyFitLife',
    path: 'ios',
    buildOptions: {
      releaseScheme: 'MyFitLife',
      developmentTeam: 'N7379U738N' // Substituir pelo Team ID real
    },
    // Configurações específicas para App Store
    contentInset: 'automatic',
    allowsLinkPreview: false,
    handleApplicationURL: true
  },
  android: {
    path: 'android',
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'myfitlife-key',
      releaseType: 'AAB' // Android App Bundle
    },
    // Configurações específicas para Google Play
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;