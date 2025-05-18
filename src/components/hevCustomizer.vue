<script setup>
// Import necessary functions from Vue
import { ref, computed, watch, nextTick } from 'vue' // Removed defineProps, defineEmits, defineExpose
import { useToast } from 'vue-toastification'
// NO import from ../gameData.js needed here

// --- Initialize Toast ---
const toast = useToast()

// --- Props Definition (Still use the macro) ---
const props = defineProps({
  gameRules: {
    // Receives game data via props
    type: Object,
    required: true,
  },
})

// --- Emits Definition (Still use the macro) ---
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
const maxDieStep = computed(() => {
  if (!props.gameRules?.dice || props.gameRules.dice.length === 0) {
    console.error('gameRules.dice is missing or empty in HevCustomizer props!')
    return -1
  }
  try {
    return Math.max(...props.gameRules.dice.map((d) => d.step))
  } catch (e) {
    console.error('Error calculating maxDieStep:', e, props.gameRules.dice)
    return -1
  }
})
// REMOVED unused allDice computed property
// const allDice = computed(() => props.gameRules?.dice || [])

// --- Modification Options ---
const modificationOptions = ref([
  { value: 'stripped', label: 'Stripped' },
  { value: 'standard', label: 'Standard' },
  { value: 'reinforced', label: 'Reinforced' },
])

// --- Helper Functions ---
const findDieObject = (dieString) => {
  if (!props.gameRules?.dice) return null
  return props.gameRules.dice.find((d) => d.die === dieString)
}
const findDieByStep = (step) => {
  if (step < 0 || !props.gameRules?.dice) return null
  return props.gameRules.dice.find((d) => d.step === step)
}
const calculateNthWeaponCost = (weaponData, n, className) => {
  if (
    n <= 0 ||
    !weaponData ||
    !className ||
    !weaponData.tonnage ||
    weaponData.tonnage[className] === undefined
  ) {
    return 0
  }
  const baseCost = weaponData.tonnage[className]
  if (n === 1) return baseCost
  const penaltyAmount = Math.ceil(baseCost * 0.5)
  const penaltyMultiplier = n - 1
  const totalPenaltyForNth = penaltyMultiplier * penaltyAmount
  return baseCost + totalPenaltyForNth
}
// Helper Function for Trait Display
const formatTraitForDisplay = (trait, className) => {
  if (!trait || !trait.name) return ''
  const name = trait.name
  const value = trait.value

  if (value === null || value === undefined) {
    return name
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const classValue = className ? (value[className] ?? '?') : '?'
    return `${name}(${classValue})`
  } else {
    return `${name}(${value})`
  }
}
// --- END Helper Functions ---

// --- Computed Properties ---

// == Base Stats ==
const baseTonnage = computed(() => selectedClass.value?.baseTonnage ?? 0)
const baseSlots = computed(() => selectedClass.value?.baseSlots ?? 0)
const motiveSlotModifier = computed(() => selectedMotiveType.value?.slotModifier ?? 0)
const maxSlots = computed(() => (baseSlots.value || 0) + motiveSlotModifier.value)

// == Base Dice ==
const baseArmorDieObject = computed(() => findDieObject(selectedClass.value?.defaultArmorDie))
const baseStructureDieObject = computed(() =>
  findDieObject(selectedClass.value?.defaultStructureDie),
)

// == Dodge Target ==
const dodgeTarget = computed(() => {
  const className = selectedClass.value?.name
  if (!className) return 'N/A'
  switch (className) {
    case 'Light':
      return '3+'
    case 'Medium':
      return '4+'
    case 'Heavy':
      return '5+'
    case 'Ultra-Heavy':
      return '6+'
    default:
      return '?'
  }
})

