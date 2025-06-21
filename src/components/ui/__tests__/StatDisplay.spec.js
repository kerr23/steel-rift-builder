import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatDisplay from '../StatDisplay.vue'

describe('StatDisplay.vue', () => {
  it('renders with required props only', () => {
    const wrapper = mount(StatDisplay, {
      props: {
        value: 10
      }
    })

    expect(wrapper.find('.stat-value').text()).toContain('10')
    expect(wrapper.find('.stat-label').exists()).toBe(false)
    expect(wrapper.find('.stat-unit').exists()).toBe(false)
    expect(wrapper.find('.stat-description').exists()).toBe(false)
  })

  it('renders with all props', () => {
    const wrapper = mount(StatDisplay, {
      props: {
        value: 25,
        label: 'Armor',
        unit: 'pts',
        description: 'Standard armor plating',
        highlight: true
      }
    })

    expect(wrapper.find('.stat-label').text()).toBe('Armor')
    expect(wrapper.find('.stat-value').text()).toContain('25')
    expect(wrapper.find('.stat-unit').text()).toBe('pts')
    expect(wrapper.find('.stat-description').text()).toBe('Standard armor plating')
    expect(wrapper.find('.stat-value').classes()).toContain('highlighted')
  })

  it('applies dark mode styling when isDark is true', () => {
    const wrapper = mount(StatDisplay, {
      props: {
        value: 15,
        isDark: true
      }
    })

    expect(wrapper.find('.stat-display').classes()).toContain('dark:bg-gray-800')
  })

  it('applies custom class to value when provided', () => {
    const wrapper = mount(StatDisplay, {
      props: {
        value: 30,
        customClass: 'text-red-500'
      }
    })

    expect(wrapper.find('.stat-value').classes()).toContain('text-red-500')
  })
})
