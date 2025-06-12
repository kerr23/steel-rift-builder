// src/utils/formatters.js
// Utility functions for formatting data display

/**
 * Formats a trait object for display
 *
 * @param {Object|String} trait - Trait object or string
 * @param {String} forClassName - Optional HEV class name for context-specific formatting
 * @returns {String} - Formatted trait display text
 */
export function formatTraitDisplay(trait) {
  if (!trait || typeof trait !== 'object' || !trait.name) return 'Unknown Trait'

  // Handle Limited trait with numeric value
  if (trait.name === 'Limited' && typeof trait.value === 'number') {
    return `Limited(${Array(trait.value).fill('○').join('')})`
  }

  // Handle class-specific trait values
  if (typeof trait.value === 'object' && trait.value !== null) {
    const currentClassName = getCurrentClassName()
    if (currentClassName && trait.value[currentClassName] !== undefined) {
      return `${trait.name} ${trait.value[currentClassName]}`
    } else {
      return `${trait.name} (${Object.entries(trait.value)
        .map(([k, v]) => `${k[0]}:${v}`)
        .join('/')})`
    }
  }

  // Handle simple trait with value
  if (trait.value !== undefined) return `${trait.name} ${trait.value}`

  // Default case - just the trait name
  return trait.name
}

/**
 * Helper function to get the current HEV class name from context
 * This should be replaced with an actual implementation depending on
 * how your component state management works
 */
function getCurrentClassName() {
  // In a real implementation, this would access component state
  // or be passed as a parameter
  return null
}

/**
 * Calculates the cost for the nth weapon of a specific type
 *
 * @param {Object} weaponData - The weapon configuration object
 * @param {number} n - The weapon count (1-based)
 * @param {string} className - The HE-V class name
 * @returns {number} - The calculated cost in tonnage
 */
export function calculateNthWeaponCost(weaponData, n, className) {
  if (!weaponData || !className) return 0

  const baseCost = typeof weaponData.tonnage === 'object' ?
    (weaponData.tonnage[className] ?? 0) :
    (typeof weaponData.tonnage === 'number' ? weaponData.tonnage : 0)

  if (n <= 1) return baseCost

  // Calculate penalty for duplicate weapons
  const penaltyAmount = Math.ceil(baseCost * 0.5)
  return baseCost + (n - 1) * penaltyAmount
}

/**
 * Generate a unique ID
 * @returns {String} - A unique ID string
 */
export function generateUniqueId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
