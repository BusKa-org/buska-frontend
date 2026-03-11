import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { parseApiError, requiresReauth, errorLogger } from '../utils/errors';
import { ErrorCode } from '../utils/errors/errorTypes';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useToast } from '../components/Toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toast = useToast();

  const handleForegroundMessage = useCallback(({ title, body }) => {
    toast.info(`${title}${body ? `\n${body}` : ''}`, 5000);
  }, [toast]);

  usePushNotifications(isAuthenticated, handleForegroundMessage);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const hasToken = await authService.isAuthenticated();
  
      if (hasToken) {
        try {
          const fullUserData = await userService.getCurrentUser();
          setUser(fullUserData);
          setIsAuthenticated(true);
        } catch (error) {
          const parsedError = parseApiError(error);
          if (requiresReauth(parsedError)) {
            await authService.logout();
          }
        }
      }
    } catch (error) {
      errorLogger.error(error, { context: 'checkAuthStatus' });
    } finally {
      setLoading(false); 
    }
  };

  const login = async (email, password) => {
    try {
      const { user: loggedInUser } = await authService.login(email, password);
      
      // Try to get complete user data
      try {
        const fullUserData = await userService.getCurrentUser();
        await authService.updateStoredUser(fullUserData);
        setUser(fullUserData);
        setIsAuthenticated(true);
        return { success: true, user: fullUserData };
      } catch (error) {
        // Use login data as fallback
        setUser(loggedInUser);
        setIsAuthenticated(true);
        return { success: true, user: loggedInUser };
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      errorLogger.userError('login', parsedError, { email });

      // On the login screen a 401 always means wrong credentials, not "not logged in"
      const message = parsedError.code === ErrorCode.UNAUTHORIZED
        ? 'E-mail ou senha incorretos.'
        : parsedError.message;

      return {
        success: false,
        error: message,
        errorCode: parsedError.code,
        errorCategory: parsedError.category,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      errorLogger.info('Registration successful', { email: userData.email });
      return { success: true, data: response };
    } catch (error) {
      const parsedError = parseApiError(error);
      errorLogger.userError('register', parsedError, { email: userData.email });
      
      return {
        success: false,
        error: parsedError.message,
        errorCode: parsedError.code,
        errorCategory: parsedError.category,
        field: parsedError.field,
        fieldErrors: parsedError.fieldErrors || {},
      };
    }
  };

  const logout = async () => {
    try {
      errorLogger.info('Logout initiated', { userId: user?.id });
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      errorLogger.info('Logout completed');
    } catch (error) {
      errorLogger.error(error, { context: 'logout' });
      // Force clear state even on error
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  }), [user, loading, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
