import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHevConfiguration } from '../useHevConfiguration'

// Mock errorService
vi.mock('../../services/errorService', () => ({
  useErrorService: vi.fn(() => ({
    handleValidationError: vi.fn(),
    handleError: vi.fn()
  }))
}))

// Mock validateHEV
vi.mock('../../services/unitValidation', () => ({
  validateHEV: vi.fn(data => {
    // Simple validation logic for testing
    const errors = []
    if (!data.unitName) errors.push('Unit name is required')
    if (!data.selectedClass) errors.push('Class is required')
    if (!data.selectedMotiveType) errors.push('Motive type is required')

    return {
      isValid: errors.length === 0,
      errors
    }
  })
}))

describe('useHevConfiguration', () => {
  let hevConfig
  let onSubmitMock

  beforeEach(() => {
    onSubmitMock = vi.fn().mockReturnValue(true)
    hevConfig = useHevConfiguration({
      onSubmit: onSubmitMock
    })
  })

  it('initializes with default values', () => {
    expect(hevConfig.unitName.value).toBe('')
    expect(hevConfig.selectedClass.value).toBeNull()
    expect(hevConfig.selectedMotiveType.value).toBeNull()
    expect(hevConfig.selectedWeapons.value).toEqual([])
    expect(hevConfig.selectedUpgrades.value).toEqual([])
  })

  it('initializes with provided initial data', () => {
    const initialData = {
      unitName: 'Test HEV',
      selectedClass: { name: 'Light', baseArmor: 6, baseStructure: 4, baseSlots: 4, baseTonnage: 20 },
      selectedMotiveType: { name: 'Legs', slotModifier: 1 },
      selectedWeapons: [{ name: 'Laser', slots: 1 }],
      selectedUpgrades: [],
      armorModification: 'enhanced',
      structureModification: 'standard',
      id: 'test-id'
    }

    const config = useHevConfiguration({
      initialData,
      onSubmit: onSubmitMock,
      isEditMode: true
    })

    expect(config.unitName.value).toBe('Test HEV')
    expect(config.selectedClass.value).toEqual(initialData.selectedClass)
    expect(config.selectedMotiveType.value).toEqual(initialData.selectedMotiveType)
    expect(config.selectedWeapons.value).toEqual(initialData.selectedWeapons)
    expect(config.armorModification.value).toBe('enhanced')
  })

  it('calculates correct slot usage', () => {
    // Setup test data
    hevConfig.selectedClass.value = { name: 'Light', baseSlots: 4 }
    hevConfig.selectedMotiveType.value = { name: 'Legs', slotModifier: 1 }
    hevConfig.selectedWeapons.value = [
      { name: 'Laser', slots: 1 },
      { name: 'Missiles', slots: 2 }
    ]
    hevConfig.selectedUpgrades.value = [
      { name: 'Targeting', slots: 1 }
    ]

    expect(hevConfig.maxSlots.value).toBe(5)
    expect(hevConfig.weaponSlotUsage.value).toBe(3)
    expect(hevConfig.upgradeSlotUsage.value).toBe(1)
    expect(hevConfig.totalSlotUsage.value).toBe(4)
    expect(hevConfig.isSlotLimitExceeded.value).toBe(false)
  })

  it('detects when slot limit is exceeded', () => {
    // Setup test data
    hevConfig.selectedClass.value = { name: 'Light', baseSlots: 4 }
    hevConfig.selectedMotiveType.value = { name: 'Legs', slotModifier: 1 }
    hevConfig.selectedWeapons.value = [
      { name: 'Laser', slots: 2 },
      { name: 'Missiles', slots: 3 },
      { name: 'AutoCannon', slots: 1 }
    ]

    expect(hevConfig.maxSlots.value).toBe(5)
    expect(hevConfig.totalSlotUsage.value).toBe(6)
    expect(hevConfig.isSlotLimitExceeded.value).toBe(true)
  })

  it('correctly calculates modified armor and structure', () => {
    hevConfig.selectedClass.value = { name: 'Light', baseArmor: 6, baseStructure: 4 }
    hevConfig.armorModification.value = 'enhanced'
    hevConfig.structureModification.value = 'lightweight'

    expect(hevConfig.effectiveArmor.value).toBe(8)
    expect(hevConfig.effectiveStructure.value).toBe(2)
  })

  it('validates form correctness', () => {
    // Invalid state
    expect(hevConfig.isFormValid.value).toBe(false)

    // Add required fields
    hevConfig.unitName.value = 'Test HEV'
    hevConfig.selectedClass.value = { name: 'Light', baseSlots: 4 }
    hevConfig.selectedMotiveType.value = { name: 'Legs', slotModifier: 1 }

    // Now should be valid
    expect(hevConfig.isFormValid.value).toBe(true)

    // Make invalid by exceeding slot limit
    hevConfig.selectedWeapons.value = [
      { name: 'Laser', slots: 3 },
      { name: 'Missiles', slots: 3 }
    ]

    expect(hevConfig.isSlotLimitExceeded.value).toBe(true)
    expect(hevConfig.isFormValid.value).toBe(false)
  })

  it('submits valid HEV data', () => {
    // Set up valid HEV data
    hevConfig.unitName.value = 'Test HEV'
    hevConfig.selectedClass.value = { name: 'Light', baseArmor: 6, baseStructure: 4, baseTonnage: 20, baseSlots: 4 }
    hevConfig.selectedMotiveType.value = { name: 'Legs', slotModifier: 1 }

    const result = hevConfig.submitHev()

    expect(result).toBe(true)
    expect(onSubmitMock).toHaveBeenCalled()

    // Check reset was called since we're not in edit mode
    expect(hevConfig.unitName.value).toBe('')
  })

  it('resets form correctly', () => {
    // Set values
    hevConfig.unitName.value = 'Test HEV'
    hevConfig.selectedClass.value = { name: 'Light' }
    hevConfig.selectedMotiveType.value = { name: 'Legs' }
    hevConfig.selectedWeapons.value = [{ name: 'Laser' }]
    hevConfig.armorModification.value = 'enhanced'

    // Reset
    hevConfig.resetForm()

    // Check values are reset
    expect(hevConfig.unitName.value).toBe('')
    expect(hevConfig.selectedClass.value).toBeNull()
    expect(hevConfig.selectedMotiveType.value).toBeNull()
    expect(hevConfig.selectedWeapons.value).toEqual([])
    expect(hevConfig.armorModification.value).toBe('standard')
  })
})
