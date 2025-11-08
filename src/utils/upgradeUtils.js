/**
 * Utility helpers for upgrade detection and related checks.
 * Keep detection tolerant of `selectedUpgrades` entries being either string ids
 * or objects with an `id` property. Also honor an explicit `unit.hasJumpJets` flag.
 *
 * Example usage:
 *   import { hasJumpJets } from '../utils/upgradeUtils'
 *   if (hasJumpJets(unit.selectedUpgrades, unit)) { /* show jump value * / }
 */

/**
 * Check whether the provided selectedUpgrades list contains an upgrade with the
 * given id. Accepts upgrade entries as either plain string ids or objects with
 * an `id` property.
 *
 * @param {Array<string|Object>} selectedUpgrades - upgrades array (strings or objects)
 * @param {string} id - upgrade id to look for (e.g. 'u6')
 * @returns {boolean} true when the id is found
 */
export function hasUpgradeById(selectedUpgrades, id) {
  if (!Array.isArray(selectedUpgrades)) return false
  return selectedUpgrades.some((upg) => {
    const upgId = typeof upg === 'string' ? upg : upg?.id
    return upgId === id
  })
}

/**
 * Returns true when the unit has Jump Jets. Checks an explicit `unit.hasJumpJets`
 * flag first, then falls back to scanning `selectedUpgrades` for the canonical
 * Jump Jets id 'u6'.
 *
 * @param {Array<string|Object>} selectedUpgrades - upgrades array (strings or objects)
 * @param {Object} unit - optional unit-level flags (may include unit.hasJumpJets)
 * @returns {boolean}
 */
export function hasJumpJets(selectedUpgrades, unit = {}) {
  if (unit && unit.hasJumpJets) return true
  return hasUpgradeById(selectedUpgrades, 'u6')
}

export default { hasUpgradeById, hasJumpJets }
