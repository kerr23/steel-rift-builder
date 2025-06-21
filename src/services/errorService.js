/**
 * errorService.js
 *
 * A centralized service for handling and reporting errors throughout the application.
 * This service standardizes error handling patterns and provides utility functions
 * for common error scenarios.
 */

import { useToast } from 'vue-toastification'
import { inject, provide, reactive } from 'vue'

// Constants for error types
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  DATA: 'data',
  RUNTIME: 'runtime',
  UNKNOWN: 'unknown'
}

// Error handling symbol for dependency injection
const errorServiceKey = Symbol('errorService')

/**
 * Creates an error service instance that can be provided to the app
 *
 * @returns {Object} Error service methods and state
 */
export function createErrorService() {
  const toast = useToast()

  // Track recent errors for reporting
  const errorState = reactive({
    recentErrors: [],
    hasErrors: false
  })

  /**
   * Handle an error with appropriate logging and user notification
   *
   * @param {Error|string} error - The error object or message
   * @param {Object} options - Error handling options
   * @param {string} [options.type=ERROR_TYPES.UNKNOWN] - Type of error
   * @param {string} [options.context] - Where the error occurred
   * @param {boolean} [options.silent=false] - Whether to suppress user notification
   * @param {boolean} [options.rethrow=false] - Whether to rethrow the error after handling
   */
  function handleError(error, options = {}) {
    const {
      type = ERROR_TYPES.UNKNOWN,
      context = 'application',
      silent = false,
      rethrow = false
    } = options

    // Format error for logging
    const errorObj = error instanceof Error ? error : new Error(error)
    const timestamp = new Date().toISOString()
    const formattedError = {
      message: errorObj.message,
      type,
      context,
      timestamp,
      stack: errorObj.stack
    }

    // Add to recent errors list (limit to 10 most recent)
    errorState.recentErrors.unshift(formattedError)
    if (errorState.recentErrors.length > 10) {
      errorState.recentErrors.pop()
    }
    errorState.hasErrors = true

    // Log to console
    console.error(`[${type}][${context}] ${errorObj.message}`, errorObj)

    // Notify user if not silent
    if (!silent) {
      switch (type) {
        case ERROR_TYPES.VALIDATION:
          toast.warning(errorObj.message)
          break
        case ERROR_TYPES.NETWORK:
          toast.error(`Network error: ${errorObj.message}`)
          break
        default:
          toast.error(errorObj.message)
      }
    }

    // Rethrow if requested
    if (rethrow) {
      throw errorObj
    }
  }

  /**
   * Convenience method for handling validation errors
   *
   * @param {string|Error} error - Validation error message or object
   * @param {Object} options - Additional options
   */
  function handleValidationError(error, options = {}) {
    handleError(error, {
      type: ERROR_TYPES.VALIDATION,
      ...options
    })
  }

  /**
   * Clear the error state
   */
  function clearErrors() {
    errorState.recentErrors = []
    errorState.hasErrors = false
  }

  // Return the service API
  return {
    handleError,
    handleValidationError,
    clearErrors,
    errorState
  }
}

/**
 * Provide the error service to components
 *
 * @param {Object} app - Vue app instance
 * @returns {Object} The error service instance
 */
export function provideErrorService(app) {
  const errorService = createErrorService()

  if (app) {
    app.provide(errorServiceKey, errorService)
  } else {
    provide(errorServiceKey, errorService)
  }

  return errorService
}

/**
 * Use the error service in components
 *
 * @returns {Object} The error service instance
 */
export function useErrorService() {
  const errorService = inject(errorServiceKey)

  if (!errorService) {
    throw new Error(
      'Error service not found. Make sure to call provideErrorService in your app setup.'
    )
  }

  return errorService
}

export default {
  createErrorService,
  provideErrorService,
  useErrorService,
  ERROR_TYPES
}
