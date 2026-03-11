// API Configuration
// Update these values according to your backend setup

// Detect environment - works for both React Native and Web
const isDevelopment = process.env.NODE_ENV !== 'production';

const API_CONFIG = {
  // Development - adjust port if your Flask backend runs on a different port
  DEVELOPMENT: 'http://localhost:5000',
  
  // Production - update with your production API URL
  PRODUCTION: 'https://your-production-api.com',
  
  // Use this to switch between environments
  ENV: isDevelopment ? 'development' : 'production',
};

export const API_BASE_URL = 
  API_CONFIG.ENV === 'production' 
    ? API_CONFIG.PRODUCTION 
    : API_CONFIG.DEVELOPMENT;

export default API_CONFIG;

