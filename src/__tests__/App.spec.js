import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { gameData } from '../gameData.js'

describe('App.vue', () => {
  it('renders the app title', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toMatch(/Steel Rift Force Builder/)
  })

  it('shows empty roster message', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('No HE-Vs added to the roster yet.')
  })

  it('adds a HE-V to the roster', async () => {
    const wrapper = mount(App)
    // Simulate addHevToRoster
    await wrapper.vm.addHevToRoster({
      unitName: 'Test HE-V',
      selectedClass: gameData.classes[0],
      effectiveArmorDie: { die: 'd6', step: 1 },
      effectiveStructureDie: { die: 'd4', step: 0 },
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'test-1',
    })
    expect(wrapper.vm.roster.length).toBe(1)
    expect(wrapper.text()).toContain('Test HE-V')
  })

  it('removes a HE-V from the roster', async () => {
    const wrapper = mount(App)
    await wrapper.vm.addHevToRoster({
      unitName: 'To Remove',
      selectedClass: gameData.classes[0],
      effectiveArmorDie: { die: 'd6', step: 1 },
      effectiveStructureDie: { die: 'd4', step: 0 },
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'remove-1',
    })
    await wrapper.vm.removeHevFromRoster('remove-1')
    expect(wrapper.vm.roster.length).toBe(0)
  })

  it('toggles dark mode', async () => {
    const wrapper = mount(App)
    expect(wrapper.vm.isDarkMode).toBe(false)
    await wrapper.vm.toggleDarkMode()
    expect(wrapper.vm.isDarkMode).toBe(true)
  })
})
