// src/utils/validators.js
/**
 * Validates HE-V data structure
 * @param {Object} hevData - HE-V data to validate
 * @returns {Object} Validation result with isValid and message properties
 */
export function validateHevData(hevData) {
  if (!hevData) {
    return { isValid: false, message: 'HE-V data is missing' }
  }

  if (!hevData.selectedClass) {
    return { isValid: false, message: 'HE-V is missing class selection' }
  }

  if (!hevData.selectedMotiveType) {
    return { isValid: false, message: 'HE-V is missing motive type selection' }
  }

  if (typeof hevData.effectiveArmor !== 'number' || hevData.effectiveArmor <= 0) {
    return { isValid: false, message: 'HE-V has invalid armor value' }
  }

  if (typeof hevData.effectiveStructure !== 'number' || hevData.effectiveStructure <= 0) {
    return { isValid: false, message: 'HE-V has invalid structure value' }
  }

  if (!Array.isArray(hevData.selectedWeapons)) {
    return { isValid: false, message: 'HE-V weapons data is invalid' }
  }

  if (!Array.isArray(hevData.selectedUpgrades)) {
    return { isValid: false, message: 'HE-V upgrades data is invalid' }
  }

  if (typeof hevData.totalUnitTonnage !== 'number' || hevData.totalUnitTonnage <= 0) {
    return { isValid: false, message: 'HE-V has invalid tonnage value' }
  }

  return { isValid: true, message: 'HE-V data is valid' }
}

/**
 * Validates support asset data structure
 * @param {Object} assetData - Support asset data to validate
 * @returns {Object} Validation result with isValid and message properties
 */
export function validateSupportAssetData(assetData) {
  if (!assetData) {
    return { isValid: false, message: 'Support asset data is missing' }
  }

  if (!assetData.type) {
    return { isValid: false, message: 'Support asset is missing type' }
  }

  if (!Array.isArray(assetData.details) || assetData.details.length === 0) {
    return { isValid: false, message: 'Support asset details are missing or invalid' }
  }

  return { isValid: true, message: 'Support asset data is valid' }
}

/**
 * Validates imported roster data
 * @param {Object} importData - Imported roster data to validate
 * @returns {Object} Validation result with isValid, message and validUnits properties
 */
export function validateRosterImport(importData) {
  if (!importData) {
    return {
      isValid: false,
      message: 'Import data is missing',
      validUnits: []
    }
  }

  if (typeof importData.rosterName !== 'string') {
    return {
      isValid: false,
      message: 'Import data has invalid roster name',
      validUnits: []
    }
  }

  if (!Array.isArray(importData.roster)) {
    return {
      isValid: false,
      message: 'Import data has invalid roster array',
      validUnits: []
    }
  }

  // Filter valid units
  const validUnits = importData.roster.filter(
    (unit) => unit && typeof unit === 'object' &&
      (
        (unit.selectedClass && Array.isArray(unit.selectedWeapons) && Array.isArray(unit.selectedUpgrades) && typeof unit.totalUnitTonnage === 'number' && unit.id !== undefined) ||
        (unit.isSupportAsset && unit.type && Array.isArray(unit.details) && typeof unit.totalUnitTonnage === 'number' && unit.id !== undefined)
      )
  )

  return {
    isValid: validUnits.length > 0,
    message: validUnits.length > 0 ?
      `Successfully validated ${validUnits.length} units` :
      'No valid units found in import data',
    validUnits
  }
}
