// src/services/hevService.js
import { findClassByName, findWeaponById, findUpgradeById } from '../gameData.js';
import { memoizeWithMaxSize } from '../utils/memoize.js';

/**
 * Calculate the Nth weapon cost with progressive penalty
 * @param {Object} weaponData - Weapon data
 * @param {number} n - Which instance (1st, 2nd, etc.)
 * @param {string} className - HE-V class name
 * @returns {number} - Tonnage cost
 */
const calculateNthWeaponCost = memoizeWithMaxSize((weaponData, n, className) => {
  // Early return for invalid inputs
  if (n <= 0 || !weaponData || !className || !weaponData.tonnage) {
    return 0;
  }

  // Get base cost
  let baseCost = 0;
  if (typeof weaponData.tonnage === 'object' && weaponData.tonnage !== null) {
    baseCost = weaponData.tonnage[className] || 0;
  } else if (typeof weaponData.tonnage === 'number') {
    baseCost = weaponData.tonnage;
  }

  // Apply progressive penalty for multiples (progressive +1T cost)
  return baseCost + Math.max(0, n - 1);
}, 100, (weaponData, n, className) => `${weaponData?.id}-${n}-${className}`);

/**
 * Calculate total weapon costs for a HE-V
 * @param {Array} selectedWeapons - Array of selected weapons
 * @param {string} className - HE-V class name
 * @returns {Object} - Total tonnage and slots
 */
function calculateWeaponsTonnageAndSlots(selectedWeapons, className) {
  if (!selectedWeapons || !className) {
    return { totalTonnage: 0, totalSlots: 0 };
  }

  let totalTonnage = 0;
  const counts = new Map();

  // Count occurrences of each weapon
  selectedWeapons.forEach((weapon) => {
    if (weapon && weapon.id) counts.set(weapon.id, (counts.get(weapon.id) || 0) + 1);
  });

  // Calculate tonnage for each weapon group
  for (const [weaponId, quantity] of counts.entries()) {
    const weaponData = findWeaponById(weaponId);
    if (weaponData) {
      let groupTonnage = 0;
      for (let i = 1; i <= quantity; i++) {
        groupTonnage += calculateNthWeaponCost(weaponData, i, className);
      }
      totalTonnage += groupTonnage;
    }
  }

  return {
    totalTonnage,
    totalSlots: selectedWeapons.length
  };
}

/**
 * Calculate total upgrade costs for a HE-V
 * @param {Array} selectedUpgrades - Array of selected upgrades
 * @param {string} className - HE-V class name
 * @returns {Object} - Total tonnage and slots
 */
function calculateUpgradesTonnageAndSlots(selectedUpgrades, className) {
  if (!selectedUpgrades || !className) {
    return { totalTonnage: 0, totalSlots: 0 };
  }

  let totalTonnage = 0;

  selectedUpgrades.forEach((upgrade) => {
    if (typeof upgrade.tonnage === 'object' && upgrade.tonnage !== null) {
      if (className && upgrade.tonnage[className] !== undefined) {
        totalTonnage += upgrade.tonnage[className];
      }
    } else if (typeof upgrade.tonnage === 'number') {
      totalTonnage += upgrade.tonnage;
    }
  });

  return {
    totalTonnage,
    totalSlots: selectedUpgrades.length
  };
}

/**
 * Calculate effective armor value based on base value and modification
 * @param {number} baseArmor - Base armor value
 * @param {string} modification - Modification type (standard, stripped, reinforced)
 * @returns {number} - Effective armor value
 */
function calculateEffectiveArmor(baseArmor, modification) {
  if (typeof baseArmor !== 'number') return 0;

  let val = baseArmor;
  if (modification === 'stripped') val -= 2;
  if (modification === 'reinforced') val += 2;

  return Math.max(0, val);
}

/**
 * Calculate effective structure value based on base value and modification
 * @param {number} baseStructure - Base structure value
 * @param {string} modification - Modification type (standard, stripped, reinforced)
 * @returns {number} - Effective structure value
 */
function calculateEffectiveStructure(baseStructure, modification) {
  if (typeof baseStructure !== 'number') return 0;

  let val = baseStructure;
  if (modification === 'stripped') val -= 2;
  if (modification === 'reinforced') val += 2;

  return Math.max(0, val);
}

