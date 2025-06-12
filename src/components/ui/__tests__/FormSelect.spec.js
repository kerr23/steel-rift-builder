import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import FormSelect from '../FormSelect.vue'

describe('FormSelect.vue', () => {
  it('renders properly with label', () => {
    const wrapper = mount(FormSelect, {
      props: {
        id: 'test-select',
        label: 'Test Label',
        modelValue: ''
      },
      slots: {
        default: '<option value="1">Option 1</option><option value="2">Option 2</option>'
      }
    })

    expect(wrapper.find('label').text()).toBe('Test Label')
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.findAll('option').length).toBe(2)
  })

  it('emits update event with numeric value', async () => {
    const wrapper = mount(FormSelect, {
      props: {
        id: 'test-select',
        modelValue: ''
      },
      slots: {
        default: '<option value="1">Option 1</option><option value="2">Option 2</option>'
      }
    })

    await wrapper.find('select').setValue('2')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toBe(2) // Expect number 2, not string '2'
  })

  it('handles JSON object values correctly', async () => {
    const testObj = { id: 123, name: 'Test Object' }
    const jsonValue = JSON.stringify(testObj)

    const wrapper = mount(FormSelect, {
      props: {
        id: 'test-select',
        modelValue: null
      },
      slots: {
        default: `<option value='${jsonValue}'>Object Option</option>`
      }
    })

    await wrapper.find('select').setValue(jsonValue)

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toEqual(testObj)
  })

  it('handles disabled state', () => {
    const wrapper = mount(FormSelect, {
      props: {
        id: 'test-select',
        disabled: true
      }
    })

    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })
})
