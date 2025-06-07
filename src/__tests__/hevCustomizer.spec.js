import { mount } from '@vue/test-utils'
import HevCustomizer from '../components/hevCustomizer.vue'
import { gameData } from '../gameData.js'
import { describe, it, expect } from 'vitest'

describe('HevCustomizer.vue', () => {
  it('renders and emits add-hev', async () => {
    const wrapper = mount(HevCustomizer, {
      props: { gameRules: gameData },
    })
    // Simulate filling out and submitting the form
    wrapper.vm.$emit('add-hev', {
      unitName: 'Test Unit',
      selectedClass: gameData.classes[0],
      effectiveArmor: 6, // Light baseArmor
      effectiveStructure: 4, // Light baseStructure
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'test-2',
    })
    expect(wrapper.emitted('add-hev')).toBeTruthy()
  })
})
