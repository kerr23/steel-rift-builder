import { describe, it, expect, beforeEach } from 'vitest'
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

// Helper to convert older format data
function convertOldFormat(roster) {
  return roster.map(unit => {
    // If unit already has modern format, return as-is
    if (unit.effectiveArmor !== undefined && unit.effectiveStructure !== undefined) {
      return unit
    }

    // Convert from die/step format if needed
    const newUnit = { ...unit }

    // Convert armor die/step to numeric value if needed
    if (unit.effectiveArmorDie && !unit.effectiveArmor) {
      // Simple mapping for test purposes
      const dieValues = {
        'd4': 4,
        'd6': 6,
        'd8': 8,
        'd10': 10,
        'd12': 12
      }
      newUnit.effectiveArmor = dieValues[unit.effectiveArmorDie.die] || 6
      if (unit.effectiveArmorDie.step) {
        newUnit.effectiveArmor += unit.effectiveArmorDie.step
      }
    }

    // Convert structure die/step to numeric value if needed
    if (unit.effectiveStructureDie && !unit.effectiveStructure) {
      const dieValues = {
        'd4': 4,
        'd6': 6,
        'd8': 8,
        'd10': 10,
        'd12': 12
      }
      newUnit.effectiveStructure = dieValues[unit.effectiveStructureDie.die] || 4
      if (unit.effectiveStructureDie.step) {
        newUnit.effectiveStructure += unit.effectiveStructureDie.step
      }
    }

    return newUnit
  })
}

describe('ImportExport Enhanced Tests', () => {
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
        '<strong>Traits:</strong> Blast(3)'
      ],
      totalUnitTonnage: 10,
      id: 'support-1',
    }
    const json = mockExport('Support Asset Test', [supportAsset])
    const result = mockImport(json)
    expect(result.rosterName).toBe('Support Asset Test')
    expect(result.roster.length).toBe(1)
    expect(result.roster[0].type).toBe('Artillery Barrage')
  })

  it('handles import of older roster format versions', () => {
    // Create a roster in an older format
    const oldFormatRoster = {
      rosterName: 'Legacy Roster',
      roster: [
        {
          unitName: 'Old HE-V',
          selectedClass: { name: 'Medium', baseTonnage: 30, baseArmor: 8, baseStructure: 6 },
          // Missing effectiveArmor/effectiveStructure but has die/step format
          effectiveArmorDie: { die: 'd6', step: 1 },
          effectiveStructureDie: { die: 'd4', step: 1 },
          selectedWeapons: [],
          selectedUpgrades: [],
          totalUnitTonnage: 30,
          id: 'old-1',
        }
      ]
    }

    const json = JSON.stringify(oldFormatRoster)
    const result = mockImport(json)

    // Should import successfully
    expect(result.rosterName).toBe('Legacy Roster')
    expect(result.roster.length).toBe(1)

    // Convert the old format
    const convertedRoster = convertOldFormat(result.roster)

    // Check conversion worked
    expect(convertedRoster[0].effectiveArmor).toBe(7) // d6 (6) + step 1
    expect(convertedRoster[0].effectiveStructure).toBe(5) // d4 (4) + step 1
  })

  it('exports data in the expected format', () => {
    const roster = [
      {
        unitName: 'Export Test',
        selectedClass: gameData.classes[1], // Medium
        effectiveArmor: 8,
        effectiveStructure: 6,
        selectedWeapons: [
          { id: 'w_autocannon', name: 'Auto-Cannon', tonnage: 2 }
        ],
        selectedUpgrades: [
          { id: 'u1', name: 'Ablative Armour', tonnage: 1 }
        ],
        totalUnitTonnage: 33,
        id: 'export-1'
      }
    ]

    const json = mockExport('Export Test Roster', roster)
    const parsed = JSON.parse(json)

    // Check structure
    expect(parsed.rosterName).toBe('Export Test Roster')
    expect(parsed.roster[0].unitName).toBe('Export Test')
    expect(parsed.roster[0].selectedWeapons[0].id).toBe('w_autocannon')
    expect(parsed.roster[0].selectedUpgrades[0].id).toBe('u1')
    expect(parsed.roster[0].totalUnitTonnage).toBe(33)
  })

  it('rejects invalid JSON when importing', () => {
    // Invalid JSON format
    const invalidJson = '{ "rosterName": "Bad Roster", roster: [}' // syntax error

    expect(() => {
      mockImport(invalidJson)
    }).toThrow()

    // Valid JSON but wrong structure
    const wrongStructureJson = JSON.stringify({
      rosterName: 123, // should be string
      roster: "not an array" // should be array
    })

    expect(() => {
      mockImport(wrongStructureJson)
    }).toThrow('Invalid JSON structure')
  })

  it('filters out invalid units during import', () => {
    const mixedRoster = {
      rosterName: "Mixed Validity",
      roster: [
        {
          // Valid HE-V
          unitName: 'Valid HE-V',
          selectedClass: gameData.classes[0],
          effectiveArmor: 6,
          effectiveStructure: 4,
          selectedWeapons: [],
          selectedUpgrades: [],
          totalUnitTonnage: 20,
          id: 'valid-1'
        },
        {
          // Invalid - missing required fields
          unitName: 'Invalid HE-V',
          id: 'invalid-1'
        },
        {
          // Valid support asset
          isSupportAsset: true,
          type: 'Valid Support',
          details: ['<strong>Traits:</strong> Test'],
          totalUnitTonnage: 5,
          id: 'valid-2'
        }
      ]
    }

    const json = JSON.stringify(mixedRoster)
    const result = mockImport(json)

    // Should only have the valid units
    expect(result.roster.length).toBe(2)
    expect(result.roster[0].id).toBe('valid-1')
    expect(result.roster[1].id).toBe('valid-2')
  })
})
