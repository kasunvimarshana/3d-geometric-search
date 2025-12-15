/**
 * Error handling utilities
 */

/**
 * Custom application error
 */
export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * File loading error
 */
export class FileLoadError extends AppError {
  constructor(message, fileName = null) {
    super(message, 'FILE_LOAD_ERROR', { fileName });
    this.name = 'FileLoadError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 'VALIDATION_ERROR', { errors });
    this.name = 'ValidationError';
  }
}

/**
 * Parse error
 */
export class ParseError extends AppError {
  constructor(message, format = null) {
    super(message, 'PARSE_ERROR', { format });
    this.name = 'ParseError';
  }
}

/**
 * Handle error gracefully
 */
export function handleError(error, context = '') {
  console.error(`Error in ${context}:`, error);

  let message = 'An unexpected error occurred';

  if (error instanceof AppError) {
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return {
    error: true,
    message,
    details: error instanceof AppError ? error.details : null,
  };
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling(fn, errorHandler) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      }
      throw error;
    }
  };
}