// == Effective Armor Calculation ==
const effectiveArmorStep = computed(() => {
  if (!baseArmorDieObject.value) return -1
  let targetStep = baseArmorDieObject.value.step
  if (armorModification.value === 'stripped') {
    targetStep = Math.max(0, baseArmorDieObject.value.step - 1)
  } else if (armorModification.value === 'reinforced') {
    targetStep = Math.min(maxDieStep.value, baseArmorDieObject.value.step + 1)
  }
  return targetStep
})
const effectiveArmorDie = computed(() => findDieByStep(effectiveArmorStep.value))
const armorCost = computed(() => effectiveArmorDie.value?.armorCost ?? 0)
const armorSides = computed(() => effectiveArmorDie.value?.sides ?? 0)
const canStripArmor = computed(() => baseArmorDieObject.value && baseArmorDieObject.value.step > 0)
const canReinforceArmor = computed(
  () => baseArmorDieObject.value && baseArmorDieObject.value.step < maxDieStep.value,
)

// == Effective Structure Calculation ==
const effectiveStructureStep = computed(() => {
  if (!baseStructureDieObject.value) return -1
  let targetStep = baseStructureDieObject.value.step
  if (structureModification.value === 'stripped') {
    targetStep = Math.max(0, baseStructureDieObject.value.step - 1)
  } else if (structureModification.value === 'reinforced') {
    targetStep = Math.min(maxDieStep.value, baseStructureDieObject.value.step + 1)
  }
  return targetStep
})
const effectiveStructureDie = computed(() => findDieByStep(effectiveStructureStep.value))
const structureCost = computed(
  () => effectiveStructureDie.value?.structureCost ?? effectiveStructureDie.value?.armorCost ?? 0,
)
const structureSides = computed(() => effectiveStructureDie.value?.sides ?? 0)
const canStripStructure = computed(
  () => baseStructureDieObject.value && baseStructureDieObject.value.step > 0,
)
const canReinforceStructure = computed(
  () => baseStructureDieObject.value && baseStructureDieObject.value.step < maxDieStep.value,
)

// == Structure Thresholds (Renamed Markers) ==
const structureMarker_25_Percent = computed(() => {
  const s = structureSides.value
  return s > 0 ? s - Math.floor(s * 0.75) + 1 : 0
})
const structureMarker_50_Percent = computed(() => {
  const s = structureSides.value
  return s > 0 ? s - Math.floor(s * 0.5) + 1 : 0
})
const structureMarker_75_Percent = computed(() => {
  const s = structureSides.value
  return s > 0 ? s - Math.floor(s * 0.25) + 1 : 0
})

// == Movement Calculations ==
const baseMovementSpeed = computed(() => {
  return selectedClass.value?.baseMovement ?? 0
})
const hasJumpJets = computed(() => {
  return selectedUpgrades.value.some((upg) => upg.id === 'u6') // Adjusted ID
})
const jumpMovementSpeed = computed(() => {
  if (!hasJumpJets.value) return 0
  const baseMove = baseMovementSpeed.value
  if (baseMove === 12) return 10
  if (baseMove === 10) return 8
  if (baseMove === 8) return 6
  if (baseMove === 6) return 4
  return 0
})

// == Weapon/Upgrade/Total Calculations ==
const weaponDetails = computed(() => {
  const counts = {}
  let totalTonnage = 0
  let totalSlots = 0
  const currentClassName = selectedClass.value?.name
  if (!currentClassName) {
    return { totalTonnage: 0, totalSlots: 0 }
  }
  selectedWeapons.value.forEach((weapon) => {
    if (weapon && weapon.id) {
      counts[weapon.id] = (counts[weapon.id] || 0) + 1
    }
  })
  Object.entries(counts).forEach(([weaponId, quantity]) => {
    const weaponData = props.gameRules.weapons.find((w) => w.id === weaponId)
    if (weaponData && weaponData.tonnage !== undefined) {
      let groupTonnage = 0
      for (let i = 1; i <= quantity; i++) {
        groupTonnage += calculateNthWeaponCost(weaponData, i, currentClassName)
      }
      totalTonnage += groupTonnage
      totalSlots += quantity
    } else {
      console.warn(`Weapon data incomplete or missing for ID: ${weaponId}`)
    }
  })
  return { totalTonnage, totalSlots }
})

const upgradeDetails = computed(() => {
  const currentClassName = selectedClass.value?.name
  let totalTonnage = 0
  if (currentClassName) {
    totalTonnage = selectedUpgrades.value.reduce((sum, up) => {
      const cost = up?.tonnage?.[currentClassName] ?? 0
      return sum + cost
    }, 0)
  }
  const totalSlots = selectedUpgrades.value.length
  return { totalTonnage, totalSlots }
})

