import {Platform} from 'react-native';

const isWeb = Platform.OS === 'web' || typeof document !== 'undefined';

/**
 * Sets a cookie with the given name, value, and options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options (days, path, etc.)
 */
export const setCookie = (name, value, options = {}) => {
  if (isWeb) {
    // For web, use cookies
    const {days = 30, path = '/'} = options;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const expiresString = expires.toUTCString();
    
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expiresString};path=${path}`;
  } else {
    // For mobile (React Native Web), use localStorage as fallback
    // For true native mobile, AsyncStorage would need to be installed separately
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`cookie_${name}`, value);
    }
  }
};

/**
 * Gets a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  if (isWeb) {
    // For web, read from cookies
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      }
    }
    
    return null;
  } else {
    // For mobile (React Native Web), use localStorage as fallback
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`cookie_${name}`);
    }
    return null;
  }
};

/**
 * Removes a cookie by name
 * @param {string} name - Cookie name
 * @param {Object} options - Cookie options (path)
 */
export const removeCookie = (name, options = {}) => {
  if (isWeb) {
    // For web, remove cookie
    const {path = '/'} = options;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path};`;
  } else {
    // For mobile (React Native Web), use localStorage as fallback
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`cookie_${name}`);
    }
  }
};

/**
 * Checks if user is authenticated (has access_token cookie)
 * @returns {boolean|Promise<boolean>} True if authenticated (sync for web, async for mobile)
 */
export const isAuthenticated = () => {
  if (isWeb) {
    // For web, return boolean synchronously
    return !!getCookie('access_token');
  } else {
    // For mobile (React Native Web), use localStorage as fallback
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('cookie_access_token');
    }
    return false;
  }
};

/**
 * Gets the current username from cookie (legacy support)
 * @returns {string|null} Username or null if not authenticated
 */
export const getUsername = () => {
  if (isWeb) {
    return getCookie('username');
  } else {
    // For mobile (React Native Web), use localStorage as fallback
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('cookie_username');
    }
    return null;
  }
};
