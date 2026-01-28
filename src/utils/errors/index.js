/**
 * Error Handling Module
 * Central export for all error utilities
 */

// Error Types
export {
  ErrorCategory,
  ErrorCode,
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ServerError,
} from './errorTypes';

// Error Messages
export {
  errorMessages,
  categoryMessages,
  httpStatusMessages,
  fieldValidationMessages,
  getErrorMessage,
  getCategoryMessage,
  getHttpStatusMessage,
  getFieldValidationMessage,
} from './errorMessages';

// Error Parser
export {
  parseApiError,
  getErrorMessageFromError,
  isRetryableError,
  requiresReauth,
} from './errorParser';

// Error Logger
export { errorLogger, LogLevel } from './errorLogger';
