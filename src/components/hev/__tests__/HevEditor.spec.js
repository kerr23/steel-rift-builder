import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HevEditor from '../HevEditor.vue'

// Import the function we need to mock
import { useHevConfiguration } from '../../../composables/useHevConfiguration'

// Mock child components
vi.mock('../../ui/StatDisplay.vue', () => ({
  default: {
    props: ['value', 'label', 'unit', 'highlight', 'customClass', 'isDark'],
    template: '<div data-test="stat-display">{{ label }}: {{ value }}</div>'
  }
}))

vi.mock('../../ui/Button.vue', () => ({
  default: {
    props: ['variant', 'type', 'disabled'],
    template: '<button :type="type || \'button\'" :disabled="disabled"><slot /></button>'
  }
}))

vi.mock('../ChassisClassSelector.vue', () => ({
  default: {
    props: ['selectedClass', 'classOptions', 'isDarkMode'],
    template: '<div data-test="chassis-selector"></div>',
    emits: ['update:selectedClass']
  }
}))

vi.mock('../MotiveSystemSelector.vue', () => ({
  default: {
    props: ['selectedMotiveType', 'motiveOptions', 'isDarkMode'],
    template: '<div data-test="motive-selector"></div>',
    emits: ['update:selectedMotiveType']
  }
}))

vi.mock('../ArmorStructureModifier.vue', () => ({
  default: {
    props: ['baseArmor', 'baseStructure', 'armorModification', 'structureModification', 'modificationOptions', 'isDarkMode'],
    template: '<div data-test="armor-structure-modifier"></div>',
    emits: ['update:armorModification', 'update:structureModification']
  }
}))

vi.mock('../WeaponsSelector.vue', () => ({
  default: {
    props: ['selectedWeapons', 'availableWeapons', 'maxSlots', 'upgradeSlotUsage'],
    template: '<div data-test="weapons-selector"></div>',
    emits: ['update:selectedWeapons']
  }
}))

vi.mock('../UpgradesSelector.vue', () => ({
  default: {
    props: ['selectedUpgrades', 'availableUpgrades', 'maxSlots', 'weaponSlotUsage'],
    template: '<div data-test="upgrades-selector"></div>',
    emits: ['update:selectedUpgrades']
  }
}))

// Mock useHevConfiguration
vi.mock('../../../composables/useHevConfiguration', () => ({
  useHevConfiguration: vi.fn(({ initialData, onSubmit }) => {
    const unitName = { value: initialData?.unitName || '' }
    const selectedClass = { value: initialData?.selectedClass || null }
    const selectedMotiveType = { value: initialData?.selectedMotiveType || null }
    const selectedWeapons = { value: initialData?.selectedWeapons || [] }
    const selectedUpgrades = { value: initialData?.selectedUpgrades || [] }
    const armorModification = { value: initialData?.armorModification || 'standard' }
    const structureModification = { value: initialData?.structureModification || 'standard' }

    return {
      unitName,
      selectedClass,
      selectedMotiveType,
      selectedWeapons,
      selectedUpgrades,
      armorModification,
      structureModification,
      baseArmor: { value: 6 },
      baseStructure: { value: 4 },
      baseTonnage: { value: 20 },
      maxSlots: { value: 5 },
      weaponSlotUsage: { value: 2 },
      upgradeSlotUsage: { value: 1 },
      totalSlotUsage: { value: 3 },
      isSlotLimitExceeded: { value: false },
      effectiveArmor: { value: 6 },
      effectiveStructure: { value: 4 },
      isFormValid: { value: true },
      resetForm: vi.fn(),
      submitHev: vi.fn(() => {
        onSubmit({
          unitName: unitName.value,
          selectedClass: selectedClass.value,
          selectedWeapons: selectedWeapons.value
        })
        return true
      })
    }
  })
}))

describe('HevEditor.vue', () => {
  const mockGameRules = {
    classes: [{ name: 'Light' }, { name: 'Medium' }, { name: 'Heavy' }],
    motiveTypes: [{ name: 'Legs' }, { name: 'Tracks' }, { name: 'Wheels' }],
    weapons: [{ name: 'Laser' }, { name: 'Missiles' }],
    upgradePods: [{ name: 'Targeting' }, { name: 'Sensors' }]
  }

  let wrapper

  beforeEach(() => {
    wrapper = mount(HevEditor, {
      props: {
        gameRules: mockGameRules,
        isDarkMode: false
      }
    })
  })

  it('renders in create mode correctly', () => {
    expect(wrapper.find('h2').text()).toContain('Configure HE-V')
    expect(wrapper.find('[data-test="chassis-selector"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="motive-selector"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Add to Roster')
  })

  it('renders in edit mode correctly when editData is provided', async () => {
    const editData = {
      unitName: 'Test HEV',
      selectedClass: mockGameRules.classes[0],
      selectedMotiveType: mockGameRules.motiveTypes[0]
    }

    wrapper = mount(HevEditor, {
      props: {
        gameRules: mockGameRules,
        editData,
        isDarkMode: false
      }
    })

    expect(wrapper.find('h2').text()).toContain('Edit HE-V')
    expect(wrapper.find('button[type="submit"]').text()).toContain('Update HE-V')
  })

  it('emits add-hev event when form is submitted in create mode', async () => {
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('add-hev')).toBeTruthy()
    expect(wrapper.emitted('add-hev')[0]).toBeTruthy()
  })

  it('emits update-hev event when form is submitted in edit mode', async () => {
    wrapper = mount(HevEditor, {
      props: {
        gameRules: mockGameRules,
        editData: { unitName: 'Test HEV' },
        isDarkMode: false
      }
    })

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('update-hev')).toBeTruthy()
    expect(wrapper.emitted('update-hev')[0]).toBeTruthy()
  })

  it('displays warning when slot limit is exceeded', async () => {
    // Override mock to simulate slot limit exceeded
    vi.mocked(useHevConfiguration).mockImplementationOnce(({ onSubmit }) => ({
      unitName: { value: 'Test Unit' },
      selectedClass: { value: mockGameRules.classes[0] },
      selectedMotiveType: { value: mockGameRules.motiveTypes[0] },
      selectedWeapons: { value: [] },
      selectedUpgrades: { value: [] },
      armorModification: { value: 'standard' },
      structureModification: { value: 'standard' },
      baseArmor: { value: 6 },
      baseStructure: { value: 4 },
      baseTonnage: { value: 20 },
      maxSlots: { value: 5 },
      weaponSlotUsage: { value: 4 },
      upgradeSlotUsage: { value: 2 },
      totalSlotUsage: { value: 6 },
      isSlotLimitExceeded: { value: true }, // This is what we're testing
      effectiveArmor: { value: 6 },
      effectiveStructure: { value: 4 },
      isFormValid: { value: false },
      resetForm: vi.fn(),
      submitHev: vi.fn(() => {
        onSubmit({})
        return true
      })
    }))

    wrapper = mount(HevEditor, {
      props: {
        gameRules: mockGameRules,
        isDarkMode: false
      }
    })

    // Check if the warning message appears
    expect(wrapper.text()).toContain('Warning: Slot limit exceeded')

    // The actual text in the component has reactive objects that render in the test output
    // Instead of checking for exact text, we'll check for the presence of the warning
  })
})
