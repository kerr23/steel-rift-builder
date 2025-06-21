import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createErrorService, ERROR_TYPES } from '../errorService'

// Mock vue-toastification
vi.mock('vue-toastification', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }))
}))

// Mock console.error
const originalConsoleError = console.error
console.error = vi.fn()

describe('errorService', () => {
  let errorService

  beforeEach(() => {
    vi.clearAllMocks()
    errorService = createErrorService()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('creates an error service with initial state', () => {
    expect(errorService.errorState.recentErrors).toEqual([])
    expect(errorService.errorState.hasErrors).toBe(false)
  })

  it('handles errors and logs them to console', () => {
    const testError = new Error('Test error')

    errorService.handleError(testError, {
      context: 'test',
      type: ERROR_TYPES.DATA,
      silent: true
    })

    expect(console.error).toHaveBeenCalled()
    expect(errorService.errorState.recentErrors.length).toBe(1)
    expect(errorService.errorState.recentErrors[0].message).toBe('Test error')
    expect(errorService.errorState.recentErrors[0].type).toBe(ERROR_TYPES.DATA)
    expect(errorService.errorState.hasErrors).toBe(true)
  })

  it('handles string errors by converting them to Error objects', () => {
    errorService.handleError('String error message', { silent: true })

    expect(console.error).toHaveBeenCalled()
    expect(errorService.errorState.recentErrors[0].message).toBe('String error message')
  })

  it('limits the number of recent errors to 10', () => {
    // Add 12 errors
    for (let i = 0; i < 12; i++) {
      errorService.handleError(`Error ${i}`, { silent: true })
    }

    expect(errorService.errorState.recentErrors.length).toBe(10)
    // Most recent should be first
    expect(errorService.errorState.recentErrors[0].message).toBe('Error 11')
  })

  it('has a convenience method for validation errors', () => {
    errorService.handleValidationError('Invalid input', { silent: true })

    expect(errorService.errorState.recentErrors[0].type).toBe(ERROR_TYPES.VALIDATION)
    expect(errorService.errorState.recentErrors[0].message).toBe('Invalid input')
  })

  it('clears error state', () => {
    errorService.handleError('Some error', { silent: true })
    expect(errorService.errorState.hasErrors).toBe(true)

    errorService.clearErrors()

    expect(errorService.errorState.recentErrors).toEqual([])
    expect(errorService.errorState.hasErrors).toBe(false)
  })

  it('throws the error when rethrow option is true', () => {
    const testError = new Error('Rethrown error')

    expect(() => {
      errorService.handleError(testError, {
        silent: true,
        rethrow: true
      })
    }).toThrow('Rethrown error')

    // Error should still be logged and tracked
    expect(errorService.errorState.recentErrors.length).toBe(1)
  })
})
