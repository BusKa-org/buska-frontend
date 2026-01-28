/**
 * Error Logger
 * Centralized error logging for debugging and monitoring
 */

import { AppError, ErrorCategory } from './errorTypes';

// Log levels
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL',
};

// Environment check
const isDevelopment = __DEV__ || process.env.NODE_ENV !== 'production';

/**
 * Format error for logging
 */
function formatError(error) {
  if (error instanceof AppError) {
    return {
      type: error.name,
      message: error.message,
      code: error.code,
      category: error.category,
      statusCode: error.statusCode,
      field: error.field,
      details: error.details,
      timestamp: error.timestamp,
      stack: isDevelopment ? error.stack : undefined,
    };
  }
  
  return {
    type: error.name || 'Error',
    message: error.message,
    stack: isDevelopment ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log to console (development)
 */
function logToConsole(level, message, data) {
  if (!isDevelopment) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(prefix, message, data);
      break;
    case LogLevel.INFO:
      console.info(prefix, message, data);
      break;
    case LogLevel.WARN:
      console.warn(prefix, message, data);
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(prefix, message, data);
      break;
    default:
      console.log(prefix, message, data);
  }
}

/**
 * Send to remote logging service (production)
 * TODO: Integrate with Sentry, LogRocket, or similar
 */
async function logToRemote(level, error, context) {
  if (isDevelopment) return;
  
  // Example: Send to logging endpoint
  // try {
  //   await fetch('/api/logs', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       level,
  //       error: formatError(error),
  //       context,
  //       userAgent: navigator?.userAgent,
  //       timestamp: new Date().toISOString(),
  //     }),
  //   });
  // } catch (e) {
  //   console.error('Failed to send log:', e);
  // }
}

/**
 * Main error logger
 */
export const errorLogger = {
  /**
   * Log debug information
   */
  debug(message, data = {}) {
    logToConsole(LogLevel.DEBUG, message, data);
  },
  
  /**
   * Log informational message
   */
  info(message, data = {}) {
    logToConsole(LogLevel.INFO, message, data);
  },
  
  /**
   * Log warning
   */
  warn(message, data = {}) {
    logToConsole(LogLevel.WARN, message, data);
  },
  
  /**
   * Log error
   */
  error(error, context = {}) {
    const formattedError = formatError(error);
    logToConsole(LogLevel.ERROR, 'Error occurred:', { ...formattedError, context });
    logToRemote(LogLevel.ERROR, error, context);
  },
  
  /**
   * Log fatal error
   */
  fatal(error, context = {}) {
    const formattedError = formatError(error);
    logToConsole(LogLevel.FATAL, 'FATAL Error:', { ...formattedError, context });
    logToRemote(LogLevel.FATAL, error, context);
  },
  
  /**
   * Log API error with request context
   */
  apiError(error, request = {}) {
    const context = {
      method: request.method,
      url: request.url,
      params: request.params,
    };
    
    const formattedError = formatError(error);
    logToConsole(LogLevel.ERROR, 'API Error:', { ...formattedError, request: context });
    logToRemote(LogLevel.ERROR, error, context);
  },
  
  /**
   * Log user action that resulted in error
   */
  userError(action, error, userData = {}) {
    const context = {
      action,
      userId: userData.id,
      role: userData.role,
    };
    
    const formattedError = formatError(error);
    logToConsole(LogLevel.WARN, `User action failed: ${action}`, { ...formattedError, context });
  },
};

export default errorLogger;
