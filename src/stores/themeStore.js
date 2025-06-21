// src/stores/themeStore.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDarkMode = ref(localStorage.getItem('isDarkMode') === 'true')

  // Actions
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('isDarkMode', isDarkMode.value)
  }

  function initializeDarkMode() {
    // Check for system preference if user hasn't set a preference
    if (localStorage.getItem('isDarkMode') === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDarkMode.value = prefersDark
      localStorage.setItem('isDarkMode', prefersDark)
    }

    // Add listener for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't explicitly set a preference
        if (localStorage.getItem('isDarkMode') === null) {
          isDarkMode.value = e.matches
          localStorage.setItem('isDarkMode', e.matches)
        }
      })
    }

    // Apply theme
    applyTheme()
  }

  // Watch for changes and apply theme
  watch(isDarkMode, () => {
    applyTheme()
  })

  // Helper function to apply theme
  function applyTheme() {
    const html = document.documentElement
    if (isDarkMode.value) {
      html.classList.add('dark-theme')
    } else {
      html.classList.remove('dark-theme')
    }
  }

  return {
    isDarkMode,
    toggleDarkMode,
    initializeDarkMode
  }
})
