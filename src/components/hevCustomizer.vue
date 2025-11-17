<script setup>
// Import necessary functions from Vue and data/helpers from gameData.js
import { ref, computed, watch, defineProps, defineEmits, defineExpose, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import BubbleDisplay from './ui/BubbleDisplay.vue'
import FormSelect from './ui/FormSelect.vue'
import Button from './ui/Button.vue'
import MemoizedTraitFormatter from './ui/MemoizedTraitFormatter.vue'
import { MODIFICATION_OPTIONS } from '../constants.js'
import { hasJumpJets as _hasJumpJets } from '../utils/upgradeUtils.js'
import { filterWeaponsForClass, filterUpgradesForClass } from '../utils/gameDataHelpers.js'

// --- Initialize Toast ---
const toast = useToast()

// --- Props Definition ---
const props = defineProps({
  gameRules: {
    type: Object,
    required: true,
  },
})

// --- Emits Definition ---
const emit = defineEmits(['add-hev'])

// --- Component State ---
const unitName = ref('')
const selectedClass = ref(null)
const selectedWeapons = ref([])
const selectedUpgrades = ref([])
const selectedMotiveType = ref(null)
const armorModification = ref('standard')
const structureModification = ref('standard')

// Refs for selects
const weaponSelectRef = ref(null)
const upgradeSelectRef = ref(null)

// --- Game Data Access ---

// Ensure these are defined at the top of the script:
const baseTonnage = computed(() => selectedClass.value?.baseTonnage ?? 0)
const baseSlots = computed(() => selectedClass.value?.baseSlots ?? 0)
const motiveSlotModifier = computed(() => selectedMotiveType.value?.slotModifier ?? 0)
const maxSlots = computed(() => baseSlots.value + motiveSlotModifier.value)

// --- Remove dice/die/step/side logic and functions ---
// --- Modification Options ---
const modificationOptions = ref(MODIFICATION_OPTIONS)

// --- Armor/Structure Model (new) ---
const baseArmor = computed(() => selectedClass.value?.baseArmor ?? 0)
const baseStructure = computed(() => selectedClass.value?.baseStructure ?? 0)

const armorBaseValue = computed(() => {
  if (!selectedClass.value) return 0
  let val = baseArmor.value
  if (armorModification.value === 'stripped') val -= 2
  if (armorModification.value === 'reinforced') val += 2
  return Math.max(0, val)
})

const structureBaseValue = computed(() => {
  if (!selectedClass.value) return 0
  let val = baseStructure.value
  if (structureModification.value === 'stripped') val -= 2
  if (structureModification.value === 'reinforced') val += 2
  return Math.max(0, val)
})

const armorCost = computed(() => {
  // 1T per point of armor (can be adjusted if needed)
  return armorBaseValue.value
})
const structureCost = computed(() => {
  // 1T per point of structure (can be adjusted if needed)
  return structureBaseValue.value
})

const canStripArmor = computed(() => baseArmor.value > 2)
const canReinforceArmor = computed(() => true)
const canStripStructure = computed(() => baseStructure.value > 2)
const canReinforceStructure = computed(() => true)

function getStructureMarker(percent) {
  const s = structureBaseValue.value
  return s > 0 ? s - Math.floor(s * percent) + 1 : 0
}
const structureMarker_25_Percent = computed(() => getStructureMarker(0.75))
const structureMarker_50_Percent = computed(() => getStructureMarker(0.5))
const structureMarker_75_Percent = computed(() => getStructureMarker(0.25))

const baseMovementSpeed = computed(() => selectedClass.value?.baseMovement ?? 0)
const hasJumpJets = computed(() => _hasJumpJets(selectedUpgrades.value, {}))
const jumpMovementSpeed = computed(() => {
  if (!hasJumpJets.value) return 0
  const baseMove = baseMovementSpeed.value
  return {12: 10, 10: 8, 8: 6, 6: 4}[baseMove] ?? 0
})

const weaponDetails = computed(() => {
  const counts = new Map()
  let totalTonnage = 0
  let totalSlots = 0
  const currentClassName = selectedClass.value?.name
  if (!currentClassName) return { totalTonnage: 0, totalSlots: 0 }
  selectedWeapons.value.forEach((weapon) => {
    if (weapon && weapon.id) counts.set(weapon.id, (counts.get(weapon.id) || 0) + 1)
  })
  for (const [weaponId, quantity] of counts.entries()) {
    const weaponData = props.gameRules.weapons.find((w) => w.id === weaponId)
    if (weaponData && weaponData.tonnage !== undefined) {
      let groupTonnage = 0
      for (let i = 1; i <= quantity; i++) {
        groupTonnage += calculateNthWeaponCost(weaponData, i, currentClassName)
      }
      totalTonnage += groupTonnage
      totalSlots += quantity
    }
  }
  return { totalTonnage, totalSlots }
})

const upgradeDetails = computed(() => {
  const currentClassName = selectedClass.value?.name
  let totalTonnage = 0
  selectedUpgrades.value.forEach((up) => {
    if (typeof up.tonnage === 'object' && up.tonnage !== null) {
      if (currentClassName && up.tonnage[currentClassName] !== undefined) {
        totalTonnage += up.tonnage[currentClassName]
      }
    } else if (typeof up.tonnage === 'number') {
      totalTonnage += up.tonnage
    }
  })
  return { totalTonnage, totalSlots: selectedUpgrades.value.length }
})

// Removed motiveTonnageModifier computed property

const usedSlots = computed(() => weaponDetails.value.totalSlots + upgradeDetails.value.totalSlots)
const totalUnitTonnageUsed = computed(() =>
  armorCost.value + structureCost.value + weaponDetails.value.totalTonnage + upgradeDetails.value.totalTonnage
)
const remainingUnitTonnage = computed(() => baseTonnage.value - totalUnitTonnageUsed.value)
const isValidUnit = computed(() =>
  !!selectedClass.value && !!selectedMotiveType.value
)
const isOverTonnage = computed(() => remainingUnitTonnage.value < 0)
const isOverSlots = computed(() => usedSlots.value > maxSlots.value)
const availableMotiveTypes = computed(() =>
  !selectedClass.value || !props.gameRules?.motiveTypes
    ? []
    : props.gameRules.motiveTypes.filter((mt) => mt.classApplicability.includes(selectedClass.value.name))
)
const formattedClasses = computed(() =>
  props.gameRules.classes.map((cls) => ({
    title: `${cls.name} (Base: ${cls.baseTonnage}T / ${cls.baseSlots} Slots)`,
    value: cls,
  }))
)
const formattedMotiveTypes = computed(() =>
  availableMotiveTypes.value.map((mt) => ({ title: `${mt.name}`, value: mt }))
)
const formattedWeapons = computed(() => {
  const currentClassName = selectedClass.value?.name
  const currentCounts = new Map()
  selectedWeapons.value.forEach((w) => {
    if (w && w.id) currentCounts.set(w.id, (currentCounts.get(w.id) || 0) + 1)
  })

  // Only include weapons that declare a tonnage for the selected class.
  const sourceWeapons = currentClassName
    ? filterWeaponsForClass(props.gameRules.weapons || [], currentClassName)
    : props.gameRules.weapons || []

  return sourceWeapons.map((wpn) => {
    const currentQuantity = currentCounts.get(wpn.id) || 0
    const nextQuantityIndex = currentQuantity + 1
    const costToAddNext = calculateNthWeaponCost(wpn, nextQuantityIndex, currentClassName)
    return {
      title: `${wpn.name} (${costToAddNext}T)` +
        (wpn.traits && wpn.traits.length
          ? ` [${wpn.traits.map(formatTraitDisplay).join(', ')}]`
          : ''),
      value: wpn.id,
    }
  })
})
const formattedUpgrades = computed(() => {
  const selectedUpgradeIds = new Set(selectedUpgrades.value.map((upg) => upg.id))
  const currentClassName = selectedClass.value?.name

  const sourceUpgrades = currentClassName
    ? filterUpgradesForClass(props.gameRules.upgrades || [], currentClassName)
    : props.gameRules.upgrades || []

  return sourceUpgrades
    .filter((upg) => !selectedUpgradeIds.has(upg.id))
    .map((upg) => {
      let tonnageDisplay
      if (typeof upg.tonnage === 'object' && upg.tonnage !== null) {
        tonnageDisplay =
          currentClassName && upg.tonnage[currentClassName] !== undefined
            ? upg.tonnage[currentClassName]
            : `(${Object.entries(upg.tonnage).map(([k, v]) => `${k[0]}:${v}`).join('/')})`
      } else {
        tonnageDisplay = upg.tonnage
      }
      return {
        title: `${upg.name} (${tonnageDisplay}T)` +
          (upg.traits && upg.traits.length
            ? ` [${upg.traits.map(formatTraitDisplay).join(', ')}]`
            : ''),
        value: upg.id,
      }
    })
})
// --- END Computed Properties ---

// --- Methods ---
const addWeapon = (weapon) => {
  if (weapon) selectedWeapons.value.push(JSON.parse(JSON.stringify(weapon)))
}
const removeWeapon = (index) => {
  selectedWeapons.value.splice(index, 1)
}
const addUpgrade = (upgrade) => {
  if (upgrade) selectedUpgrades.value.push(JSON.parse(JSON.stringify(upgrade)))
}
const removeUpgrade = (index) => {
  selectedUpgrades.value.splice(index, 1)
}

const handleWeaponAdd = (event) => {
  const selectedWeaponId = event.target.value
  if (selectedWeaponId) {
    const weaponToAdd = props.gameRules.weapons.find((w) => w.id === selectedWeaponId)
    if (!weaponToAdd) return
    const potentialSlots = usedSlots.value + 1
    if (potentialSlots > maxSlots.value) {
      toast.error(`Cannot add ${weaponToAdd.name}: Exceeds maximum slots (${maxSlots.value}).`)
      if (weaponSelectRef.value) weaponSelectRef.value.value = ''
      return
    }
    const currentClassName = selectedClass.value?.name
    if (!currentClassName) {
      toast.error('Please select a HE-V class first.')
      if (weaponSelectRef.value) weaponSelectRef.value.value = ''
      return
    }
    const currentCount = selectedWeapons.value.filter((w) => w.id === weaponToAdd.id).length
    const costOfThisWeapon = calculateNthWeaponCost(weaponToAdd, currentCount + 1, currentClassName)
    const currentUsedWithoutArmorStructure =
      totalUnitTonnageUsed.value - armorCost.value - structureCost.value
    const potentialTotal =
      currentUsedWithoutArmorStructure + armorCost.value + structureCost.value + costOfThisWeapon

    if (potentialTotal > baseTonnage.value) {
      toast.error(
        `Cannot add ${weaponToAdd.name}: Exceeds maximum tonnage (${baseTonnage.value}T). Cost of this weapon: ${costOfThisWeapon}T.`,
      )
      if (weaponSelectRef.value) weaponSelectRef.value.value = ''
      return
    }
    addWeapon(weaponToAdd)
    if (weaponSelectRef.value) {
      weaponSelectRef.value.value = ''
    }
  }
}
const handleUpgradeAdd = (event) => {
  const selectedUpgradeId = event.target.value
  if (selectedUpgradeId) {
    const upgradeToAdd = props.gameRules.upgrades.find((u) => u.id === selectedUpgradeId)
    if (!upgradeToAdd) return
    const potentialSlots = usedSlots.value + 1
    if (potentialSlots > maxSlots.value) {
      toast.error(`Cannot add ${upgradeToAdd.name}: Exceeds maximum slots (${maxSlots.value}).`)
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
      return
    }
    const currentClassName = selectedClass.value?.name
    if (
      !currentClassName &&
      typeof upgradeToAdd.tonnage === 'object' &&
      upgradeToAdd.tonnage !== null
    ) {
      toast.error(
        `Cannot determine tonnage for ${upgradeToAdd.name} without a selected HE-V class.`,
      )
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
      return
    }

    let costOfThisUpgrade = 0
    if (typeof upgradeToAdd.tonnage === 'object' && upgradeToAdd.tonnage !== null) {
      if (currentClassName && upgradeToAdd.tonnage[currentClassName] !== undefined) {
        costOfThisUpgrade = upgradeToAdd.tonnage[currentClassName]
      } else {
        console.warn(
          `Tonnage for ${upgradeToAdd.name} on class ${currentClassName} not defined, using 0 for cost check.`,
        )
      }
    } else if (typeof upgradeToAdd.tonnage === 'number') {
      costOfThisUpgrade = upgradeToAdd.tonnage
    }

    const potentialFinalTonnage = totalUnitTonnageUsed.value + costOfThisUpgrade

    if (potentialFinalTonnage > baseTonnage.value) {
      toast.error(
        `Cannot add ${upgradeToAdd.name}: Exceeds maximum tonnage (${baseTonnage.value}T). Cost of this upgrade: ${costOfThisUpgrade}T.`,
      )
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
      return
    }
    addUpgrade(upgradeToAdd)
    if (upgradeSelectRef.value) {
      upgradeSelectRef.value.value = ''
    }
  }
}

const resetForm = () => {
  console.log('Resetting HEV form')
  unitName.value = ''
  selectedClass.value = null
  selectedWeapons.value = []
  selectedUpgrades.value = []
  armorModification.value = 'standard'
  structureModification.value = 'standard'
  selectedMotiveType.value = null
  if (weaponSelectRef.value) weaponSelectRef.value.value = ''
  if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
}

const loadHevForEditing = (unitData) => {
  console.log('Loading HEV data for editing:', unitData)
  try {
    unitName.value = unitData.unitName || ''
    selectedClass.value =
      props.gameRules.classes.find((c) => c.name === unitData.selectedClass?.name) || null

    nextTick(() => {
      if (selectedClass.value) {
        // First try to find the exact motive type from the data
        const exactMotiveType = availableMotiveTypes.value.find((mt) => mt.id === unitData.selectedMotiveType?.id)

        // If not found, prefer biped
        const bipedMotiveType = availableMotiveTypes.value.find(mt => mt.name === 'Biped')

        // Set motive type with priority: exact match > biped > first available > null
        selectedMotiveType.value = exactMotiveType ||
                                  bipedMotiveType ||
                                  availableMotiveTypes.value[0] ||
                                  null

        const baseArmor = selectedClass.value?.baseArmor
        const baseStruct = selectedClass.value?.baseStructure

        // Set modification based on loaded effective values
        if (baseArmor !== undefined && unitData.effectiveArmor !== undefined) {
          if (unitData.effectiveArmor > baseArmor)
            armorModification.value = 'reinforced'
          else if (unitData.effectiveArmor < baseArmor)
            armorModification.value = 'stripped'
          else armorModification.value = 'standard'
        } else {
          armorModification.value = 'standard'
        }

        if (baseStruct !== undefined && unitData.effectiveStructure !== undefined) {
          if (unitData.effectiveStructure > baseStruct)
            structureModification.value = 'reinforced'
          else if (unitData.effectiveStructure < baseStruct)
            structureModification.value = 'stripped'
          else structureModification.value = 'standard'
        } else {
          structureModification.value = 'standard'
        }
      } else {
        selectedMotiveType.value = null
        armorModification.value = 'standard'
        structureModification.value = 'standard'
      }

      selectedWeapons.value = unitData.selectedWeapons
        ? JSON.parse(JSON.stringify(unitData.selectedWeapons))
        : []
      selectedUpgrades.value = unitData.selectedUpgrades
        ? JSON.parse(JSON.stringify(unitData.selectedUpgrades))
        : []

      if (weaponSelectRef.value) weaponSelectRef.value.value = ''
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''

      console.log('HEV data loading complete.')
    })
  } catch (error) {
    console.error('Error loading HEV data:', error, unitData)
    toast.error('Failed to load HEV data for editing.')
    resetForm()
  }
}

const submitHev = () => {
  if (isOverTonnage.value) {
    toast.error('Cannot add HE-V: Tonnage limit exceeded.')
    return
  }
  if (isOverSlots.value) {
    toast.error('Cannot add HE-V: Slot limit exceeded.')
    return
  }
  if (!isValidUnit.value) {
    toast.error(
      'Cannot add HE-V: Configuration is incomplete (Class, Motive, Armor/Structure invalid).',
    )
    return
  }

  // Use armorBaseValue/structureBaseValue as effective values
  const hevData = {
    unitName: unitName.value,
    selectedClass: JSON.parse(JSON.stringify(selectedClass.value)),
    effectiveArmor: armorBaseValue.value,
    effectiveStructure: structureBaseValue.value,
    selectedWeapons: JSON.parse(JSON.stringify(selectedWeapons.value)),
    selectedUpgrades: JSON.parse(JSON.stringify(selectedUpgrades.value)),
    selectedMotiveType: JSON.parse(JSON.stringify(selectedMotiveType.value)),
    totalUnitTonnage: totalUnitTonnageUsed.value,
    usedSlots: usedSlots.value,
    maxSlots: maxSlots.value,
  }
  emit('add-hev', hevData)
}
// --- END Methods ---

// --- Watchers ---
watch(selectedClass, (newClass, oldClass) => {
  if (oldClass !== null && newClass?.name !== oldClass?.name) {
    armorModification.value = 'standard'
    structureModification.value = 'standard'
  }
  if (newClass) {
    // Default to biped motive type or use the currently selected one if valid
    const bipedMotiveType = availableMotiveTypes.value.find(mt => mt.name === 'Biped')
    const currentMotiveIsValid = availableMotiveTypes.value.some(
      (mt) => mt.id === selectedMotiveType.value?.id,
    )

    // Always prioritize 'Biped' if available and no valid selection exists
    if (bipedMotiveType && (!selectedMotiveType.value || !currentMotiveIsValid)) {
      selectedMotiveType.value = bipedMotiveType
    } else if (!currentMotiveIsValid) {
      // Fall back to first available motive type if biped not available
      selectedMotiveType.value = availableMotiveTypes.value[0] || null
    }
  } else {
    selectedMotiveType.value = null
  }
  if (weaponSelectRef.value) weaponSelectRef.value.value = ''
  if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
})

watch(armorModification, (newValue, oldValue) => {
  if (oldValue === undefined || !selectedClass.value) return
  nextTick(() => {
    if (isOverTonnage.value) {
      toast.error(
        `Armor change to '${newValue}' exceeds max tonnage (${baseTonnage.value}T). Reverting.`,
      )
      nextTick(() => {
        armorModification.value = oldValue
      })
    }
  })
})

watch(structureModification, (newValue, oldValue) => {
  if (oldValue === undefined || !selectedClass.value) return
  nextTick(() => {
    if (isOverTonnage.value) {
      toast.error(
        `Structure change to '${newValue}' exceeds max tonnage (${baseTonnage.value}T). Reverting.`,
      )
      nextTick(() => {
        structureModification.value = oldValue
      })
    }
  })
})
// --- END Watchers ---

// --- Expose Methods ---
defineExpose({ resetForm, loadHevForEditing })
// --- END Expose Methods ---

// Initialize trait formatter ref
const traitFormatterRef = ref(null);

// Helper for weapon cost calculation
/**
 * Memoized calculation of nth weapon cost
 * Calculates the cost of adding the nth copy of a weapon, applying a progressive penalty
 * @param {Object} weaponData - Weapon data object
 * @param {number} n - Which copy of the weapon (1st, 2nd, etc.)
 * @param {string} className - HE-V class name
 * @returns {number} - Tonnage cost
 */
const weaponCostCache = new Map(); // Cache for memoization

const calculateNthWeaponCost = (weaponData, n, className) => {
  // Early return for invalid inputs
  if (
    n <= 0 ||
    !weaponData ||
    !className ||
    !weaponData.tonnage ||
    weaponData.tonnage[className] === undefined
  ) return 0

  // Create a cache key
  const cacheKey = `${weaponData.id}-${n}-${className}`;

  // Check if we have this calculation cached
  if (weaponCostCache.has(cacheKey)) {
    return weaponCostCache.get(cacheKey);
  }

  // Perform the calculation
  const baseCost = weaponData.tonnage[className]
  let result;

  if (n === 1) {
    result = baseCost;
  } else {
    const penaltyAmount = Math.ceil(baseCost * 0.5)
    result = baseCost + (n - 1) * penaltyAmount;
  }

  // Cache the result
  weaponCostCache.set(cacheKey, result);

  return result;
}

// Helper for trait display - uses MemoizedTraitFormatter for performance
/**
 * Format trait for display using memoized trait formatter
 * @param {Object} trait - The trait to format
 * @returns {string} - Formatted trait display string
 */
const formatTraitDisplay = (trait) => {
  const currentClassName = selectedClass.value?.name;
  // If the trait formatter ref is available, use it
  if (traitFormatterRef.value) {
    return traitFormatterRef.value.formatTraitDisplay(trait);
  }

  // Fallback implementation if the formatter is not available
  if (!trait || typeof trait !== 'object' || !trait.name) return 'Unknown Trait';

  if (trait.name === 'Limited' && typeof trait.value === 'number') {
    return `Limited(${Array(trait.value).fill('○').join('')})`;
  }
  if (typeof trait.value === 'object' && trait.value !== null) {
    if (currentClassName && trait.value[currentClassName] !== undefined) {
      return `${trait.name} ${trait.value[currentClassName]}`;
    } else {
      return `${trait.name} (${Object.entries(trait.value).map(([k, v]) => `${k[0]}:${v}`).join('/')})`;
    }
  }
  if (trait.value !== undefined) return `${trait.name} ${trait.value}`;
  return trait.name;
}
</script>

<template>
  <section class="hev-customizer card p-5">
    <!-- Hidden trait formatter component - doesn't render anything visible -->
    <MemoizedTraitFormatter
      ref="traitFormatterRef"
      :className="selectedClass?.name"
    />
    <h2 class="component-title text-center text-secondary mb-5 font-medium text-2xl">HE-V Configuration</h2>

    <div class="form-inline class-defense-wrapper flex flex-wrap gap-6 mb-4 items-stretch">
      <div class="form-section class-section flex-1 min-w-72 flex flex-col">
        <h3 class="section-title text-lg text-secondary border-b border-border pb-1 mb-3 font-medium">Classification & Movement</h3>
        <div class="form-group mb-3">
          <label for="hevName" class="block mb-2 font-medium text-text">HE-V Name:</label>
          <input type="text" id="hevName" v-model="unitName" placeholder="Enter name for this HE-V" class="block w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary" />
        </div>
        <FormSelect
          id="hevClass"
          label="HE-V Class:"
          v-model="selectedClass"
        >
          <option :value="null" disabled>-- Select Class --</option>
          <option
            v-for="clsOption in formattedClasses"
            :key="clsOption.value.name"
            :value="JSON.stringify(clsOption.value)"
          >
            {{ clsOption.title }}
          </option>
        </FormSelect>

        <FormSelect
          v-if="selectedClass"
          id="motiveType"
          label="Motive Type:"
          v-model="selectedMotiveType"
          :required="true"
        >
          <option :value="null" disabled>-- Select Motive Type --</option>
          <option
            v-for="mtOption in formattedMotiveTypes"
            :key="mtOption.value.id"
            :value="JSON.stringify(mtOption.value)"
          >
            {{ mtOption.title }}
          </option>
          <option v-if="availableMotiveTypes.length === 0" :value="null" disabled>
            -- No types available for this class --
          </option>
          <template v-slot:error>
            <p v-if="!selectedMotiveType && availableMotiveTypes.length > 0" class="warning-text text-[#b38600] text-sm italic mt-1 block">
              Please select a motive type.
            </p>
          </template>
        </FormSelect>

        <div class="movement-info mt-3 pt-2 border-t border-dashed border-border" v-if="selectedClass">
          <p class="my-0.5 text-sm"><strong class="inline-block min-w-20 font-semibold">Movement:</strong> {{ baseMovementSpeed }}"</p>
          <p v-if="hasJumpJets" class="my-0.5 text-sm"><strong class="inline-block min-w-20 font-semibold">Jump:</strong> {{ jumpMovementSpeed }}"</p>
        </div>
      </div>
      <div v-if="selectedClass" class="form-section defense-section flex-1 min-w-72 flex flex-col">
        <h3 class="section-title text-sm text-secondary border-b border-border pb-px mb-2 font-medium">Armor & Structure</h3>
        <div class="flex flex-col gap-[0.4rem] border border-medium-grey p-2 rounded">
          <div class="flex flex-row items-center justify-between min-h-5">
            <BubbleDisplay label="Armor" :value="armorBaseValue" />
            <div class="flex items-center gap-2 min-w-32 justify-end">
              <select class="modification-select px-2 py-1 text-xs w-24 min-w-[4.5rem] flex-shrink-0 rounded border border-input-border focus:outline-none focus:border-primary" v-model="armorModification">
                <option v-for="opt in modificationOptions" :key="`armor-mod-${opt.value}`" :value="opt.value" :disabled="(opt.value === 'stripped' && !canStripArmor) || (opt.value === 'reinforced' && !canReinforceArmor)">
                  {{ opt.label }}
                </option>
              </select>
              <span class="modification-text text-xs text-text-muted whitespace-nowrap">({{ armorCost }}T)</span>
            </div>
          </div>
          <div class="flex flex-row items-center justify-between min-h-5">
            <BubbleDisplay label="Structure" :value="structureBaseValue" :isStructure="true" />
            <div class="flex items-center gap-2 min-w-32 justify-end">
              <select class="modification-select px-2 py-1 text-xs w-24 min-w-[4.5rem] flex-shrink-0 rounded border border-input-border focus:outline-none focus:border-primary" v-model="structureModification">
                <option v-for="opt in modificationOptions" :key="`struct-mod-${opt.value}`" :value="opt.value" :disabled="(opt.value === 'stripped' && !canStripStructure) || (opt.value === 'reinforced' && !canReinforceStructure)">
                  {{ opt.label }}
                </option>
              </select>
              <span class="modification-text text-xs text-text-muted whitespace-nowrap">({{ structureCost }}T)</span>
            </div>
          </div>
          <div class="threshold-descriptions mt-1 pt-2 border-t border-dashed border-border text-xs leading-tight w-full">
            <p v-if="structureMarker_25_Percent > 1" class="threshold-desc-green my-0 p-0 flex items-start"><strong class="min-w-14 text-right flex-shrink-0 inline-block font-bold mr-1 text-success">25% Dmg:</strong> All Move/Jump Orders -1</p>
            <p v-if="structureMarker_50_Percent > 1" class="threshold-desc-yellow my-0 p-0 flex items-start"><strong class="min-w-14 text-right flex-shrink-0 inline-block font-bold mr-1 text-amber-600">50% Dmg:</strong> Weapon Damage -1 (min 1)</p>
            <p v-if="structureMarker_75_Percent > 1" class="threshold-desc-red my-0 p-0 flex items-start"><strong class="min-w-14 text-right flex-shrink-0 inline-block font-bold mr-1 text-danger">75% Dmg:</strong> Only 1 Order per activation</p>
          </div>
        </div>
      </div>
      <div v-else class="form-section defense-section placeholder-section flex-1 min-w-72">
        <h3 class="section-title text-lg text-secondary border-b border-border pb-1 mb-3 font-medium">Armor & Structure</h3>
        <p class="text-text-muted text-center mt-4">Select Class to configure Defense</p>
      </div>
    </div>

    <div class="form-group equipment-section" v-if="selectedClass">
      <h3 class="section-title">Weapon Systems</h3>
      <div class="selection-layout flex flex-wrap gap-4 items-start">
        <div class="selection-control flex-1 min-w-60 flex flex-col">
          <select
            @change="handleWeaponAdd"
            :disabled="!selectedClass || usedSlots >= maxSlots"
            ref="weaponSelectRef"
            class="mb-1 w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary"
          >
            <option value="" disabled selected>-- Add Weapon --</option>
            <option
              v-for="wpnOption in formattedWeapons"
              :key="wpnOption.value"
              :value="wpnOption.value"
            >
              {{ wpnOption.title }}
            </option>
            <option
              v-if="selectedClass && (!formattedWeapons || formattedWeapons.length === 0)"
              disabled
            >
              -- No weapons defined --
            </option>
            <option v-if="!selectedClass" disabled>-- Select Class First --</option>
          </select>
          <p
            v-if="usedSlots >= maxSlots && selectedClass"
            class="slot-limit-message selection-limit-message error text-danger font-bold not-italic mt-1 text-left"
          >
            Maximum slots used ({{ usedSlots }}/{{ maxSlots }}).
          </p>
        </div>
        <div class="selection-list-container flex-2 min-w-72">
          <ul class="item-list list-none p-0 m-0 max-h-40 overflow-y-auto border border-medium-grey rounded bg-white min-h-9">
            <li
              v-for="(weapon, index) in selectedWeapons"
              :key="'selWpn-' + index + '-' + weapon.id"
              class="selected-item single-line-item flex justify-between items-center gap-2 border-b border-medium-grey px-3 py-2 text-sm"
            >
              <div class="item-info-line flex flex-wrap items-baseline gap-2 flex-grow overflow-hidden">
                <span class="item-name font-medium text-dark-grey whitespace-nowrap mr-1">{{ weapon.name }}</span>
                <span class="item-stats text-xs text-secondary whitespace-nowrap mr-1">(Damage: {{ weapon.damageRating?.[selectedClass?.name ?? ''] ?? '?' }}, Range: {{ weapon.rangeCategory || 'N/A' }})</span>
                <span class="item-traits text-xs text-text-muted whitespace-normal" v-html="`Traits: [${weapon.traits?.map(formatTraitDisplay).join(', ') || 'None'}]`"></span>
              </div>
              <button @click="removeWeapon(index)" class="btn btn-remove bg-danger text-white rounded-full w-5 h-5 leading-5 text-center font-bold cursor-pointer p-0 ml-2 flex-shrink-0 hover:bg-[#a71d2a]" title="Remove Weapon">
                X
              </button>
            </li>
            <li v-if="selectedWeapons.length === 0" class="text-text-muted w-full text-center py-2 italic"><i>No weapons added.</i></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="form-group equipment-section mt-6 mb-4 w-full" v-if="selectedClass">
      <h3 class="section-title text-lg text-secondary border-b border-border pb-1 mb-3 font-medium">Upgrades</h3>
      <div class="selection-layout flex flex-wrap gap-4 items-start">
        <div class="selection-control flex-1 min-w-60 flex flex-col">
          <select
            @change="handleUpgradeAdd"
            :disabled="!selectedClass || usedSlots >= maxSlots || formattedUpgrades.length === 0"
            ref="upgradeSelectRef"
            class="mb-1 w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary"
          >
            <option value="" disabled selected>-- Add Upgrade --</option>
            <option
              v-for="upgOption in formattedUpgrades"
              :key="upgOption.value"
              :value="upgOption.value"
            >
              {{ upgOption.title }}
            </option>
            <option
              v-if="selectedClass && formattedUpgrades.length === 0 && selectedUpgrades.length > 0"
              disabled
            >
              -- All available upgrades selected --
            </option>
            <option
              v-if="selectedClass && formattedUpgrades.length === 0 && selectedUpgrades.length === 0"
              disabled
            >
              -- No upgrades available --
            </option>
            <option v-if="!selectedClass" disabled>-- Select Class First --</option>
          </select>
          <p
            v-if="usedSlots >= maxSlots && selectedClass"
            class="slot-limit-message selection-limit-message error text-danger font-bold not-italic mt-1 text-left"
          >
            Maximum slots used ({{ usedSlots }}/{{ maxSlots }}).
          </p>
          <p
            v-if="formattedUpgrades.length === 0 && selectedUpgrades.length > 0 && usedSlots < maxSlots"
            class="slot-limit-message selection-limit-message text-text-muted italic mt-1 text-left"
          >
            All available upgrades added.
          </p>
        </div>
        <div class="selection-list-container flex-2 min-w-72">
          <ul class="item-list list-none p-0 m-0 max-h-40 overflow-y-auto border border-medium-grey rounded bg-white min-h-9">
            <li
              v-for="(upgrade, index) in selectedUpgrades"
              :key="'selUpg-' + index + '-' + upgrade.id"
              class="selected-item single-line-item flex justify-between items-center gap-2 border-b border-medium-grey px-3 py-2 text-sm"
            >
              <div class="item-info-line flex flex-wrap items-baseline gap-2 flex-grow overflow-hidden">
                <span class="item-name font-medium text-dark-grey whitespace-nowrap mr-1">{{ upgrade.name }}</span>
                <span class="item-stats text-xs text-secondary whitespace-nowrap mr-1">
                  (Cost:
                  {{
                    typeof upgrade.tonnage === 'object' &&
                    upgrade.tonnage !== null &&
                    selectedClass?.name &&
                    upgrade.tonnage[selectedClass.name] !== undefined
                      ? upgrade.tonnage[selectedClass.name]
                      : typeof upgrade.tonnage === 'number'
                        ? upgrade.tonnage
                        : '?'
                  }}T)
                </span>
              </div>
              <button @click="removeUpgrade(index)" class="btn btn-remove bg-danger text-white rounded-full w-5 h-5 leading-5 text-center font-bold cursor-pointer p-0 ml-2 flex-shrink-0 hover:bg-[#a71d2a]" title="Remove Upgrade">
                X
              </button>
            </li>
            <li v-if="selectedUpgrades.length === 0" class="text-text-muted w-full text-center py-2 italic"><i>No upgrades added.</i></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="summary card summary-compact mt-6 p-4 border border-border rounded" v-if="selectedClass">
      <h4 class="mb-0 mb-3 pb-2 text-lg text-center border-b border-medium-grey">Unit Summary</h4>
      <div class="summary-grid grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-y-1 gap-x-4 text-sm">
        <div class="summary-item flex justify-between">
          <span class="summary-label pr-2 text-secondary">Base Tonnage:</span>
          <strong class="summary-value font-semibold text-right">{{ baseTonnage }}</strong>
        </div>
        <div class="summary-item flex justify-between">
          <span class="summary-label pr-2 text-secondary">Armor Cost:</span>
          <strong class="summary-value font-semibold text-right">{{ armorCost }}T</strong>
        </div>
        <div class="summary-item flex justify-between">
          <span class="summary-label pr-2 text-secondary">Structure Cost:</span>
          <strong class="summary-value font-semibold text-right">{{ structureCost }}T</strong>
        </div>
        <div class="summary-item summary-item-full col-span-full mt-1 flex justify-between">
          <span class="summary-label pr-2 text-secondary">Weapons Cost:</span>
          <strong class="summary-value font-semibold text-right">
            {{ weaponDetails.totalTonnage }}T / {{ weaponDetails.totalSlots }} Slots
          </strong>
        </div>
        <div class="summary-item summary-item-full col-span-full mt-1 flex justify-between">
          <span class="summary-label pr-2 text-secondary">Upgrades Cost:</span>
          <strong class="summary-value font-semibold text-right">
            {{ upgradeDetails.totalTonnage }}T / {{ upgradeDetails.totalSlots }} Slots
          </strong>
        </div>
        <hr class="summary-divider col-span-full my-2 border-t border-medium-grey" />
        <div class="summary-item summary-item-full col-span-full mt-1 flex justify-between">
          <span class="summary-label pr-2 text-secondary">Total Tonnage Used:</span>
          <strong class="summary-value font-semibold text-right">{{ totalUnitTonnageUsed }} / {{ baseTonnage }}</strong>
        </div>
        <div class="summary-item summary-item-full col-span-full mt-1 flex justify-between" :class="{ 'text-danger font-bold': isOverTonnage }">
          <span class="summary-label pr-2">Remaining Tonnage:</span>
          <strong class="summary-value text-right">{{ remainingUnitTonnage }}</strong>
        </div>
        <div class="summary-item summary-item-full col-span-full mt-1 flex justify-between" :class="{ 'text-danger font-bold': isOverSlots }">
          <span class="summary-label pr-2">Slots Used:</span>
          <strong class="summary-value text-right">{{ usedSlots }} / {{ maxSlots }}</strong>
        </div>
      </div>
    </div>

    <div class="action-buttons mt-4 text-center" v-if="selectedClass">
      <Button
        @click="submitHev"
        :disabled="!isValidUnit || isOverTonnage || isOverSlots"
        variant="success"
        size="lg"
        :title="
          !isValidUnit
            ? 'Complete required selections (Class, Motive)'
            : isOverTonnage
              ? 'Cannot add: Unit exceeds Tonnage limit'
              : isOverSlots
                ? 'Cannot add: Unit exceeds Slot limit'
                : 'Add this HE-V configuration to the roster'
        "
      >
        Add HE-V to Roster
      </Button>
    </div>
  </section>
</template>

<style scoped>
.bubble-display {
  min-height: 1.2em;
}

/* Dark mode friendly styles */
:deep(.bg-gray-100) {
  background-color: var(--light-grey) !important;
  color: var(--text-color) !important;
}

:deep(.bg-gray-200) {
  background-color: var(--medium-grey) !important;
  color: var(--text-color) !important;
}

:deep(.bg-white) {
  background-color: var(--card-bg-color) !important;
  color: var(--text-color) !important;
}

:deep(.border-gray-200), :deep(.border-gray-300) {
  border-color: var(--border-color) !important;
}

/* Enhance stat display for dark mode */
.stat-section {
  border-color: var(--border-color);
}

.stat-row {
  color: var(--text-color);
}

.bubble-display .bubble {
  border-color: var(--text-color);
}

/* Make sure item descriptions are readable */
.item-traits {
  color: var(--text-muted-color);
}

/* Make sure color indicators remain visible */
.threshold-divider.divider-green {
  background-color: var(--success-color);
}

.threshold-divider.divider-yellow {
  background-color: var(--warning-color);
}

.threshold-divider.divider-red {
  background-color: var(--danger-color);
}
</style>
