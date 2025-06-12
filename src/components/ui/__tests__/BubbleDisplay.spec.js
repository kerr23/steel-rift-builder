import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import BubbleDisplay from '../BubbleDisplay.vue'

describe('BubbleDisplay.vue', () => {
  it('renders properly with label and value', () => {
    const wrapper = mount(BubbleDisplay, {
      props: {
        label: 'Armor',
        value: 3
      }
    })

    expect(wrapper.find('.print-defense-label').text()).toBe('Armor:')
    expect(wrapper.findAll('.bubble').length).toBe(3)
  })

  it('displays N/A when value is 0', () => {
    const wrapper = mount(BubbleDisplay, {
      props: {
        label: 'Armor',
        value: 0
      }
    })

    expect(wrapper.find('.placeholder-text-inline').text()).toBe('N/A')
    expect(wrapper.findAll('.bubble').length).toBe(0)
  })

  it('renders structure with threshold markers when isStructure is true', () => {
    const wrapper = mount(BubbleDisplay, {
      props: {
        label: 'Structure',
        value: 10,
        isStructure: true,
        thresholds: {
          markerGreen: 3,
          markerYellow: 6,
          markerRed: 9
        }
      }
    })

    expect(wrapper.find('.divider-green').exists()).toBe(true)
    expect(wrapper.find('.divider-yellow').exists()).toBe(true)
    expect(wrapper.find('.divider-red').exists()).toBe(true)
    expect(wrapper.findAll('.structure-bubble').length).toBe(10)
  })

  it('does not render threshold markers when isStructure is false', () => {
    const wrapper = mount(BubbleDisplay, {
      props: {
        label: 'Armor',
        value: 10,
        isStructure: false,
        thresholds: {
          markerGreen: 3,
          markerYellow: 6,
          markerRed: 9
        }
      }
    })

    expect(wrapper.find('.divider-green').exists()).toBe(false)
    expect(wrapper.find('.divider-yellow').exists()).toBe(false)
    expect(wrapper.find('.divider-red').exists()).toBe(false)
    expect(wrapper.findAll('.armor-bubble').length).toBe(10)
  })
})
