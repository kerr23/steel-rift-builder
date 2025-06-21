/**
 * unitValidation.js
 *
 * A service module for validating HE-V and Support Asset configurations.
 * This centralizes validation logic that was previously scattered across components.
 */

/**
 * Validates that a HE-V configuration meets all requirements
 *
 * @param {Object} hevData - The HE-V unit data to validate
 * @returns {Object} - Contains isValid boolean and errors array if invalid
 */
export function validateHEV(hevData) {
  const errors = [];

  // Required fields validation
  if (!hevData.unitName?.trim()) {
    errors.push('Unit name is required');
  }

  if (!hevData.selectedClass) {
    errors.push('Chassis class is required');
  }

  if (!hevData.selectedMotiveType) {
    errors.push('Motive system is required');
  }

  // Slots validation
  if (hevData.selectedClass && hevData.selectedMotiveType) {
    const baseSlots = hevData.selectedClass.baseSlots;
    const motiveSlotModifier = hevData.selectedMotiveType.slotModifier;
    const maxSlots = baseSlots + motiveSlotModifier;

    const usedSlots = (hevData.selectedWeapons || []).reduce((total, weapon) => total + weapon.slots, 0) +
                     (hevData.selectedUpgrades || []).reduce((total, upgrade) => total + upgrade.slots, 0);

    if (usedSlots > maxSlots) {
      errors.push(`Exceeded maximum slot capacity: ${usedSlots}/${maxSlots}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that a Support Asset configuration meets all requirements
 *
 * @param {Object} supportAssetData - The support asset data to validate
 * @returns {Object} - Contains isValid boolean and errors array if invalid
 */
export function validateSupportAsset(supportAssetData) {
  const errors = [];

  // Required fields validation
  if (!supportAssetData.assetName?.trim()) {
    errors.push('Asset name is required');
  }

  if (!supportAssetData.assetType) {
    errors.push('Asset type is required');
  }

  // Special validation for infantry
  if (supportAssetData.assetType?.id === 'infantry' && !supportAssetData.infantryType) {
    errors.push('Infantry type is required for infantry assets');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates the complete roster for game-legal composition
 *
 * @param {Array} roster - The complete roster of units
 * @param {Object} rules - Game rules configuration
 * @returns {Object} - Contains isValid boolean and warnings/errors
 */
export function validateRoster(roster, rules) {
  const result = {
    isValid: true,
    warnings: [],
    errors: []
  };

  // Check if roster is empty
  if (!roster || roster.length === 0) {
    result.errors.push('Roster is empty');
    result.isValid = false;
    return result;
  }

  // Calculate total tonnage
  const totalTonnage = roster.reduce((sum, unit) => {
    const tonnage = unit.isSupportAsset
      ? (unit.totalUnitTonnage || 10)
      : (unit.selectedClass?.baseTonnage || 0);
    return sum + tonnage;
  }, 0);

  // Check minimum requirements
  if (totalTonnage < rules.minTonnage) {
    result.warnings.push(`Roster is below minimum tonnage (${totalTonnage}/${rules.minTonnage})`);
  }

  // Count HE-V units
  const hevCount = roster.filter(unit => !unit.isSupportAsset).length;
  if (hevCount < rules.minHEVCount) {
    result.errors.push(`Not enough HE-V units (${hevCount}/${rules.minHEVCount})`);
    result.isValid = false;
  }

  return result;
}

export default {
  validateHEV,
  validateSupportAsset,
  validateRoster
};
