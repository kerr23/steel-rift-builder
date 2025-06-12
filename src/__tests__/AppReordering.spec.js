import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';
import { gameData } from '../gameData';

// Mock vue-toastification
vi.mock('vue-toastification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  })
}));

// Mock components
vi.mock('../components/hevCustomizer.vue', () => ({
  default: {
    name: 'HevCustomizer',
    template: '<div>HEV Customizer</div>',
    methods: {
      resetForm: vi.fn(),
      loadHevForEditing: vi.fn()
    }
  }
}));

vi.mock('../components/SupportAssets.vue', () => ({
  default: {
    name: 'SupportAssets',
    template: '<div>Support Assets</div>'
  }
}));

describe('App.vue reordering functionality', () => {
  let wrapper;

  beforeEach(() => {
    // Reset local storage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn()
      },
      writable: true
    });

    wrapper = mount(App, {
      global: {
        stubs: ['RosterManager', 'TabNavigation', 'DarkModeToggle', 'Footer']
      }
    });
  });

  it('reorders roster items correctly', async () => {
    // Add test units to the roster
    await wrapper.vm.addHevToRoster({
      unitName: 'Unit 1',
      selectedClass: gameData.classes[0], // Light - 20 tons
      totalUnitTonnage: 20,
      selectedWeapons: [],
      selectedUpgrades: [],
      id: 'test-1'
    });

    await wrapper.vm.addHevToRoster({
      unitName: 'Unit 2',
      selectedClass: gameData.classes[1], // Medium - 30 tons
      totalUnitTonnage: 30,
      selectedWeapons: [],
      selectedUpgrades: [],
      id: 'test-2'
    });

    await wrapper.vm.addHevToRoster({
      unitName: 'Unit 3',
      selectedClass: gameData.classes[2], // Heavy - 40 tons
      totalUnitTonnage: 40,
      selectedWeapons: [],
      selectedUpgrades: [],
      id: 'test-3'
    });

    // Initial order check
    expect(wrapper.vm.roster[0].id).toBe('test-1');
    expect(wrapper.vm.roster[1].id).toBe('test-2');
    expect(wrapper.vm.roster[2].id).toBe('test-3');

    // Reorder the roster: move first item to the end
    await wrapper.vm.reorderRoster({ fromIndex: 0, toIndex: 2 });

    // Check new order
    expect(wrapper.vm.roster[0].id).toBe('test-2');
    expect(wrapper.vm.roster[1].id).toBe('test-3');
    expect(wrapper.vm.roster[2].id).toBe('test-1');

    // Reorder again: move last item to the middle
    await wrapper.vm.reorderRoster({ fromIndex: 2, toIndex: 1 });

    // Check final order
    expect(wrapper.vm.roster[0].id).toBe('test-2');
    expect(wrapper.vm.roster[1].id).toBe('test-1');
    expect(wrapper.vm.roster[2].id).toBe('test-3');
  });

  it('handles invalid reordering parameters gracefully', async () => {
    // Add test units to the roster
    await wrapper.vm.addHevToRoster({
      unitName: 'Unit 1',
      selectedClass: gameData.classes[0],
      totalUnitTonnage: 20,
      selectedWeapons: [],
      selectedUpgrades: [],
      id: 'test-1'
    });

    await wrapper.vm.addHevToRoster({
      unitName: 'Unit 2',
      selectedClass: gameData.classes[1],
      totalUnitTonnage: 30,
      selectedWeapons: [],
      selectedUpgrades: [],
      id: 'test-2'
    });

    // Initial state
    const initialRoster = [...wrapper.vm.roster];

    // Test with out-of-range index
    await wrapper.vm.reorderRoster({ fromIndex: 5, toIndex: 0 });
    expect(wrapper.vm.roster).toEqual(initialRoster);

    // Test with negative index
    await wrapper.vm.reorderRoster({ fromIndex: -1, toIndex: 0 });
    expect(wrapper.vm.roster).toEqual(initialRoster);

    // Test with same from and to indices
    await wrapper.vm.reorderRoster({ fromIndex: 1, toIndex: 1 });
    expect(wrapper.vm.roster).toEqual(initialRoster);

    // Test with undefined indices
    await wrapper.vm.reorderRoster({});
    expect(wrapper.vm.roster).toEqual(initialRoster);
  });
});
