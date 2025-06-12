import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import MemoizedTraitFormatter from '../MemoizedTraitFormatter.vue'

describe('MemoizedTraitFormatter.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(MemoizedTraitFormatter, {
      props: {
        className: 'Assault'
      }
    })
  })

  it('formats Limited trait correctly', async () => {
    const trait = { name: 'Limited', value: 3 }
    const result = wrapper.vm.formatTraitDisplay(trait)

    expect(result).toBe('Limited(○○○)')
  })

  it('formats class-specific traits correctly', async () => {
    const trait = { name: 'Damage', value: { Assault: '+2', Support: '+1' } }

    // Should use the Assault value from props
    expect(wrapper.vm.formatTraitDisplay(trait)).toBe('Damage +2')

    // Update class to Support
    await wrapper.setProps({ className: 'Support' })
    expect(wrapper.vm.formatTraitDisplay(trait)).toBe('Damage +1')
  })

  it('formats traits with default values when class is not specified', async () => {
    const trait = { name: 'Range', value: { default: 'Short', Sniper: 'Long' } }

    expect(wrapper.vm.formatTraitDisplay(trait)).toBe('Range Short')

    await wrapper.setProps({ className: 'Sniper' })
    expect(wrapper.vm.formatTraitDisplay(trait)).toBe('Range Long')
  })

  it('handles numeric trait values', async () => {
    const trait = { name: 'Damage', value: 3 }

    expect(wrapper.vm.formatTraitDisplay(trait)).toBe('Damage 3')
  })

  it('handles string trait values', async () => {
    const trait = { name: 'Special', value: 'Unique Effect' }

    expect(wrapper.vm.formatTraitDisplay(trait)).toBe('Special Unique Effect')
  })

  it('returns a default message for invalid traits', () => {
    expect(wrapper.vm.formatTraitDisplay(null)).toBe('Unknown Trait')
    expect(wrapper.vm.formatTraitDisplay({})).toBe('Unknown Trait')
    expect(wrapper.vm.formatTraitDisplay({ value: 5 })).toBe('Unknown Trait')
  })

  it('uses memoization to cache results', () => {
    const trait = { name: 'Heavy', value: true }

    // Call twice with the same trait
    const result1 = wrapper.vm.formatTraitDisplay(trait)
    const result2 = wrapper.vm.formatTraitDisplay(trait)

    expect(result1).toBe('Heavy')
    expect(result2).toBe('Heavy')

    // We can't directly test the cache implementation, but we can
    // verify the function returns consistent results
  })
})
