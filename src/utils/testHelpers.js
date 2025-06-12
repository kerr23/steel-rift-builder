// src/utils/testHelpers.js
// Helper functions for creating test data

/**
 * Creates a mock HE-V object for testing
 *
 * @param {Object} overrides - Properties to override in the default mock
 * @returns {Object} - A mock HE-V object
 */
export const createMockHev = (overrides = {}) => ({
  unitName: 'Test HE-V',
  selectedClass: { name: 'Light', baseArmor: 6, baseStructure: 4, defenseRoll: '3+' },
  selectedMotiveType: { name: 'Biped' },
  selectedWeapons: [],
  selectedUpgrades: [],
  effectiveArmor: 6,
  effectiveStructure: 4,
  totalUnitTonnage: 20,
  id: 'test-1',
  ...overrides
})

/**
 * Creates a mock Support Asset object for testing
 *
 * @param {Object} overrides - Properties to override in the default mock
 * @returns {Object} - A mock Support Asset object
 */
export const createMockSupportAsset = (overrides = {}) => ({
  isSupportAsset: true,
  type: 'Artillery Barrage',
  details: [
    '<strong>Damage:</strong> 4',
    '<strong>Traits:</strong> Blast(3)'
  ],
  totalUnitTonnage: 10,
  id: 'support-1',
  ...overrides
})

/**
 * Creates a roster with both HE-Vs and Support Assets for testing
 *
 * @param {Object} options - Configuration options
 * @param {Number} options.hevCount - Number of HE-Vs to include (default: 2)
 * @param {Number} options.supportAssetCount - Number of support assets to include (default: 1)
 * @returns {Array} - A mock roster array
 */
export const createMockRoster = ({ hevCount = 2, supportAssetCount = 1 } = {}) => {
  const roster = []

  // Add HE-Vs
  for (let i = 0; i < hevCount; i++) {
    roster.push(createMockHev({
      unitName: `Test HE-V ${i + 1}`,
      id: `hev-${i + 1}`
    }))
  }

  // Add Support Assets
  for (let i = 0; i < supportAssetCount; i++) {
    roster.push(createMockSupportAsset({
      type: `Support Asset ${i + 1}`,
      id: `support-${i + 1}`
    }))
  }

  return roster
}