const usedSlots = computed(() => weaponDetails.value.totalSlots + upgradeDetails.value.totalSlots)

const totalUnitTonnageUsed = computed(
  () =>
    armorCost.value +
    structureCost.value +
    weaponDetails.value.totalTonnage +
    upgradeDetails.value.totalTonnage,
)
const remainingUnitTonnage = computed(() => baseTonnage.value - totalUnitTonnageUsed.value)

// == Validation ==
const isValidUnit = computed(() => {
  return (
    !!selectedClass.value &&
    !!effectiveArmorDie.value &&
    !!effectiveStructureDie.value &&
    !!selectedMotiveType.value
  )
})
const isOverTonnage = computed(() => remainingUnitTonnage.value < 0)
const isOverSlots = computed(() => usedSlots.value > maxSlots.value)

// === Track selected exclusive upgrade types ===
const selectedExclusiveUpgradeTypes = computed(() => {
  const types = new Set()
  selectedUpgrades.value.forEach((selectedUpg) => {
    const fullUpgData = props.gameRules.upgrades.find((u) => u.id === selectedUpg.id)
    if (fullUpgData?.type) {
      types.add(fullUpgData.type)
    }
  })
  return types
})

// == Formatting for Selects ==
const availableMotiveTypes = computed(() => {
  if (!selectedClass.value || !props.gameRules?.motiveTypes) return []
  return props.gameRules.motiveTypes.filter((mt) =>
    mt.classApplicability.includes(selectedClass.value.name),
  )
})
const formattedClasses = computed(() =>
  props.gameRules.classes.map((cls) => ({
    title: `${cls.name} (Base: ${cls.baseTonnage}T / ${cls.baseSlots} Slots)`,
    value: cls,
  })),
)
const formattedMotiveTypes = computed(() =>
  availableMotiveTypes.value.map((mt) => ({
    title: `${mt.name} (Slots: ${mt.slotModifier >= 0 ? '+' : ''}${mt.slotModifier})`,
    value: mt,
  })),
)
const formattedWeapons = computed(() => {
  const currentClassName = selectedClass.value?.name
  if (!currentClassName) return []
  const currentCounts = {}
  selectedWeapons.value.forEach((w) => {
    if (w && w.id) currentCounts[w.id] = (currentCounts[w.id] || 0) + 1
  })

  return props.gameRules.weapons.map((wpn) => {
    const currentQuantity = currentCounts[wpn.id] || 0
    const nextQuantityIndex = currentQuantity + 1
    const costToAddNext = calculateNthWeaponCost(wpn, nextQuantityIndex, currentClassName)
    const damageRating = wpn.damageRating?.[currentClassName] ?? '?'
    const range = wpn.rangeCategory || 'N/A'

    const formattedTraits = (wpn.traits || [])
      .map((trait) => formatTraitForDisplay(trait, currentClassName))
      .join(', ')

    return {
      title: `${wpn.name} [${range}] (Dmg: ${damageRating}, Cost: ${costToAddNext}T) - Tr: [${formattedTraits || 'None'}]`,
      value: wpn.id,
    }
  })
})

const formattedUpgrades = computed(() => {
  const selectedUpgradeIds = selectedUpgrades.value.map((upg) => upg.id)
  const currentClassName = selectedClass.value?.name
  const currentlySelectedTypes = selectedExclusiveUpgradeTypes.value

  let availableUpgrades = props.gameRules.upgrades

  if (currentClassName) {
    availableUpgrades = availableUpgrades.filter((upg) => {
      return !upg.allowedClasses || upg.allowedClasses.includes(currentClassName)
    })
  } else {
    availableUpgrades = []
  }

  availableUpgrades = availableUpgrades.filter((upg) => {
    if (upg.type && currentlySelectedTypes.has(upg.type)) {
      return false
    }
    return true
  })

  return availableUpgrades
    .filter((upg) => !selectedUpgradeIds.includes(upg.id))
    .map((upg) => {
      const cost = currentClassName ? (upg.tonnage?.[currentClassName] ?? '?') : '?'
      return {
        title: `${upg.name} (${cost}T / 1S)`,
        value: upg.id,
      }
    })
})
// --- END Computed Properties ---

