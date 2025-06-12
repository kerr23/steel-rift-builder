import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Button from '../Button.vue'

describe('Button.vue', () => {
  it('renders default button correctly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('renders different variants correctly', async () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'secondary'
      },
      slots: {
        default: 'Secondary Button'
      }
    })

    expect(wrapper.classes()).toContain('btn-secondary')

    await wrapper.setProps({ variant: 'danger' })
    expect(wrapper.classes()).toContain('btn-danger')
  })

  it('applies small size when specified', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'sm'
      }
    })

    expect(wrapper.classes()).toContain('btn-sm')
  })

  it('disables the button when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.attributes('disabled')).toBe('')
    expect(wrapper.classes()).toContain('opacity-60')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button)

    await wrapper.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted().click[0]).toEqual([expect.any(Object)])
  })

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted().click).toBeUndefined()
  })

  it('sets type attribute correctly', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'submit'
      }
    })

    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('sets aria-label and title attributes', () => {
    const wrapper = mount(Button, {
      props: {
        ariaLabel: 'Add to cart',
        title: 'Add this item to your cart'
      }
    })

    expect(wrapper.attributes('aria-label')).toBe('Add to cart')
    expect(wrapper.attributes('title')).toBe('Add this item to your cart')
  })
})
