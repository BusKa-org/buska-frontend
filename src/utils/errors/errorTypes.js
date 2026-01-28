/**
 * Application Error Types
 * Industry-standard error classification
 */

// Error Categories
export const ErrorCategory = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN',
};

// Error Codes - Backend specific
export const ErrorCode = {
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  NO_INTERNET: 'NO_INTERNET',
  
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_CPF: 'INVALID_CPF',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  TRIP_NOT_FOUND: 'TRIP_NOT_FOUND',
  
  // Conflict
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  CPF_ALREADY_EXISTS: 'CPF_ALREADY_EXISTS',
  ALREADY_SUBSCRIBED: 'ALREADY_SUBSCRIBED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Business Logic
  TRIP_ALREADY_STARTED: 'TRIP_ALREADY_STARTED',
  TRIP_ALREADY_FINISHED: 'TRIP_ALREADY_FINISHED',
  CANNOT_SUBSCRIBE: 'CANNOT_SUBSCRIBE',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Custom Application Error Class
 */
export class AppError extends Error {
  constructor({
    message,
    code = ErrorCode.UNKNOWN_ERROR,
    category = ErrorCategory.UNKNOWN,
    statusCode = null,
    field = null,
    details = null,
    originalError = null,
    isRetryable = false,
  }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.statusCode = statusCode;
    this.field = field;
    this.details = details;
    this.originalError = originalError;
    this.isRetryable = isRetryable;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      statusCode: this.statusCode,
      field: this.field,
      details: this.details,
      timestamp: this.timestamp,
      isRetryable: this.isRetryable,
    };
  }
}

/**
 * Network Error
 */
export class NetworkError extends AppError {
  constructor(message = 'Erro de conexão', originalError = null) {
    super({
      message,
      code: ErrorCode.NETWORK_ERROR,
      category: ErrorCategory.NETWORK,
      originalError,
      isRetryable: true,
    });
    this.name = 'NetworkError';
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Erro de autenticação', code = ErrorCode.INVALID_CREDENTIALS) {
    super({
      message,
      code,
      category: ErrorCategory.AUTHENTICATION,
      statusCode: 401,
      isRetryable: false,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Acesso não autorizado') {
    super({
      message,
      code: ErrorCode.FORBIDDEN,
      category: ErrorCategory.AUTHORIZATION,
      statusCode: 403,
      isRetryable: false,
    });
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message, field = null, details = null, fieldErrors = {}) {
    super({
      message,
      code: ErrorCode.VALIDATION_ERROR,
      category: ErrorCategory.VALIDATION,
      statusCode: 400,
      field,
      details,
      isRetryable: false,
    });
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super({
      message: `${resource} não encontrado`,
      code: ErrorCode.NOT_FOUND,
      category: ErrorCategory.NOT_FOUND,
      statusCode: 404,
      isRetryable: false,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message, code = ErrorCode.DUPLICATE_ENTRY) {
    super({
      message,
      code,
      category: ErrorCategory.CONFLICT,
      statusCode: 409,
      isRetryable: false,
    });
    this.name = 'ConflictError';
  }
}

/**
 * Server Error
 */
export class ServerError extends AppError {
  constructor(message = 'Erro interno do servidor', originalError = null) {
    super({
      message,
      code: ErrorCode.INTERNAL_ERROR,
      category: ErrorCategory.SERVER,
      statusCode: 500,
      originalError,
      isRetryable: true,
    });
    this.name = 'ServerError';
  }
}
