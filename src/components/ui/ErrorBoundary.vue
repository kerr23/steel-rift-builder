<template>
  <div>
    <div v-if="error" class="error-boundary p-4 border border-danger bg-danger bg-opacity-10 rounded mb-4">
      <h3 class="text-danger text-lg font-bold mb-2">
        Something went wrong
      </h3>
      <p class="text-danger mb-2">{{ errorMessage }}</p>
      <div v-if="showStack" class="mt-2">
        <details>
          <summary class="cursor-pointer text-sm text-danger">Show details</summary>
          <pre class="mt-2 p-2 text-xs whitespace-pre-wrap bg-card-bg border border-danger rounded">{{ errorStack }}</pre>
        </details>
      </div>
      <button
        class="mt-4 px-3 py-1 bg-danger text-white rounded hover:brightness-90"
        @click="resetErrorBoundary"
      >
        Try again
      </button>
    </div>

    <slot v-if="!error"></slot>
  </div>
</template>

<script setup>
import { ref, watch, onErrorCaptured, provide } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  /**
   * Whether to show the error stack in the UI
   */
  showStack: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to auto-hide error after a timeout
   */
  autoHide: {
    type: Boolean,
    default: false
  },
  /**
   * Auto-hide timeout in ms
   */
  autoHideTimeout: {
    type: Number,
    default: 5000
  },
  /**
   * Function to call when resetting the error boundary
   */
  onReset: {
    type: Function,
    default: null
  }
})

const error = ref(null)
const errorMessage = ref('')
const errorStack = ref('')
const toast = useToast()
let autoHideTimer = null

// Handle errors
onErrorCaptured((err, instance, info) => {
  handleError(err)
  // Return false to prevent the error from propagating
  return false
})

// Reset the error boundary
const resetErrorBoundary = () => {
  error.value = null
  errorMessage.value = ''
  errorStack.value = ''
  clearTimeout(autoHideTimer)

  if (props.onReset) {
    props.onReset()
  }
}

// Provide a method to handle errors programmatically
const handleError = (err) => {
  error.value = err
  errorMessage.value = err.message || 'An unexpected error occurred'
  errorStack.value = err.stack || ''

  // Show toast notification
  toast.error(errorMessage.value, {
    timeout: 3000,
    closeOnClick: true,
  })

  // Set up auto-hide if enabled
  if (props.autoHide) {
    clearTimeout(autoHideTimer)
    autoHideTimer = setTimeout(() => {
      resetErrorBoundary()
    }, props.autoHideTimeout)
  }
}

// Expose the error handling method and reset function
provide('errorBoundary', {
  handleError,
  resetErrorBoundary
})

// Clean up timer on component unmount
watch(() => props.autoHide, (newVal, oldVal) => {
  if (!newVal) {
    clearTimeout(autoHideTimer)
  }
})
</script>
