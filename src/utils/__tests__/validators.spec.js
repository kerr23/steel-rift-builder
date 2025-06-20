// src/utils/__tests__/validators.spec.js
import { describe, it, expect } from 'vitest'
import {
  validateHevData,
  validateSupportAssetData,
  validateRosterImport
} from '../validators'

describe('HE-V validators', () => {
  it('validates correct HE-V data', () => {
    const validHev = {
      selectedClass: { name: 'Light' },
      selectedMotiveType: { id: 'm1', name: 'Biped' },
      effectiveArmor: 6,
      effectiveStructure: 4,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20
    }

    const result = validateHevData(validHev)
    expect(result.isValid).toBe(true)
  })

  it('rejects missing HE-V data', () => {
    const result = validateHevData(null)
    expect(result.isValid).toBe(false)
    expect(result.message).toContain('missing')
  })

  it('rejects HE-V missing class', () => {
    const invalidHev = {
      selectedClass: null,
      selectedMotiveType: { id: 'm1', name: 'Biped' },
      effectiveArmor: 6,
      effectiveStructure: 4,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20
    }

    const result = validateHevData(invalidHev)
    expect(result.isValid).toBe(false)
    expect(result.message).toContain('class')
  })

  it('rejects HE-V with invalid armor', () => {
    const invalidHev = {
      selectedClass: { name: 'Light' },
      selectedMotiveType: { id: 'm1', name: 'Biped' },
      effectiveArmor: -1, // Invalid
      effectiveStructure: 4,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20
    }

    const result = validateHevData(invalidHev)
    expect(result.isValid).toBe(false)
    expect(result.message).toContain('armor')
  })
})

describe('Support Asset validators', () => {
  it('validates correct support asset data', () => {
    const validAsset = {
      type: 'Artillery Barrage',
      details: ['<strong>Damage:</strong> 4', '<strong>Traits:</strong> Blast(3)'],
      isSupportAsset: true
    }

    const result = validateSupportAssetData(validAsset)
    expect(result.isValid).toBe(true)
  })

  it('rejects support asset missing type', () => {
    const invalidAsset = {
      details: ['<strong>Damage:</strong> 4'],
      isSupportAsset: true
    }

    const result = validateSupportAssetData(invalidAsset)
    expect(result.isValid).toBe(false)
    expect(result.message).toContain('type')
  })
})

describe('Roster import validators', () => {
  it('validates correct roster import data', () => {
    const validImport = {
      rosterName: 'Test Roster',
      roster: [
        {
          id: 'hev-1',
          selectedClass: { name: 'Light' },
          selectedWeapons: [],
          selectedUpgrades: [],
          totalUnitTonnage: 20
        },
        {
          id: 'support-1',
          isSupportAsset: true,
          type: 'Artillery Barrage',
          details: ['<strong>Damage:</strong> 4'],
          totalUnitTonnage: 10
        }
      ]
    }

    const result = validateRosterImport(validImport)
    expect(result.isValid).toBe(true)
    expect(result.validUnits).toHaveLength(2)
  })

  it('filters out invalid units from import', () => {
    const mixedImport = {
      rosterName: 'Test Roster',
      roster: [
        {
          id: 'hev-1',
          selectedClass: { name: 'Light' },
          selectedWeapons: [],
          selectedUpgrades: [],
          totalUnitTonnage: 20
        },
        {
          // Invalid unit (missing required properties)
          id: 'invalid-1'
        }
      ]
    }

    const result = validateRosterImport(mixedImport)
    expect(result.isValid).toBe(true)
    expect(result.validUnits).toHaveLength(1)
  })
})
