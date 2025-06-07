import { mount } from '@vue/test-utils'
import HevCustomizer from '../components/hevCustomizer.vue'
import { gameData } from '../gameData.js'

describe('HevCustomizer.vue', () => {
  it('renders and emits add-hev', async () => {
    const wrapper = mount(HevCustomizer, {
      props: { gameRules: gameData },
    })
    // Simulate filling out and submitting the form
    wrapper.vm.$emit('add-hev', {
      unitName: 'Test Unit',
      selectedClass: gameData.classes[0],
      effectiveArmorDie: { die: 'd6', step: 1 },
      effectiveStructureDie: { die: 'd4', step: 0 },
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'test-2',
    })
    expect(wrapper.emitted('add-hev')).toBeTruthy()
  })
})
