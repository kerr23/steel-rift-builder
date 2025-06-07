import { describe, it, expect } from 'vitest'
import { gameData } from '../gameData.js'

function mockExport(rosterName, roster) {
  // Simulate export logic from App.vue
  return JSON.stringify({ rosterName, roster }, null, 2)
}

function mockImport(jsonString) {
  // Simulate import logic from App.vue
  const importedData = JSON.parse(jsonString)
  if (typeof importedData.rosterName !== 'string' || !Array.isArray(importedData.roster)) {
    throw new Error('Invalid JSON structure')
  }
  // Accept both HE-Vs and support assets
  const validUnits = importedData.roster.filter(
    (unit) =>
      unit && typeof unit === 'object' &&
      (
        (unit.selectedClass && Array.isArray(unit.selectedWeapons) && Array.isArray(unit.selectedUpgrades) && typeof unit.totalUnitTonnage === 'number' && unit.id !== undefined)
        || (unit.isSupportAsset && unit.type && Array.isArray(unit.details) && typeof unit.totalUnitTonnage === 'number' && unit.id !== undefined)
      )
  )
  return { rosterName: importedData.rosterName, roster: validUnits }
}

describe('Roster import/export', () => {
  it('exports and imports a roster with only HE-Vs', () => {
    const hev = {
      unitName: 'Test HE-V',
      selectedClass: gameData.classes[0],
      effectiveArmor: 6,
      effectiveStructure: 4,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'hev-1',
    }
    const json = mockExport('Test Roster', [hev])
    const result = mockImport(json)
    expect(result.rosterName).toBe('Test Roster')
    expect(result.roster.length).toBe(1)
    expect(result.roster[0].unitName).toBe('Test HE-V')
  })

  it('exports and imports a roster with a support asset', () => {
    const supportAsset = {
      isSupportAsset: true,
      type: 'Artillery Barrage',
      details: [
        '<strong>Damage:</strong> 4',
        '<strong>Traits:</strong> Blast(6), Limited(3)',
        '<strong>Targeting Restriction:</strong> Must be within LoS of a unit with <em>Target Designator</em>'
      ],
      totalUnitTonnage: 10,
      id: 'support-1',
    }
    const json = mockExport('Support Roster', [supportAsset])
    const result = mockImport(json)
    expect(result.rosterName).toBe('Support Roster')
    expect(result.roster.length).toBe(1)
    expect(result.roster[0].isSupportAsset).toBe(true)
    expect(result.roster[0].type).toBe('Artillery Barrage')
    expect(result.roster[0].totalUnitTonnage).toBe(10)
  })

  it('exports and imports a mixed roster', () => {
    const hev = {
      unitName: 'Test HE-V',
      selectedClass: gameData.classes[0],
      effectiveArmor: 6,
      effectiveStructure: 4,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'hev-1',
    }
    const supportAsset = {
      isSupportAsset: true,
      type: 'Orbital Laser',
      details: [
        '<strong>Damage:</strong> 6',
        '<strong>Traits:</strong> Limited(1), AP(4)',
        '<strong>Targeting Restriction:</strong> Must be within LoS of a unit with <em>Target Designator</em>'
      ],
      totalUnitTonnage: 10,
      id: 'support-2',
    }
    const json = mockExport('Mixed Roster', [hev, supportAsset])
    const result = mockImport(json)
    expect(result.rosterName).toBe('Mixed Roster')
    expect(result.roster.length).toBe(2)
    expect(result.roster.some(u => u.isSupportAsset)).toBe(true)
    expect(result.roster.some(u => u.unitName === 'Test HE-V')).toBe(true)
  })

  it('skips invalid units on import', () => {
    const hev = {
      unitName: 'Valid HE-V',
      selectedClass: gameData.classes[0],
      effectiveArmor: 6,
      effectiveStructure: 4,
      selectedWeapons: [],
      selectedUpgrades: [],
      totalUnitTonnage: 20,
      id: 'hev-1',
    }
    const invalid = { foo: 'bar' }
    const supportAsset = {
      isSupportAsset: true,
      type: 'Orbital Laser',
      details: [
        '<strong>Damage:</strong> 6',
        '<strong>Traits:</strong> Limited(1), AP(4)',
        '<strong>Targeting Restriction:</strong> Must be within LoS of a unit with <em>Target Designator</em>'
      ],
      totalUnitTonnage: 10,
      id: 'support-2',
    }
    const json = mockExport('Mixed Roster', [hev, invalid, supportAsset])
    const result = mockImport(json)
    expect(result.roster.length).toBe(2)
    expect(result.roster.some(u => u.isSupportAsset)).toBe(true)
    expect(result.roster.some(u => u.unitName === 'Valid HE-V')).toBe(true)
  })
})
