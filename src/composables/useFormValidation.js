import { computed, ref, watch } from 'vue'

/**
 * Form validation composable for tracking and validating form input fields
 *
 * @param {Object} options - Validation configuration options
 * @param {Function} options.validator - The validation function that returns validation errors
 * @param {Object} options.formData - The reactive object containing form data
 * @param {Array} [options.validateOn] - Array of field names to watch for changes to trigger validation
 * @param {Boolean} [options.validateOnChange=false] - Whether to validate on every form change
 * @returns {Object} - Validation state and helper methods
 */
export function useFormValidation(options) {
  const {
    validator,
    formData,
    validateOn = [],
    validateOnChange = false
  } = options

  const errors = ref([])
  const touchedFields = ref(new Set())
  const isSubmitted = ref(false)

  // Mark a field as touched when user interacts with it
  const touchField = (fieldName) => {
    touchedFields.value.add(fieldName)
  }

  // Run validation and return validation state
  const validate = () => {
    const validationResult = validator(formData)
    errors.value = validationResult.errors || []
    return validationResult.isValid
  }

  // Validate specific field
  const validateField = (fieldName) => {
    // Only show errors for touched fields or if form was submitted
    if (touchedFields.value.has(fieldName) || isSubmitted.value) {
      validate()
    }
  }

  // Helper to get error for a specific field
  const getFieldError = (fieldName) => {
    if (!isSubmitted.value && !touchedFields.value.has(fieldName)) {
      return null
    }

    return errors.value.find(e => e.includes(fieldName))
  }

  // Mark form as submitted
  const submitForm = () => {
    isSubmitted.value = true
    return validate()
  }

  // Reset validation state
  const resetValidation = () => {
    errors.value = []
    touchedFields.value = new Set()
    isSubmitted.value = false
  }

  // Compute overall validation state
  const isValid = computed(() => errors.value.length === 0)

  // Setup watches for field changes if specified
  if (validateOnChange) {
    watch(formData, () => validate(), { deep: true })
  } else if (validateOn.length) {
    validateOn.forEach(field => {
      watch(() => formData[field], () => validateField(field))
    })
  }

  return {
    errors,
    touchedFields,
    isValid,
    isSubmitted,
    touchField,
    validate,
    validateField,
    getFieldError,
    submitForm,
    resetValidation
  }
}

export default useFormValidation
