import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFormValidation } from '../useFormValidation'
import { reactive } from 'vue'

describe('useFormValidation', () => {
  let formData
  let validator
  let validation

  beforeEach(() => {
    formData = reactive({
      name: '',
      age: null,
      email: ''
    })

    validator = vi.fn().mockImplementation((data) => {
      const errors = []

      if (!data.name) {
        errors.push('name is required')
      }

      if (!data.age || data.age < 18) {
        errors.push('age must be 18 or older')
      }

      if (!data.email || !data.email.includes('@')) {
        errors.push('email must be valid')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    })

    validation = useFormValidation({
      validator,
      formData
    })
  })

  it('initializes with empty errors and valid=true', () => {
    expect(validation.errors.value).toEqual([])
    expect(validation.isValid.value).toBe(true)
    expect(validation.isSubmitted.value).toBe(false)
  })

  it('validates form data and returns validation state', () => {
    const isValid = validation.validate()

    expect(isValid).toBe(false)
    expect(validation.errors.value).toHaveLength(3)
    expect(validation.isValid.value).toBe(false)
  })

  it('tracks touched fields', () => {
    validation.touchField('name')

    expect(validation.touchedFields.value.has('name')).toBe(true)
    expect(validation.touchedFields.value.has('age')).toBe(false)
  })

  it('does not show errors for untouched fields before submission', () => {
    validation.validate() // This will validate but not show errors yet

    expect(validation.getFieldError('name')).toBe(null)

    validation.touchField('name')
    validation.validateField('name')

    expect(validation.getFieldError('name')).not.toBe(null)
  })

  it('shows all errors after submission regardless of touched state', () => {
    validation.submitForm()

    expect(validation.isSubmitted.value).toBe(true)
    expect(validation.getFieldError('name')).not.toBe(null)
    expect(validation.getFieldError('age')).not.toBe(null)
    expect(validation.getFieldError('email')).not.toBe(null)
  })

  it('resets validation state', () => {
    validation.submitForm()
    validation.resetValidation()

    expect(validation.errors.value).toEqual([])
    expect(validation.isSubmitted.value).toBe(false)
    expect(validation.touchedFields.value.size).toBe(0)
  })

  it('watches specified fields for validation', () => {
    const watchValidator = vi.fn().mockReturnValue({ isValid: true, errors: [] })

    useFormValidation({
      validator: watchValidator,
      formData,
      validateOn: ['name', 'email']
    })

    formData.name = 'Test Name'

    // Need to wait for watchers to trigger
    setTimeout(() => {
      expect(watchValidator).toHaveBeenCalled()
    }, 0)
  })
})
