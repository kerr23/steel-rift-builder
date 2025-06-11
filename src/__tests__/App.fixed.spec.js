import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import App from '../App.vue'
import { gameData } from '../gameData.js'

describe('App.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock toast
    vi.mock('vue-toastification', () => ({
      useToast: () => ({
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn()
      })
    }))

    // Mock the HEV customizer component to provide the resetForm method
    wrapper = mount(App, {
      global: {
        stubs: {
          HevCustomizer: {
            template: '<div class="hev-customizer-stub"><slot></slot></div>',
            methods: {
              resetForm: vi.fn()
            }
          },
          SupportAssets: true
        }
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app title', () => {
    expect(wrapper.text()).toMatch(/Steel Rift Force Builder/)
  })

  it('shows empty roster message', () => {
    expect(wrapper.text()).toContain('No HE-Vs added to the roster yet.')
  })

  it('adds a HE-V to the roster', async () => {
    // Simulate addHevToRoster
    await wrapper.vm.addHevToRoster({
      unitName: 'Test HE-V',
      selectedClass: gameData.classes[0],
      effectiveArmor: 6, // Light baseArmor
      effectiveStructure: 4, // Light baseStructure
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'test-1',
    })
    expect(wrapper.vm.roster.length).toBe(1)
    expect(wrapper.vm.roster[0].unitName).toBe('Test HE-V')
  })

  it('removes a HE-V from the roster', async () => {
    await wrapper.vm.addHevToRoster({
      unitName: 'To Remove',
      selectedClass: gameData.classes[0],
      effectiveArmor: 6,
      effectiveStructure: 4,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'remove-1',
    })
    await wrapper.vm.removeHevFromRoster('remove-1')
    expect(wrapper.vm.roster.length).toBe(0)
  })

  it('toggles dark mode', async () => {
    expect(wrapper.vm.isDarkMode).toBe(false)
    await wrapper.vm.toggleDarkMode()
    expect(wrapper.vm.isDarkMode).toBe(true)
  })

  it('adds support assets to roster', async () => {
    const supportAsset = {
      isSupportAsset: true,
      type: 'Artillery Barrage',
      details: [
        '<strong>Damage:</strong> 4',
        '<strong>Traits:</strong> Blast(3)',
      ],
      totalUnitTonnage: 10,
      id: 'support-1',
    }

    // Use addSupportAssetToRoster method which actually exists in the component
    await wrapper.vm.addSupportAssetToRoster(supportAsset)

    // Check it was added properly
    expect(wrapper.vm.roster.length).toBe(1)
    expect(wrapper.vm.roster[0].isSupportAsset).toBe(true)
    expect(wrapper.vm.roster[0].type).toBe('Artillery Barrage')

    // Check tonnage is included in roster total
    expect(wrapper.vm.totalRosterBaseTonnage).toBe(10)
  })

  it('calculates total roster tonnage correctly', async () => {
    // Add two different HE-Vs to the roster
    await wrapper.vm.addHevToRoster({
      unitName: 'Light Mech',
      selectedClass: gameData.classes[0], // Light - 20 tons
      effectiveArmor: 6,
      effectiveStructure: 4,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'tonnage-1',
    })

    await wrapper.vm.addHevToRoster({
      unitName: 'Medium Mech',
      selectedClass: gameData.classes[1], // Medium - 30 tons
      effectiveArmor: 8,
      effectiveStructure: 6,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 30,
      id: 'tonnage-2',
    })

    // Check total tonnage calculation
    expect(wrapper.vm.totalRosterBaseTonnage).toBe(50) // 20 + 30
  })
})
