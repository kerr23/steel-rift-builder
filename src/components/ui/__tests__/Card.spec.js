import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Card from '../Card.vue'

describe('Card.vue', () => {
  it('renders slot content correctly', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div class="test-content">Card Content</div>'
      }
    })

    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.find('.test-content').text()).toBe('Card Content')
  })

  it('renders title when provided', () => {
    const wrapper = mount(Card, {
      props: {
        title: 'Card Title'
      }
    })

    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Card Title')
  })

  it('does not render title element when not provided', () => {
    const wrapper = mount(Card)

    expect(wrapper.find('h2').exists()).toBe(false)
  })

  it('includes bottom margin by default', () => {
    const wrapper = mount(Card)

    expect(wrapper.classes()).toContain('mb-8')
  })

  it('removes bottom margin when bottomMargin is false', () => {
    const wrapper = mount(Card, {
      props: {
        bottomMargin: false
      }
    })

    expect(wrapper.classes()).not.toContain('mb-8')
  })

  it('has the correct base classes', () => {
    const wrapper = mount(Card)

    expect(wrapper.classes()).toContain('card')
    expect(wrapper.classes()).toContain('bg-card-bg')
    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).toContain('border-border-color')
    expect(wrapper.classes()).toContain('rounded-lg')
    expect(wrapper.classes()).toContain('shadow-md')
    expect(wrapper.classes()).toContain('p-6')
  })
})
