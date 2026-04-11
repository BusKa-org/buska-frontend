// API Configuration
// Update these values according to your backend setup

import Config from 'react-native-config';
import { Platform } from 'react-native';

// __DEV__ is a global constant in React Native that is 
// true during development and false in release builds.
const isDevelopment = __DEV__;
const isWeb = Platform.OS === 'web';

// On web, react-native-config returns an empty object, so we fall back to
// process.env (injected by webpack) or a hardcoded local default.
const DEFAULT_API_URL = 'http://localhost:5000';
const envUrl = isWeb ? process.env.API_URL : Config.API_URL;
const apiBaseUrl = envUrl && envUrl !== 'undefined' ? envUrl : DEFAULT_API_URL;

console.log(`[${Platform.OS.toUpperCase()}] API URL:`, apiBaseUrl);

interface ApiConfig {
  env: 'development' | 'production';
  baseUrl: string;
}

const apiConfig: ApiConfig = {
  env: isDevelopment ? 'development' : 'production',
  baseUrl: apiBaseUrl,
};

export default apiConfig;