// --- Methods ---
const addWeapon = (weapon) => {
  if (weapon) selectedWeapons.value.push({ ...weapon })
}
const removeWeapon = (index) => {
  selectedWeapons.value.splice(index, 1)
}
const addUpgrade = (upgrade) => {
  if (upgrade) selectedUpgrades.value.push({ ...upgrade })
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
    if (!currentClassName) return
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

    if (upgradeToAdd.type && selectedExclusiveUpgradeTypes.value.has(upgradeToAdd.type)) {
      toast.error(
        `Cannot add ${upgradeToAdd.name}: Another upgrade of type '${upgradeToAdd.type}' is already equipped.`,
      )
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
      return
    }

    const potentialSlots = usedSlots.value + 1
    if (potentialSlots > maxSlots.value) {
      toast.error(`Cannot add ${upgradeToAdd.name}: Exceeds maximum slots (${maxSlots.value}).`)
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
      return
    }

    const currentClassName = selectedClass.value?.name
    if (!currentClassName) {
      toast.error(`Cannot add ${upgradeToAdd.name}: Please select a HE-V class first.`)
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
      return
    }

    const costOfThisUpgrade = upgradeToAdd.tonnage?.[currentClassName] ?? 0
    if (
      upgradeToAdd.tonnage === undefined ||
      upgradeToAdd.tonnage[currentClassName] === undefined
    ) {
      console.error(`Tonnage not defined for ${upgradeToAdd.name} on ${currentClassName} class.`)
      toast.error(`Cannot add ${upgradeToAdd.name}: Tonnage configuration error.`)
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
      return
    }

    const potentialTonnage = totalUnitTonnageUsed.value + costOfThisUpgrade

    if (potentialTonnage > baseTonnage.value) {
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
        selectedMotiveType.value =
          availableMotiveTypes.value.find((mt) => mt.id === unitData.selectedMotiveType?.id) ||
          availableMotiveTypes.value[0] ||
          null
        const baseArmor = baseArmorDieObject.value
        const baseStruct = baseStructureDieObject.value

        if (baseArmor && unitData.effectiveArmorDie) {
          if (unitData.effectiveArmorDie.step > baseArmor.step)
            armorModification.value = 'reinforced'
          else if (unitData.effectiveArmorDie.step < baseArmor.step)
            armorModification.value = 'stripped'
          else armorModification.value = 'standard'
        } else {
          armorModification.value = 'standard'
        }

        if (baseStruct && unitData.effectiveStructureDie) {
          if (unitData.effectiveStructureDie.step > baseStruct.step)
            structureModification.value = 'reinforced'
          else if (unitData.effectiveStructureDie.step < baseStruct.step)
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

  const finalArmorDie = effectiveArmorDie.value
  const finalStructDie = effectiveStructureDie.value

  const hevData = {
    unitName: unitName.value,
    selectedClass: JSON.parse(JSON.stringify(selectedClass.value)),
    effectiveArmorDie: finalArmorDie ? JSON.parse(JSON.stringify(finalArmorDie)) : null,
    effectiveStructureDie: finalStructDie ? JSON.parse(JSON.stringify(finalStructDie)) : null,
    selectedWeapons: JSON.parse(JSON.stringify(selectedWeapons.value)),
    selectedUpgrades: JSON.parse(JSON.stringify(selectedUpgrades.value)),
    selectedMotiveType: JSON.parse(JSON.stringify(selectedMotiveType.value)),
    totalUnitTonnage: baseTonnage.value,
    usedTonnage: totalUnitTonnageUsed.value,
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
    const currentMotiveIsValid = availableMotiveTypes.value.some(
      (mt) => mt.id === selectedMotiveType.value?.id,
    )
    if (!selectedMotiveType.value || !currentMotiveIsValid) {
      selectedMotiveType.value = availableMotiveTypes.value[0] || null
    }
  } else {
    selectedMotiveType.value = null
  }
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

// --- Expose Methods (Still use the macro) ---
defineExpose({ resetForm, loadHevForEditing })
</script>

<template>
  <section class="hev-customizer card">
    <h2 class="component-title">HE-V Configuration</h2>

    <!-- Wrapper for Class and Defense Sections -->
    <div class="form-inline class-defense-wrapper">
      <!-- Class Section -->
      <div class="form-section class-section">
        <h3 class="section-title">Classification & Movement</h3>
        <div class="form-group">
          <label for="hevName">HE-V Name (Optional):</label>
          <input type="text" id="hevName" v-model="unitName" placeholder="e.g., 'Brawler Alpha'" />
        </div>
        <div class="form-group">
          <label for="hevClass">HE-V Class:</label>
          <select id="hevClass" v-model="selectedClass">
            <option :value="null" disabled>-- Select Class --</option>
            <option
              v-for="clsOption in formattedClasses"
              :key="clsOption.value.name"
              :value="clsOption.value"
            >
              {{ clsOption.title }}
            </option>
          </select>
        </div>
        <div class="form-group" v-if="selectedClass">
          <label for="motiveType">Motive Type:</label>
          <select id="motiveType" v-model="selectedMotiveType" required>
            <option :value="null" disabled>-- Select Motive Type --</option>
            <option
              v-for="mtOption in formattedMotiveTypes"
              :key="mtOption.value.id"
              :value="mtOption.value"
            >
              {{ mtOption.title }}
            </option>
            <option v-if="availableMotiveTypes.length === 0" :value="null" disabled>
              -- No types available for this class --
            </option>
          </select>
          <p v-if="!selectedMotiveType && availableMotiveTypes.length > 0" class="warning-text">
            Please select a motive type.
          </p>
        </div>
        <div class="form-group form-group-placeholder" v-else>
          <label> </label>
          <div class="placeholder-input"></div>
        </div>

        <!-- Movement Display -->
        <div class="movement-info" v-if="selectedClass">
          <p><strong>Movement:</strong> {{ baseMovementSpeed }}"</p>
          <p v-if="hasJumpJets"><strong>Jump:</strong> {{ jumpMovementSpeed }}"</p>
        </div>
      </div>

      <!-- Combined Armor & Structure Section -->
      <div class="form-section defense-section" v-if="selectedClass">
        <h3 class="section-title">Armor & Structure</h3>
        <div class="defense-layout-container">
          <!-- Dodge Target Display -->
          <div class="defense-row dodge-target-row">
            <label class="defense-label">Dodge:</label>
            <span class="dodge-value">{{ dodgeTarget }}</span>
          </div>

          <!-- Armor Row -->
          <div class="defense-row armor-row">
            <label class="defense-label">Armor:</label>
            <div
              class="bubble-display"
              :title="`Effective Armor: ${effectiveArmorDie?.die || 'N/A'}`"
            >
              <template v-if="armorSides > 0">
                <span class="bubble" v-for="n in armorSides" :key="`armor-bubble-${n}`"></span>
              </template>
              <span v-else class="placeholder-text-inline">N/A</span>
            </div>
            <select class="modification-select" v-model="armorModification">
              <option
                v-for="opt in modificationOptions"
                :key="`armor-mod-${opt.value}`"
                :value="opt.value"
                :disabled="
                  (opt.value === 'stripped' && !canStripArmor) ||
                  (opt.value === 'reinforced' && !canReinforceArmor)
                "
              >
                {{ opt.label }}
              </option>
            </select>
            <span class="die-cost">({{ armorCost }}T)</span>
          </div>

          <!-- Structure Row -->
          <div class="defense-row structure-row">
            <label class="defense-label">Structure:</label>
            <div
              class="bubble-display"
              :title="`Effective Structure: ${effectiveStructureDie?.die || 'N/A'}`"
            >
              <template v-if="structureSides > 0">
                <template v-for="n in structureSides" :key="`struct-bubble-${n}`">
                  <!-- Divider -->
                  <span
                    v-if="n === structureMarker_25_Percent"
                    class="threshold-divider divider-green"
                    title="25% Damage Threshold"
                  ></span
                  ><!-- 25% Marker -> GREEN -->
                  <span
                    v-else-if="n === structureMarker_50_Percent"
                    class="threshold-divider divider-yellow"
                    title="50% Damage Threshold"
                  ></span
                  ><!-- 50% Marker -> YELLOW -->
                  <span
                    v-else-if="n === structureMarker_75_Percent"
                    class="threshold-divider divider-red"
                    title="75% Damage Threshold"
                  ></span
                  ><!-- 75% Marker -> RED -->
                  <!-- Bubble -->
                  <span class="bubble"></span>
                </template>
              </template>
              <span v-else class="placeholder-text-inline">N/A</span>
            </div>
            <select class="modification-select" v-model="structureModification">
              <option
                v-for="opt in modificationOptions"
                :key="`struct-mod-${opt.value}`"
                :value="opt.value"
                :disabled="
                  (opt.value === 'stripped' && !canStripStructure) ||
                  (opt.value === 'reinforced' && !canReinforceStructure)
                "
              >
                {{ opt.label }}
              </option>
            </select>
            <span class="die-cost">({{ structureCost }}T)</span>
          </div>

          <!-- Structure Threshold Descriptions -->
          <div class="threshold-descriptions" v-if="structureSides > 0">
            <p v-if="structureMarker_25_Percent > 1" class="threshold-desc-green">
              <strong>25% Dmg:</strong> All Move/Jump Orders -1
            </p>
            <p v-if="structureMarker_50_Percent > 1" class="threshold-desc-yellow">
              <strong>50% Dmg:</strong> Weapon Damage -1 (min 1)
            </p>
            <p v-if="structureMarker_75_Percent > 1" class="threshold-desc-red">
              <strong>75% Dmg:</strong> Only 1 Order per activation
            </p>
          </div>
        </div>
        <!-- end defense-layout-container -->
      </div>
      <div class="form-section defense-section placeholder-section" v-else>
        <h3 class="section-title">Armor & Structure</h3>
        <p class="text-muted text-center mt-4">Select Class to configure Defense</p>
      </div>
      <!-- End Combined Section -->
    </div>
    <!-- End Class/Defense Wrapper -->

    <!-- Weapon Systems Selection -->
    <div class="form-group equipment-section" v-if="selectedClass">
      <h3 class="section-title">Weapon Systems</h3>
      <div class="selection-layout">
        <div class="selection-control">
          <select
            @change="handleWeaponAdd"
            :disabled="!selectedClass || usedSlots >= maxSlots"
            ref="weaponSelectRef"
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
            class="slot-limit-message selection-limit-message error"
          >
            Maximum slots used ({{ usedSlots }}/{{ maxSlots }}).
          </p>
        </div>
        <div class="selection-list-container">
          <ul class="item-list">
            <li
              v-for="(weapon, index) in selectedWeapons"
              :key="'selWpn-' + index + '-' + weapon.id"
              class="selected-item single-line-item"
            >
              <div class="item-info-line">
                <span class="item-name">{{ weapon.name }}</span>
                <span class="item-stats"
                  >(Dmg: {{ weapon.damageRating?.[selectedClass?.name ?? ''] ?? '?' }}, Rng:
                  {{ weapon.rangeCategory || 'N/A' }})</span
                >
                <span class="item-traits"
                  >Tr: [{{
                    (weapon.traits || [])
                      .map((trait) => formatTraitForDisplay(trait, selectedClass?.name))
                      .join(', ') || 'None'
                  }}]</span
                >
              </div>
              <button @click="removeWeapon(index)" class="btn btn-remove" title="Remove Weapon">
                X
              </button>
            </li>
            <li v-if="selectedWeapons.length === 0"><i>No weapons added.</i></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Upgrades Selection -->
    <div class="form-group equipment-section" v-if="selectedClass">
      <h3 class="section-title">Upgrades</h3>
      <div class="selection-layout">
        <div class="selection-control">
          <select
            @change="handleUpgradeAdd"
            :disabled="!selectedClass || usedSlots >= maxSlots || formattedUpgrades.length === 0"
            ref="upgradeSelectRef"
          >
            <option value="" disabled selected>-- Add Upgrade --</option>
            <option
              v-for="upgOption in formattedUpgrades"
              :key="upgOption.value"
              :value="upgOption.value"
            >
              {{ upgOption.title }}
              <!-- Shows simplified title -->
            </option>
            <option
              v-if="selectedClass && formattedUpgrades.length === 0 && selectedUpgrades.length > 0"
              disabled
            >
              -- All available upgrades selected --
            </option>
            <option
              v-if="
                selectedClass && formattedUpgrades.length === 0 && selectedUpgrades.length === 0
              "
              disabled
            >
              -- No upgrades available for this class --
              <!-- Message updated -->
            </option>
            <option v-if="!selectedClass" disabled>-- Select Class First --</option>
          </select>
          <p
            v-if="usedSlots >= maxSlots && selectedClass"
            class="slot-limit-message selection-limit-message error"
          >
            Maximum slots used ({{ usedSlots }}/{{ maxSlots }}).
          </p>
          <p
            v-if="
              formattedUpgrades.length === 0 && selectedUpgrades.length > 0 && usedSlots < maxSlots
            "
            class="slot-limit-message selection-limit-message"
          >
            All available upgrades added.
          </p>
        </div>
        <div class="selection-list-container">
          <ul class="item-list">
            <!-- Selected Upgrade List Item with Description -->
            <li
              v-for="(upgrade, index) in selectedUpgrades"
              :key="'selUpg-' + index + '-' + upgrade.id"
              class="selected-item upgrade-item"
            >
              <div class="upgrade-info">
                <span class="item-name">{{ upgrade.name }}</span>
                <p v-if="upgrade.description" class="upgrade-description">
                  {{ upgrade.description }}
                </p>
              </div>
              <button @click="removeUpgrade(index)" class="btn btn-remove" title="Remove Upgrade">
                X
              </button>
            </li>
            <li v-if="selectedUpgrades.length === 0"><i>No upgrades added.</i></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Unit Summary Display -->
    <div class="summary card summary-compact" v-if="selectedClass">
      <h4>Unit Summary</h4>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Base Tonnage:</span
          ><strong class="summary-value">{{ baseTonnage }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">Armor Cost:</span
          ><strong class="summary-value">{{ armorCost }}T</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">Structure Cost:</span
          ><strong class="summary-value">{{ structureCost }}T</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">Motive Slots:</span
          ><strong class="summary-value"
            >{{ motiveSlotModifier >= 0 ? '+' : '' }}{{ motiveSlotModifier }}S</strong
          >
        </div>
        <div class="summary-item summary-item-full">
          <span class="summary-label">Weapons Cost:</span
          ><strong class="summary-value"
            >{{ weaponDetails.totalTonnage }}T / {{ weaponDetails.totalSlots }} Slots</strong
          >
        </div>
        <div class="summary-item summary-item-full">
          <span class="summary-label">Upgrades Cost:</span
          ><strong class="summary-value"
            >{{ upgradeDetails.totalTonnage }}T / {{ upgradeDetails.totalSlots }} Slots</strong
          >
        </div>
        <hr class="summary-divider" />
        <div class="summary-item summary-item-full">
          <span class="summary-label">Total Tonnage Used:</span
          ><strong class="summary-value">{{ totalUnitTonnageUsed }} / {{ baseTonnage }}</strong>
        </div>
        <div class="summary-item summary-item-full" :class="{ error: isOverTonnage }">
          <span class="summary-label">Remaining Tonnage:</span
          ><strong class="summary-value">{{ remainingUnitTonnage }}</strong>
        </div>
        <div class="summary-item summary-item-full" :class="{ error: isOverSlots }">
          <span class="summary-label">Slots Used:</span
          ><strong class="summary-value">{{ usedSlots }} / {{ maxSlots }}</strong>
        </div>
      </div>
    </div>

    <!-- Action Button to Add HE-V -->
    <div class="action-buttons" v-if="selectedClass">
      <button
        @click="submitHev"
        :disabled="!isValidUnit || isOverTonnage || isOverSlots"
        class="btn btn-success btn-add-hev"
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
      </button>
    </div>
  </section>
</template>

<style src="./hevCustomizer.css" scoped></style>
