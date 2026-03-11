// API Configuration
// Update these values according to your backend setup

import Config from "react-native-config";
import { Platform } from 'react-native';

// __DEV__ is a global constant in React Native that is 
// true during development and false in release builds.
const isDevelopment = __DEV__;
const isWeb = Platform.OS === 'web';

// Na Web, o Config vira um objeto vazio, por isso o undefined.
// Usamos o process.env (padrão Web) ou uma string fixa como fallback.
const envUrl = isWeb ? process.env.API_URL : Config.API_URL;
const DEFAULT_API_URL = 'http://localhost:5000';
export const API_BASE_URL = (envUrl && envUrl !== 'undefined') ? envUrl : DEFAULT_API_URL;


console.log(`[${Platform.OS.toUpperCase()}] API URL:`, API_BASE_URL);

const API_CONFIG = {
  ENV: isDevelopment ? 'development' : 'production',
  BASE_URL: API_BASE_URL,
};

export default API_CONFIG;
