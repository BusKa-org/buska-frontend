// API Configuration
// Update these values according to your backend setup

import Config from "react-native-config";

// __DEV__ is a global constant in React Native that is 
// true during development and false in release builds.
const isDevelopment = __DEV__;

export const API_BASE_URL = Config.API_URL;

const API_CONFIG = {
  ENV: isDevelopment ? 'development' : 'production',
  BASE_URL: API_BASE_URL,
};

export default API_CONFIG;