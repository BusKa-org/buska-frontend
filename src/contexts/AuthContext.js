import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const hasToken = await authService.isAuthenticated();

      if (hasToken) {
        try {
          const fullUserData = await userService.getCurrentUser();
          await authService.updateStoredUser(fullUserData);
          setUser(fullUserData);
          setIsAuthenticated(true);
        } catch (error) {
          console.warn('Failed to restore auth:', error?.message);
          
          // If auth error (401), clear tokens
          if (error?.statusCode === 401 || error?.code === 'UNAUTHORIZED') {
            await authService.logout();
          } else {
            // Try using stored user as fallback
            const storedUser = await authService.getCurrentUser();
            if (storedUser) {
              setUser(storedUser);
              setIsAuthenticated(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
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
      console.error('Login error:', error);
      
      return {
        success: false,
        error: error?.message || 'Erro ao fazer login. Tente novamente.',
        errorCode: error?.code,
        errorCategory: error?.category,
        field: error?.field,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      
      return {
        success: false,
        error: error?.message || 'Erro ao criar conta. Tente novamente.',
        errorCode: error?.code,
        errorCategory: error?.category,
        field: error?.field,
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Logout error:', error);
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
