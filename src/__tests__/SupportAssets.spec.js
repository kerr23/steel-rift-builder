import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import SupportAssets from '../components/SupportAssets.vue'
import { UL_HEV_TYPES, UL_HEV_UPGRADE_PODS, OFF_TABLE_TYPES } from '../gameData.js'

// Mock child components
vi.mock('../components/ui/FormSelect.vue', () => ({
  default: {
    props: ['modelValue', 'id', 'label'],
    template: `
      <div data-testid="form-select" class="form-select-mock">
        <label v-if="label">{{ label }}</label>
        <select
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <slot></slot>
        </select>
      </div>
    `,
    emits: ['update:modelValue']
  }
}))

vi.mock('../components/ui/Button.vue', () => ({
  default: {
    props: ['variant', 'size', 'disabled'],
    template: `
      <button
        data-testid="button-mock"
        :class="['btn', variant]"
        :disabled="disabled"
        @click="$emit('click')"
      >
        <slot></slot>
      </button>
    `,
    emits: ['click']
  }
}))

describe('SupportAssets', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(SupportAssets)
  })

  it('renders the component correctly', () => {
    expect(wrapper.find('h2').text()).toContain('Support Assets')
    // We expect at least one FormSelect component to be rendered
    expect(wrapper.findAll('[data-testid="form-select"]').length).toBeGreaterThan(0)
  })

  it('displays off-table support options when selected', async () => {
    // Set the class selection to off-table
    wrapper.vm.selectedClass = 'off-table'
    await wrapper.vm.$nextTick()

    // Check if off-table type selection is shown
    expect(wrapper.html()).toContain('Off Table Support Type:')
    expect(wrapper.findAll('[data-testid="button-mock"]').length).toBeGreaterThan(0)
  })

  it('displays ultra-light options when selected', async () => {
    // Set the class selection to ultra-light
    wrapper.vm.selectedClass = 'ultra-light'
    await wrapper.vm.$nextTick()

    // Check if ultra-light content is shown
    expect(wrapper.html()).toContain('Select 3 Ultra-Light HE-Vs for Squadron')
    expect(wrapper.findAll('.ulhev-card').length).toBe(UL_HEV_TYPES.length)
  })

  it('emits add-support-asset event when adding off-table support', async () => {
    // Setup component state
    wrapper.vm.selectedClass = 'off-table'
    wrapper.vm.selectedOffTableType = 'artillery-barrage'
    await wrapper.vm.$nextTick()

    // Call the method directly - this simulates clicking the button
    wrapper.vm.addSupportAsset()

    // Check emitted event
    const emitted = wrapper.emitted('add-support-asset')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toHaveProperty('class', 'Off Table Support')
    expect(emitted[0][0]).toHaveProperty('type', 'Artillery Barrage')
    expect(emitted[0][0].details).toContain('<strong>Damage:</strong> 4')
    expect(emitted[0][0].details).toContain('<strong>Traits:</strong> Blast(6), Limited(3)')
    expect(emitted[0][0].details).toContain('<strong>Tonnage:</strong> 10T')
  })

  it('allows selecting up to 3 ultra-light HE-Vs for a squadron', async () => {
    // Setup component state
    wrapper.vm.selectedClass = 'ultra-light'
    await wrapper.vm.$nextTick()

    // Directly call the add method three times
    const firstTypeId = UL_HEV_TYPES[0].id
    wrapper.vm.addUltraLightType(firstTypeId)
    wrapper.vm.addUltraLightType(firstTypeId)
    wrapper.vm.addUltraLightType(firstTypeId)

    // Check that we have 3 units selected
    expect(wrapper.vm.selectedUltraLightTypes).toHaveLength(3)

    // Try to add a 4th (should still be 3)
    wrapper.vm.addUltraLightType(firstTypeId)
    expect(wrapper.vm.selectedUltraLightTypes).toHaveLength(3)
  })

  it('emits add-support-asset event when adding ultra-light squadron', async () => {
    // Setup component state
    wrapper.vm.selectedClass = 'ultra-light'
    await wrapper.vm.$nextTick()

    // Set up squadron and upgrade pod directly
    const firstTypeId = UL_HEV_TYPES[0].id
    wrapper.vm.selectedUltraLightTypes = [firstTypeId, firstTypeId, firstTypeId]
    wrapper.vm.selectedUpgradePodId = UL_HEV_UPGRADE_PODS[0].id

    await wrapper.vm.$nextTick()

    // Call the method directly
    wrapper.vm.addUltraLightSquadron()

    // Check emitted event
    const emitted = wrapper.emitted('add-support-asset')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toHaveProperty('class', 'Ultra-Light HE-V Squadron')
    expect(emitted[0][0]).toHaveProperty('upgradePodId', UL_HEV_UPGRADE_PODS[0].id)
    expect(emitted[0][0].details).toContain('<strong>Tonnage:</strong> 10T')

    // Check that selections were reset
    expect(wrapper.vm.selectedUltraLightTypes).toHaveLength(0)
    expect(wrapper.vm.selectedUpgradePodId).toBe('')
  })
})
