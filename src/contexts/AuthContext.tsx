import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { parseApiError, requiresReauth, errorLogger } from '../utils/errors';
import { ErrorCode } from '../utils/errors/errorTypes';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useToast } from '../components/Toast';
import type { 
  AlunoResponse,
  AlunoSelfSignupRequest,
  LoginRequest,
  TokenResponse,
  UserInfo,
  UserResponse,
} from '../types';

type LoginSuccessResult = {
  success: true;
  user: AuthUser;
};

type LoginErrorResult = {
  success: false;
  error: string;
  errorCode?: string;
  errorCategory?: string;
};

type LoginResult = LoginSuccessResult | LoginErrorResult;

type RegisterSuccessResult<TData = unknown> = {
  success: true;
  data: TData;
};

type RegisterErrorResult = {
  success: false;
  error: string;
  errorCode?: string;
  errorCategory?: string;
  field?: string;
  fieldErrors: Record<string, string>;
};

type RegisterResult<TData = unknown> =
  | RegisterSuccessResult<TData>
  | RegisterErrorResult;


type AuthContextValue = {
  user: UserResponse | UserInfo | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (loginData: LoginRequest) => Promise<TokenResponse>;
  register: (userData: AlunoSelfSignupRequest) => Promise<AlunoResponse>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<UserResponse | UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const toast = useToast();

  const handleForegroundMessage = useCallback(({ title, body }) => {
    toast.info(`${title}${body ? `\n${body}` : ''}`, 5000);
  }, [toast]);

  usePushNotifications(isAuthenticated, handleForegroundMessage);

  const checkAuthStatus = useCallback(async (): Promise<void> => {
    try {
      const hasToken = await authService.isAuthenticated();

      if (!hasToken) {
        return;
      }

      try {
        const fullUserData = await userService.getCurrentUser();
        setUser(fullUserData);
        setIsAuthenticated(true);
      } catch (error: unknown) {
        const parsedError = parseApiError(error);

        if (requiresReauth(parsedError)) {
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error: unknown) {
      errorLogger.error(error, { context: 'checkAuthStatus' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(
    async (loginData: LoginRequest): Promise<LoginResult> => {
      try {
        const { user: loggedInUser } = await authService.login(loginData);

        try {
          const fullUserData = await userService.getCurrentUser();
          await authService.updateStoredUser(fullUserData);
          setUser(fullUserData);
          setIsAuthenticated(true);

          return {
            success: true,
            user: fullUserData,
          };
        } catch {
          if (loggedInUser) {
            setUser(loggedInUser);
            setIsAuthenticated(true);

            return {
              success: true,
              user: loggedInUser,
            };
          }
          return {
            success: false,
            error: 'Failed to get user data',
          };
        }
      } catch (error: unknown) {
        const parsedError = parseApiError(error);
        errorLogger.userError('login', parsedError, { email: loginData.email });

        const message =
          parsedError.code === ErrorCode.UNAUTHORIZED
            ? 'E-mail ou senha incorretos.'
            : parsedError.message;

        return {
          success: false,
          error: message,
          errorCode: parsedError.code,
          errorCategory: parsedError.category,
        };
      }
    },
    [],
  );

  const register = useCallback(
    async (userData: AlunoSelfSignupRequest): Promise<RegisterResult> => {
      try {
        const response = await authService.register(userData);
        errorLogger.info('Registration successful', { email: userData.email });

        return {
          success: true,
          data: response,
        };
      } catch (error: unknown) {
        const parsedError = parseApiError(error);
        errorLogger.userError('register', parsedError, {
          email: userData.email,
        });

        return {
          success: false,
          error: parsedError.message,
          errorCode: parsedError.code,
          errorCategory: parsedError.category,
          field: parsedError.field,
          fieldErrors: parsedError.details ?? {},
        };
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      errorLogger.info('Logout initiated', { userId: user?.id });
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      });

      errorLogger.info('Logout completed');
    } catch (error: unknown) {
      errorLogger.error(error, { context: 'logout' });
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      checkAuthStatus,
    }),
    [user, loading, isAuthenticated, login, register, logout, checkAuthStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