/**
 * Calculate structure damage markers for threshold displays
 * @param {number} structureValue - Structure value
 * @param {number} percentage - Percentage of damage (0-1)
 * @returns {number} - Structure marker position
 */
function calculateStructureMarker(structureValue, percentage) {
  if (!structureValue || structureValue <= 0) return 0;
  return structureValue > 0 ? structureValue - Math.floor(structureValue * percentage) + 1 : 0;
}

/**
 * Create a complete HE-V unit with calculated values
 * @param {Object} data - Unit input data
 * @returns {Object} - Complete HE-V unit data
 */
function createHevUnit(data) {
  const {
    unitName,
    selectedClass,
    selectedMotiveType,
    armorModification,
    structureModification,
    selectedWeapons,
    selectedUpgrades,
    id
  } = data;

  const cls = selectedClass ? findClassByName(selectedClass.name) : null;

  if (!cls) {
    throw new Error('Invalid class selected');
  }

  const baseArmor = cls.baseArmor;
  const baseStructure = cls.baseStructure;

  const effectiveArmor = calculateEffectiveArmor(baseArmor, armorModification);
  const effectiveStructure = calculateEffectiveStructure(baseStructure, structureModification);

  const armorCost = effectiveArmor;
  const structureCost = effectiveStructure;

  const weaponDetails = calculateWeaponsTonnageAndSlots(selectedWeapons, cls.name);
  const upgradeDetails = calculateUpgradesTonnageAndSlots(selectedUpgrades, cls.name);

  const usedSlots = weaponDetails.totalSlots + upgradeDetails.totalSlots;
  const motiveSlotModifier = selectedMotiveType?.slotModifier || 0;
  const maxSlots = cls.baseSlots + motiveSlotModifier;

  const totalUnitTonnageUsed = armorCost + structureCost +
    weaponDetails.totalTonnage + upgradeDetails.totalTonnage;

  return {
    unitName,
    id: id || `hev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    selectedClass,
    selectedMotiveType,
    effectiveArmor,
    effectiveStructure,
    selectedWeapons,
    selectedUpgrades,
    totalUnitTonnage: totalUnitTonnageUsed,
    usedSlots,
    maxSlots
  };
}

/**
 * Validate a HEV unit configuration
 * @param {Object} hevData - HE-V unit data
 * @returns {Object} - Validation result with isValid and message
 */
function validateHevUnit(hevData) {
  if (!hevData.selectedClass) {
    return { isValid: false, message: 'Class must be selected' };
  }

  if (!hevData.selectedMotiveType) {
    return { isValid: false, message: 'Motive type must be selected' };
  }

  const effectiveArmor = typeof hevData.effectiveArmor === 'number' ? hevData.effectiveArmor : 0;
  const effectiveStructure = typeof hevData.effectiveStructure === 'number' ? hevData.effectiveStructure : 0;

  if (effectiveArmor <= 0) {
    return { isValid: false, message: 'Armor cannot be zero or negative' };
  }

  if (effectiveStructure <= 0) {
    return { isValid: false, message: 'Structure cannot be zero or negative' };
  }

  const baseTonnage = hevData.selectedClass.baseTonnage;
  const totalTonnageUsed = hevData.totalUnitTonnage;

  if (totalTonnageUsed > baseTonnage) {
    return { isValid: false, message: `Tonnage limit exceeded (${totalTonnageUsed}/${baseTonnage})` };
  }

  const baseSlots = hevData.maxSlots;
  const usedSlots = hevData.usedSlots;

  if (usedSlots > baseSlots) {
    return { isValid: false, message: `Slot limit exceeded (${usedSlots}/${baseSlots})` };
  }

  return { isValid: true, message: 'HE-V configuration is valid' };
}

export {
  calculateNthWeaponCost,
  calculateWeaponsTonnageAndSlots,
  calculateUpgradesTonnageAndSlots,
  calculateEffectiveArmor,
  calculateEffectiveStructure,
  calculateStructureMarker,
  createHevUnit,
  validateHevUnit
};
