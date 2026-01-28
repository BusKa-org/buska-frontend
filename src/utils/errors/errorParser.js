/**
 * Error Parser
 * Parses API errors and converts them to AppError instances
 */

import {
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ServerError,
  ErrorCode,
  ErrorCategory,
} from './errorTypes';
import {
  getErrorMessage,
  getHttpStatusMessage,
  errorMessages,
} from './errorMessages';

/**
 * Known backend error messages mapping
 * Maps backend error strings to error codes
 */
const backendErrorMap = {
  // Portuguese messages from Flask backend
  'credenciais inválidas': ErrorCode.INVALID_CREDENTIALS,
  'email ou senha incorretos': ErrorCode.INVALID_CREDENTIALS,
  'invalid credentials': ErrorCode.INVALID_CREDENTIALS,
  'e-mail já cadastrado': ErrorCode.EMAIL_ALREADY_EXISTS,
  'email already exists': ErrorCode.EMAIL_ALREADY_EXISTS,
  'email já existe': ErrorCode.EMAIL_ALREADY_EXISTS,
  'cpf já cadastrado': ErrorCode.CPF_ALREADY_EXISTS,
  'cpf already exists': ErrorCode.CPF_ALREADY_EXISTS,
  'usuário não encontrado': ErrorCode.USER_NOT_FOUND,
  'user not found': ErrorCode.USER_NOT_FOUND,
  'rota não encontrada': ErrorCode.ROUTE_NOT_FOUND,
  'route not found': ErrorCode.ROUTE_NOT_FOUND,
  'viagem não encontrada': ErrorCode.TRIP_NOT_FOUND,
  'trip not found': ErrorCode.TRIP_NOT_FOUND,
  'token expirado': ErrorCode.TOKEN_EXPIRED,
  'token expired': ErrorCode.TOKEN_EXPIRED,
  'token inválido': ErrorCode.TOKEN_INVALID,
  'invalid token': ErrorCode.TOKEN_INVALID,
  'acesso negado': ErrorCode.FORBIDDEN,
  'access denied': ErrorCode.FORBIDDEN,
  'permissão negada': ErrorCode.FORBIDDEN,
  'já inscrito': ErrorCode.ALREADY_SUBSCRIBED,
  'already subscribed': ErrorCode.ALREADY_SUBSCRIBED,
  'viagem já iniciada': ErrorCode.TRIP_ALREADY_STARTED,
  'viagem já finalizada': ErrorCode.TRIP_ALREADY_FINISHED,
  'senha incorreta': ErrorCode.INVALID_CREDENTIALS,
  'senha atual incorreta': ErrorCode.INVALID_CREDENTIALS,
};

/**
 * Parse backend error message to error code
 */
function parseBackendMessage(message) {
  if (!message) return null;
  
  const lowerMessage = message.toLowerCase().trim();
  
  for (const [pattern, code] of Object.entries(backendErrorMap)) {
    if (lowerMessage.includes(pattern)) {
      return code;
    }
  }
  
  return null;
}

/**
 * Extract error details from various API response formats
 */
function extractErrorDetails(responseData) {
  if (!responseData) return { message: null, field: null, details: null };
  
  // Handle different response formats
  const message = 
    responseData.message ||
    responseData.error ||
    responseData.msg ||
    responseData.detail ||
    (typeof responseData === 'string' ? responseData : null);
  
  const field = responseData.field || responseData.loc?.[0] || null;
  
  const details = 
    responseData.errors ||
    responseData.details ||
    responseData.validation_errors ||
    null;
  
  return { message, field, details };
}

/**
 * Determine error category from HTTP status code
 */
function getCategoryFromStatus(status) {
  if (status === 401) return ErrorCategory.AUTHENTICATION;
  if (status === 403) return ErrorCategory.AUTHORIZATION;
  if (status === 404) return ErrorCategory.NOT_FOUND;
  if (status === 409) return ErrorCategory.CONFLICT;
  if (status === 400 || status === 422) return ErrorCategory.VALIDATION;
  if (status >= 500) return ErrorCategory.SERVER;
  if (status >= 400) return ErrorCategory.CLIENT;
  return ErrorCategory.UNKNOWN;
}

/**
 * Parse Axios error into AppError
 */
export function parseApiError(error) {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }
  
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new NetworkError('A requisição demorou muito. Tente novamente.');
    }
    if (error.message?.includes('Network Error') || !navigator?.onLine) {
      return new NetworkError('Sem conexão com a internet. Verifique sua rede.');
    }
    return new NetworkError('Não foi possível conectar ao servidor.');
  }
  
  const { status, data } = error.response;
  const { message: backendMessage, field, details } = extractErrorDetails(data);
  
  // Try to match backend message to known error code
  const matchedCode = parseBackendMessage(backendMessage);
  
  // Authentication errors (401)
  if (status === 401) {
    const code = matchedCode || ErrorCode.UNAUTHORIZED;
    const message = getErrorMessage(code);
    return new AuthenticationError(message, code);
  }
  
  // Authorization errors (403)
  if (status === 403) {
    return new AuthorizationError(
      backendMessage || 'Você não tem permissão para esta ação.'
    );
  }
  
  // Not found (404)
  if (status === 404) {
    return new NotFoundError(backendMessage || 'Recurso');
  }
  
  // Conflict (409)
  if (status === 409) {
    const code = matchedCode || ErrorCode.DUPLICATE_ENTRY;
    const message = matchedCode ? getErrorMessage(code) : (backendMessage || 'Este registro já existe.');
    return new ConflictError(message, code);
  }
  
  // Validation errors (400, 422)
  if (status === 400 || status === 422) {
    const code = matchedCode || ErrorCode.VALIDATION_ERROR;
    const message = matchedCode ? getErrorMessage(code) : (backendMessage || 'Dados inválidos.');
    return new ValidationError(message, field, details);
  }
  
  // Server errors (5xx)
  if (status >= 500) {
    return new ServerError(
      'O servidor está com problemas. Tente novamente em alguns minutos.',
      error
    );
  }
  
  // Generic client error
  const code = matchedCode || ErrorCode.UNKNOWN_ERROR;
  const message = matchedCode 
    ? getErrorMessage(code) 
    : (backendMessage || getHttpStatusMessage(status));
  
  return new AppError({
    message,
    code,
    category: getCategoryFromStatus(status),
    statusCode: status,
    field,
    details,
    originalError: error,
  });
}

/**
 * Parse any error into a user-friendly message
 */
export function getErrorMessageFromError(error) {
  if (error instanceof AppError) {
    return error.message;
  }
  
  const parsed = parseApiError(error);
  return parsed.message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
  if (error instanceof AppError) {
    return error.isRetryable;
  }
  
  // Network errors are retryable
  if (!error.response) {
    return true;
  }
  
  // Server errors are retryable
  if (error.response?.status >= 500) {
    return true;
  }
  
  // Rate limiting
  if (error.response?.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error) {
  if (error instanceof AuthenticationError) {
    return true;
  }
  
  if (error instanceof AppError) {
    return error.code === ErrorCode.TOKEN_EXPIRED ||
           error.code === ErrorCode.TOKEN_INVALID ||
           error.code === ErrorCode.SESSION_EXPIRED;
  }
  
  return error.response?.status === 401;
}
