declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.json';

declare module 'react-native-config' {
  interface NativeConfig {
    API_URL: string;
  }

  export const Config: NativeConfig;
  export default Config;
}

// Webpack-injected env vars (web only)
declare namespace NodeJS {
  interface ProcessEnv {
    API_URL?: string;
  }
}
