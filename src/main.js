// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { provideErrorService } from './services/errorService'

// Import global styles and component styles
import '@/assets/main.css'
import './assets/tailwind.css'
import './assets/components.css'

// Configuration options for toasts
const toastOptions = {
  position: 'top-right',
  timeout: 4000, // 4 seconds
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
}

// Create app instance
const app = createApp(App)

// Setup Pinia store
app.use(createPinia())
app.use(Toast, toastOptions)

// Setup global error handling
const errorService = provideErrorService(app)

// Global error handler for uncaught exceptions
app.config.errorHandler = (error, instance, info) => {
  errorService.handleError(error, {
    context: info || 'Vue Error Handler',
    type: 'runtime'
  })
  console.error('Global error:', error)
}

// Mount the app
app.mount('#app')
