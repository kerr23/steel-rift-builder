// src/composables/useHevConfiguration.js
import { ref, computed } from 'vue'
import { generateUniqueId } from '../utils/formatters'
import { validateHEV } from '../services/unitValidation'
import { useErrorService } from '../services/errorService'

/**
 * Composable for managing HE-V configuration
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onSubmit - Callback function when HE-V is submitted
 * @param {Object} [options.initialData] - Initial HE-V data for editing
 * @param {Boolean} [options.isEditMode] - Whether in edit mode (true) or create mode (false)
 * @returns {Object} - HE-V configuration state and methods
 */
export function useHevConfiguration(options = {}) {
  const {
    onSubmit,
    initialData = null,
    isEditMode = false
  } = options

  const errorService = useErrorService()

  // Core HE-V properties
  const unitName = ref(initialData?.unitName || '')
  const selectedClass = ref(initialData?.selectedClass || null)
  const selectedMotiveType = ref(initialData?.selectedMotiveType || null)
  const selectedWeapons = ref(initialData?.selectedWeapons || [])
  const selectedUpgrades = ref(initialData?.selectedUpgrades || [])
  const armorModification = ref(initialData?.armorModification || 'standard')
  const structureModification = ref(initialData?.structureModification || 'standard')
  const unitId = ref(initialData?.id || generateUniqueId())

  // Computed properties for HE-V statistics
  const baseArmor = computed(() => selectedClass.value?.baseArmor || 0)
  const baseStructure = computed(() => selectedClass.value?.baseStructure || 0)
  const baseTonnage = computed(() => selectedClass.value?.baseTonnage || 0)
  const baseSlots = computed(() => selectedClass.value?.baseSlots || 0)
  const motiveSlotModifier = computed(() => selectedMotiveType.value?.slotModifier || 0)
  const maxSlots = computed(() => baseSlots.value + motiveSlotModifier.value)

  // Track total slot usage
  const weaponSlotUsage = computed(() => {
    return selectedWeapons.value.reduce((total, weapon) => total + (weapon.slots || 0), 0)
  })

  const upgradeSlotUsage = computed(() => {
    return selectedUpgrades.value.reduce((total, upgrade) => total + (upgrade.slots || 0), 0)
  })

  const totalSlotUsage = computed(() => weaponSlotUsage.value + upgradeSlotUsage.value)

  const isSlotLimitExceeded = computed(() => totalSlotUsage.value > maxSlots.value)

  // Handle armor and structure modifications
  const effectiveArmor = computed(() => {
    return calculateModifiedValue(baseArmor.value, armorModification.value)
  })

  const effectiveStructure = computed(() => {
    return calculateModifiedValue(baseStructure.value, structureModification.value)
  })

  // Total tonnage calculation
  const totalUnitTonnage = computed(() => {
    // This is a simplified calculation - in a real implementation,
    // you would use the hevService to calculate this more accurately
    return baseTonnage.value
  })

  // Form validation
  const isFormValid = computed(() => {
    if (!unitName.value || !selectedClass.value || !selectedMotiveType.value) {
      return false
    }

    if (isSlotLimitExceeded.value) {
      return false
    }

    return true
  })

  /**
   * Reset the form to default values
   */
  function resetForm() {
    unitName.value = ''
    selectedClass.value = null
    selectedMotiveType.value = null
    selectedWeapons.value = []
    selectedUpgrades.value = []
    armorModification.value = 'standard'
    structureModification.value = 'standard'
    unitId.value = generateUniqueId()
  }

  /**
   * Submit the form to create/update a HE-V
   */
  function submitHev() {
    const hevData = {
      unitName: unitName.value,
      selectedClass: selectedClass.value,
      selectedMotiveType: selectedMotiveType.value,
      selectedWeapons: selectedWeapons.value,
      selectedUpgrades: selectedUpgrades.value,
      armorModification: armorModification.value,
      structureModification: structureModification.value,
      effectiveArmor: effectiveArmor.value,
      effectiveStructure: effectiveStructure.value,
      totalUnitTonnage: totalUnitTonnage.value,
      id: unitId.value
    }

    // Validate the HE-V data
    const validation = validateHEV(hevData)

    if (!validation.isValid) {
      errorService.handleValidationError(validation.errors[0], {
        context: 'HE-V Configuration'
      })
      return false
    }

    // Send the data to the parent component
    if (onSubmit) {
      const success = onSubmit(hevData)
      if (success && !isEditMode) {
        resetForm()
      }
      return success
    }

    return true
  }

  /**
   * Calculate modified value based on modification type
   *
   * @param {number} baseValue - Base value to modify
   * @param {string} modification - Modification type
   * @returns {number} - Modified value
   */
  function calculateModifiedValue(baseValue, modification) {
    if (!baseValue) return 0

    switch (modification) {
      case 'enhanced':
        return baseValue + 2
      case 'reinforced':
        return baseValue + 4
      case 'lightweight':
        return Math.max(1, baseValue - 2)
      case 'ultralight':
        return Math.max(1, baseValue - 4)
      case 'standard':
      default:
        return baseValue
    }
  }

  // Expose the configuration state and methods
  return {
    // Form fields
    unitName,
    selectedClass,
    selectedMotiveType,
    selectedWeapons,
    selectedUpgrades,
    armorModification,
    structureModification,

    // Computed values
    baseArmor,
    baseStructure,
    baseTonnage,
    baseSlots,
    motiveSlotModifier,
    maxSlots,
    weaponSlotUsage,
    upgradeSlotUsage,
    totalSlotUsage,
    isSlotLimitExceeded,
    effectiveArmor,
    effectiveStructure,
    totalUnitTonnage,
    isFormValid,

    // Methods
    resetForm,
    submitHev
  }
}

export default useHevConfiguration
