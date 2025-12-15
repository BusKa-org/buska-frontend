import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const hasToken = await authService.isAuthenticated();

      if (hasToken) {
        // Sempre buscar dados atualizados do servidor usando /user/me
        try {
          const fullUserData = await userService.getCurrentUser();
          // Atualizar o storage com os dados completos
          await authService.updateStoredUser(fullUserData);
          setUser(fullUserData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data from server:', error);
          // Se falhar, tentar usar dados do storage como fallback
          const storedUser = await authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
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
      
      // Buscar dados completos do usuário usando /user/me
      try {
        const fullUserData = await userService.getCurrentUser();
        // Atualizar o storage com os dados completos
        await authService.updateStoredUser(fullUserData);
        setUser(fullUserData);
        setIsAuthenticated(true);
        return { success: true, user: fullUserData };
      } catch (error) {
        console.error('Error fetching full user data after login:', error);
        // Se falhar, usar dados do login como fallback
        setUser(loggedInUser);
        setIsAuthenticated(true);
        return { success: true, user: loggedInUser };
      }
    } catch (error) {
      // Extract error message from the error object
      // authService.handleError returns { message, status, data }
      const errorMessage = error?.message || error?.error || 'Login failed. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      // Extract error message from the error object
      // authService.handleError returns { message, status, data }
      const errorMessage = error?.message || error?.error || 'Registration failed. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Iniciando logout...');
      console.log('AuthContext: Estado antes - user:', user, 'isAuthenticated:', isAuthenticated);
      
      await authService.logout();
      
      console.log('AuthContext: Storage limpo, atualizando estado...');
      setUser(null);
      setIsAuthenticated(false);
      
      // Forçar um pequeno delay para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('AuthContext: Estado atualizado, isAuthenticated = false');
      console.log('AuthContext: Estado depois - user:', null, 'isAuthenticated:', false);
    } catch (error) {
      console.error('Error during logout:', error);
      // Mesmo em caso de erro, limpar o estado local
      setUser(null);
      setIsAuthenticated(false);
      console.log('AuthContext: Estado limpo após erro');
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

  console.log('AuthContext Provider render:', { isAuthenticated, loading, userId: user?.id });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

