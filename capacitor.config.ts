import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finleybook.app',
  appName: 'FinleyBook',
  webDir: 'out',
  server: {
    url: 'https://finleybook.com',
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
