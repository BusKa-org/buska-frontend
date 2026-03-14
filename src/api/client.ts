/* eslint-disable prettier/prettier */
// src/api/client.ts
import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
  } from 'axios';
  import { Storage, STORAGE_KEYS } from '../utils/storage';
  import { API_BASE_URL } from '../config/api';
  import {
    parseApiError,
    requiresReauth,
    errorLogger,
  } from '../utils/errors';

// Create axios instance with /v1 prefix
export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

async function attachAuthToken(
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> {
    const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}

function logRequest(config: AxiosRequestConfig): void {
    errorLogger.debug("API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    });
  }

function logResponse(url: string | undefined, status: number): void {
    errorLogger.debug("API Response:", {
        status,
        url,
    });
}

async function clearAuthStorage(): Promise<void> {
    await Promise.all([
      Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      Storage.removeItem(STORAGE_KEYS.USER),
    ]);
}

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const configWithAuthToken = await attachAuthToken(config);

    // Log request in development
    logRequest(configWithAuthToken);

    return config;
  },
  (error: unknown) => {
    errorLogger.error(error, { context: 'Request interceptor' });
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    logResponse(response.config?.url, response.status);
    return response;
  },
  async (error: unknown) => {
    // Parse the error
    const parsedError = parseApiError(error);

    const axiosError = axios.isAxiosError(error) ? error : undefined;

    // Log the error
    errorLogger.apiError(parsedError, {
      method: axiosError?.config?.method,
      url: axiosError?.config?.url,
    });

    // Handle authentication errors
    if (requiresReauth(parsedError)) {
      await clearAuthStorage();
    }

    // Reject with the parsed error for consistent handling
    return Promise.reject(parsedError);
  }
);