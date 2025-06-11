// filepath: /var/home/dmk/projects/steel-rift-builder/src/__tests__/App.simplest.spec.js
import { shallowMount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import App from '../App.vue'

vi.mock('vue-toastification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  })
}))

describe('App.vue Basic Tests', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.vm).toBeDefined()
  })

  it('has isDarkMode as false by default', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.vm.isDarkMode).toBe(false)
  })
})
