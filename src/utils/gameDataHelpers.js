/**
 * Helpers to determine whether weapons/upgrades declare tonnage for a given
 * HE-V class. This lets the UI hide items that don't apply to the selected
 * class without hardcoding class names.
 */
import { gameData } from '../gameData.js'

function resolveItem(item, kind) {
  if (!item) return null
  if (typeof item === 'string') {
    if (kind === 'weapon') return gameData.weapons.find(w => w.id === item) || null
    return gameData.upgrades.find(u => u.id === item) || null
  }
  return item
}

function hasTonnageForClass(item, className, kind) {
  if (!className) return false
  const resolved = resolveItem(item, kind)
  if (!resolved || typeof resolved !== 'object') return false
  if (!resolved.tonnage || typeof resolved.tonnage !== 'object') return false
  return Object.prototype.hasOwnProperty.call(resolved.tonnage, className)
}

export function isWeaponAvailableForClass(weapon, className) {
  return hasTonnageForClass(weapon, className, 'weapon')
}

export function isUpgradeAvailableForClass(upgrade, className) {
  return hasTonnageForClass(upgrade, className, 'upgrade')
}

export function filterWeaponsForClass(weaponsArray, className) {
  if (!Array.isArray(weaponsArray)) return []
  if (!className) return weaponsArray.slice()
  return weaponsArray.filter(w => isWeaponAvailableForClass(w, className))
}

export function filterUpgradesForClass(upgradesArray, className) {
  if (!Array.isArray(upgradesArray)) return []
  if (!className) return upgradesArray.slice()
  return upgradesArray.filter(u => isUpgradeAvailableForClass(u, className))
}

export default {
  isWeaponAvailableForClass,
  isUpgradeAvailableForClass,
  filterWeaponsForClass,
  filterUpgradesForClass,
}
