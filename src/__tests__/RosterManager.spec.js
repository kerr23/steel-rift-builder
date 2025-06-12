import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RosterManager from '../components/roster/RosterManager.vue';
import { gameData } from '../gameData';

describe('RosterManager.vue', () => {
  let wrapper;
  const mockRoster = [
    {
      id: 'unit-1',
      unitName: 'Test Unit 1',
      selectedClass: { name: 'Light' },
      totalUnitTonnage: 20,
      selectedWeapons: [],
      selectedUpgrades: []
    },
    {
      id: 'unit-2',
      unitName: 'Test Unit 2',
      selectedClass: { name: 'Medium' },
      totalUnitTonnage: 30,
      selectedWeapons: [],
      selectedUpgrades: []
    },
    {
      id: 'support-1',
      type: 'Artillery Barrage',
      isSupportAsset: true,
      totalUnitTonnage: 10,
      details: []
    }
  ];

  beforeEach(() => {
    wrapper = mount(RosterManager, {
      props: {
        rosterName: 'Test Roster',
        roster: [...mockRoster], // Create a new copy each time
        gameRules: gameData
      },
      global: {
        stubs: {
          Button: true,
          RosterItem: true
        }
      }
    });
  });

  it('renders the roster items', () => {
    const rosterItems = wrapper.findAllComponents({ name: 'RosterItem' });
    expect(rosterItems.length).toBe(3);
  });  it('emits reorder-roster event when onDrop is called', async () => {
    // Set drag state directly
    wrapper.vm.draggedItemIndex = 0;
    await wrapper.vm.onDrop(2);

    // Check that the event was emitted with correct payload
    const emitted = wrapper.emitted('reorder-roster');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual({ fromIndex: 0, toIndex: 2 });
  });

  it('does not emit reorder-roster event when dropped on the same item', async () => {
    // Set drag state directly
    wrapper.vm.draggedItemIndex = 1;
    await wrapper.vm.onDrop(1);

    const emitted = wrapper.emitted('reorder-roster');
    expect(emitted).toBeFalsy();
  });

  it('resets drag state after drag ends', async () => {
    // Set drag state directly
    wrapper.vm.draggedItemIndex = 0;
    expect(wrapper.vm.draggedItemIndex).toBe(0);

    await wrapper.vm.onDragEnd();
    expect(wrapper.vm.draggedItemIndex).toBe(null);
  });

  it('calculates total tonnage correctly', () => {
    const totalTonnage = wrapper.vm.totalRosterBaseTonnage;
    // 20 (Light) + 30 (Medium) + 10 (Support Asset)
    expect(totalTonnage).toBe(60);
  });
});
