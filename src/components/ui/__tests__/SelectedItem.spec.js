import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import SelectedItem from '../SelectedItem.vue'

describe('SelectedItem.vue', () => {
  it('renders with required name prop', () => {
    const wrapper = mount(SelectedItem, {
      props: {
        name: 'Test Item'
      }
    })

    expect(wrapper.find('.item-name').text()).toBe('Test Item')
  })

  it('renders with optional stats prop', () => {
    const wrapper = mount(SelectedItem, {
      props: {
        name: 'Test Item',
        stats: '(10T, Range: Medium)'
      }
    })

    expect(wrapper.find('.item-stats').text()).toBe('(10T, Range: Medium)')
  })

  it('renders with optional traits prop', () => {
    const wrapper = mount(SelectedItem, {
      props: {
        name: 'Test Item',
        traits: 'Heavy, Limited(3)'
      }
    })

    expect(wrapper.find('.item-traits').text()).toBe('Heavy, Limited(3)')
  })

  it('does not render stats element when not provided', () => {
    const wrapper = mount(SelectedItem, {
      props: {
        name: 'Test Item'
      }
    })

    expect(wrapper.find('.item-stats').exists()).toBe(false)
  })

  it('does not render traits element when not provided', () => {
    const wrapper = mount(SelectedItem, {
      props: {
        name: 'Test Item'
      }
    })

    expect(wrapper.find('.item-traits').exists()).toBe(false)
  })

  it('emits remove event when button is clicked', async () => {
    const wrapper = mount(SelectedItem, {
      props: {
        name: 'Test Item'
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('remove')
    expect(wrapper.emitted().remove.length).toBe(1)
  })
})
