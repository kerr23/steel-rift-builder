// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import Toast from 'vue-toastification' // Import plugin
import 'vue-toastification/dist/index.css' // Import the CSS

// Import global styles (assuming it was named main.css)
import './assets/main.css'

// Configuration options for toasts (optional)
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

createApp(App)
  .use(Toast, toastOptions) // Use the plugin with options
  .mount('#app')
