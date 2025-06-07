<script setup>
// Import necessary functions from Vue and data/helpers from gameData.js
import { ref, computed, watch, defineProps, defineEmits, defineExpose, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { getMaxDieStep } from '../gameData.js'

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
const maxDieStep = computed(() => (props.gameRules ? getMaxDieStep() : -1))
const allDice = computed(() => props.gameRules?.dice || [])

// --- Modification Options ---
const modificationOptions = ref([
  { value: 'stripped', label: 'Stripped' },
  { value: 'standard', label: 'Standard' },
  { value: 'reinforced', label: 'Reinforced' },
])

// --- Helper Functions ---
const findDieObject = (dieString) => {
  return allDice.value.find((d) => d.die === dieString)
}
const findDieByStep = (step) => {
  if (step < 0) return null
  return allDice.value.find((d) => d.step === step)
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

// Helper to format traits for display in the selected list (handles bubbles and class-specific values)
const formatTraitDisplay = (trait) => {
  // Assuming trait is always an object from gameData.weapons
  if (!trait || typeof trait !== 'object' || !trait.name) return 'Unknown Trait'

  const currentClassNameForTrait = selectedClass.value?.name

  if (trait.name === 'Limited' && trait.value !== undefined) {
    let bubbles = ''
    for (let i = 0; i < trait.value; i++) {
      bubbles += `<span class="trait-bubble"></span>`
    }
    return `Limited(${bubbles})`
  }
  if (typeof trait.value === 'object' && trait.value !== null) {
    if (currentClassNameForTrait && trait.value[currentClassNameForTrait] !== undefined) {
      return `${trait.name} ${trait.value[currentClassNameForTrait]}`
    } else {
      const classValues = Object.entries(trait.value)
        .map(([k, v]) => `${k[0]}:${v}`)
        .join('/')
      return `${trait.name} (${classValues})`
    }
  }
  if (trait.value !== undefined) {
    return `${trait.name} ${trait.value}`
  }
  return trait.name
}
// --- END Helper Functions ---

// --- Computed Properties ---
const baseTonnage = computed(() => selectedClass.value?.baseTonnage ?? 0)
const baseSlots = computed(() => selectedClass.value?.baseSlots ?? 0)
const motiveTonnageModifier = computed(() => selectedMotiveType.value?.tonnageModifier ?? 0)
const motiveSlotModifier = computed(() => selectedMotiveType.value?.slotModifier ?? 0)
const maxSlots = computed(() => (baseSlots.value || 0) + motiveSlotModifier.value)
const baseArmorDieObject = computed(() => findDieObject(selectedClass.value?.defaultArmorDie))
const baseStructureDieObject = computed(() =>
  findDieObject(selectedClass.value?.defaultStructureDie),
)
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
const baseMovementSpeed = computed(() => {
  return selectedClass.value?.baseMovement ?? 0
})
const hasJumpJets = computed(() => {
  return selectedUpgrades.value.some((upg) => upg.id === 'u3' || upg.id === 'u6')
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
  selectedUpgrades.value.forEach((up) => {
    if (typeof up.tonnage === 'object' && up.tonnage !== null) {
      if (currentClassName && up.tonnage[currentClassName] !== undefined) {
        totalTonnage += up.tonnage[currentClassName]
      } else {
        console.warn(
          `Upgrade "${up.name}" has object tonnage but no value for class "${currentClassName}". Using 0T for calculation.`,
        )
      }
    } else if (typeof up.tonnage === 'number') {
      totalTonnage += up.tonnage
    }
  })
  const totalSlots = selectedUpgrades.value.length
  return { totalTonnage, totalSlots }
})

const usedSlots = computed(() => weaponDetails.value.totalSlots + upgradeDetails.value.totalSlots)
const totalUnitTonnageUsed = computed(
  () =>
    armorCost.value +
    structureCost.value +
    weaponDetails.value.totalTonnage +
    upgradeDetails.value.totalTonnage +
    motiveTonnageModifier.value,
)
const remainingUnitTonnage = computed(() => baseTonnage.value - totalUnitTonnageUsed.value)
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
    title: `${mt.name}`,
    value: mt,
  })),
)

const formattedWeapons = computed(() => {
  const currentClassName = selectedClass.value?.name
  const currentCounts = {}
  selectedWeapons.value.forEach((w) => {
    if (w && w.id) currentCounts[w.id] = (currentCounts[w.id] || 0) + 1
  })

  return props.gameRules.weapons.map((wpn) => {
    const currentQuantity = currentCounts[wpn.id] || 0
    const nextQuantityIndex = currentQuantity + 1
    const costToAddNext = calculateNthWeaponCost(wpn, nextQuantityIndex, currentClassName)
    const damageRating = currentClassName ? (wpn.damageRating?.[currentClassName] ?? '?') : '?'
    const range = wpn.rangeCategory || 'N/A'

    // SIMPLIFIED: Assuming all traits in gameData.weapons are objects
    const traitsDisplay =
      wpn.traits
        ?.map((traitObj) => {
          if (traitObj && traitObj.name) {
            // Ensure traitObj and traitObj.name exist
            if (typeof traitObj.value === 'object' && traitObj.value !== null) {
              if (currentClassName && traitObj.value[currentClassName] !== undefined) {
                return `${traitObj.name} ${traitObj.value[currentClassName]}`
              } else {
                const classValuesSummary = Object.keys(traitObj.value)
                  .map((k) => k[0])
                  .join('/')
                return `${traitObj.name} (${classValuesSummary})`
              }
            } else if (traitObj.value !== undefined) {
              return `${traitObj.name} ${traitObj.value}`
            }
            return traitObj.name
          }
          return '' // For malformed trait objects
        })
        .filter(Boolean)
        .join(', ') || 'None'

    return {
      title: `${wpn.name} (${costToAddNext}T)`,
      value: wpn.id,
    }
  })
})

const formattedUpgrades = computed(() => {
  const selectedUpgradeIds = selectedUpgrades.value.map((upg) => upg.id)
  const currentClassName = selectedClass.value?.name

  return props.gameRules.upgrades
    .filter((upg) => !selectedUpgradeIds.includes(upg.id))
    .map((upg) => {
      let tonnageDisplay
      if (typeof upg.tonnage === 'object' && upg.tonnage !== null) {
        tonnageDisplay =
          currentClassName && upg.tonnage[currentClassName] !== undefined
            ? upg.tonnage[currentClassName]
            : `(${Object.entries(upg.tonnage)
                .map(([k, v]) => `${k[0]}:${v}`)
                .join('/')})`
      } else {
        tonnageDisplay = upg.tonnage
      }
      // Assuming upgrade traits are simple strings
      return {
        title: `${upg.name} (${tonnageDisplay}T)`,
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
    const currentMotiveIsValid = availableMotiveTypes.value.some(
      (mt) => mt.id === selectedMotiveType.value?.id,
    )
    if (!selectedMotiveType.value || !currentMotiveIsValid) {
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
</script>

<template>
  <section class="hev-customizer card p-5">
    <h2 class="component-title text-center text-secondary mb-5 font-medium text-2xl">HE-V Configuration</h2>

    <div class="form-inline class-defense-wrapper flex flex-wrap gap-6 mb-4 items-stretch">
      <div class="form-section class-section flex-1 min-w-[280px] flex flex-col">
        <h3 class="section-title text-[1.05rem] text-secondary border-b border-border pb-1 mb-3 font-medium">Classification & Movement</h3>
        <div class="form-group mb-3">
          <input type="text" id="hevName" v-model="unitName" placeholder="HE-V Name" class="block w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary" />
        </div>
        <div class="form-group mb-3">
          <label for="hevClass" class="block mb-2 font-medium text-text">HE-V Class:</label>
          <select id="hevClass" v-model="selectedClass" class="block w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary">
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
        <div class="form-group mb-3" v-if="selectedClass">
          <label for="motiveType" class="block mb-2 font-medium text-text">Motive Type:</label>
          <select id="motiveType" v-model="selectedMotiveType" required class="block w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary">
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
          <p v-if="!selectedMotiveType && availableMotiveTypes.length > 0" class="warning-text text-[#b38600] text-sm italic mt-1 block">
            Please select a motive type.
          </p>
        </div>
        <div class="movement-info mt-3 pt-2 border-t border-dashed border-border" v-if="selectedClass">
          <p class="my-[0.15rem] text-[0.9rem]"><strong class="inline-block min-w-[80px] font-semibold">Movement:</strong> {{ baseMovementSpeed }}"</p>
          <p v-if="hasJumpJets" class="my-[0.15rem] text-[0.9rem]"><strong class="inline-block min-w-[80px] font-semibold">Jump:</strong> {{ jumpMovementSpeed }}"</p>
        </div>
      </div>

      <div class="form-section defense-section flex-1 min-w-[280px]" v-if="selectedClass">
        <h3 class="section-title text-[1.05rem] text-secondary border-b border-border pb-1 mb-3 font-medium">Armor & Structure</h3>
        <div class="defense-layout-container flex flex-col gap-3 flex-grow border border-medium-grey rounded p-3">
          <div class="defense-row flex items-center gap-3 min-h-[38px] armor-row">
            <label class="defense-label font-semibold min-w-[70px] text-right text-dark-grey text-[0.9rem] flex-shrink-0">Armor:</label>
            <div class="bubble-display flex flex-nowrap gap-[2px] leading-none items-center overflow-hidden flex-grow min-w-[100px]" :title="`Effective Armor: ${effectiveArmorDie?.die || 'N/A'}`">
              <template v-if="armorSides > 0">
                <span class="bubble border-success" v-for="n in armorSides" :key="`armor-bubble-${n}`"></span>
              </template>
              <span v-else class="placeholder-text-inline italic text-text-muted text-sm w-full text-left pl-1">N/A</span>
            </div>
            <select class="modification-select px-2 py-1 text-sm min-w-[90px] flex-shrink-0 rounded border border-input-border focus:outline-none focus:border-primary" v-model="armorModification">
              <option v-for="opt in modificationOptions" :key="`armor-mod-${opt.value}`" :value="opt.value" :disabled="(opt.value === 'stripped' && !canStripArmor) || (opt.value === 'reinforced' && !canReinforceArmor)">
                {{ opt.label }}
              </option>
            </select>
            <span class="die-cost text-[0.85rem] font-medium text-dark-grey whitespace-nowrap flex-shrink-0 min-w-[40px] text-right">({{ armorCost }}T)</span>
          </div>
          <div class="defense-row flex items-center gap-3 min-h-[38px] structure-row">
            <label class="defense-label font-semibold min-w-[70px] text-right text-dark-grey text-[0.9rem] flex-shrink-0">Structure:</label>
            <div class="bubble-display flex flex-nowrap gap-[2px] leading-none items-center overflow-hidden flex-grow min-w-[100px]" :title="`Effective Structure: ${effectiveStructureDie?.die || 'N/A'}`">
              <template v-if="structureSides > 0">
                <template v-for="n in structureSides" :key="`struct-bubble-${n}`">
                  <span v-if="n === structureMarker_25_Percent" class="threshold-divider divider-green bg-success"></span>
                  <span v-else-if="n === structureMarker_50_Percent" class="threshold-divider divider-yellow bg-warning"></span>
                  <span v-else-if="n === structureMarker_75_Percent" class="threshold-divider divider-red bg-danger"></span>
                  <span class="bubble"></span>
                </template>
              </template>
              <span v-else class="placeholder-text-inline italic text-text-muted text-sm w-full text-left pl-1">N/A</span>
            </div>
            <select class="modification-select px-2 py-1 text-sm min-w-[90px] flex-shrink-0 rounded border border-input-border focus:outline-none focus:border-primary" v-model="structureModification">
              <option v-for="opt in modificationOptions" :key="`struct-mod-${opt.value}`" :value="opt.value" :disabled="(opt.value === 'stripped' && !canStripStructure) || (opt.value === 'reinforced' && !canReinforceStructure)">
                {{ opt.label }}
              </option>
            </select>
            <span class="die-cost text-[0.85rem] font-medium text-dark-grey whitespace-nowrap flex-shrink-0 min-w-[40px] text-right">({{ structureCost }}T)</span>
          </div>
          <div class="threshold-descriptions mt-1 pt-2 border-t border-dashed border-border text-xs leading-tight w-full">
            <p v-if="structureMarker_25_Percent > 1" class="threshold-desc-green my-[0.15rem] p-0 flex items-start"><strong class="min-w-[55px] text-right flex-shrink-0 inline-block font-bold mr-1 text-success">25% Dmg:</strong> All Move/Jump Orders -1</p>
            <p v-if="structureMarker_50_Percent > 1" class="threshold-desc-yellow my-[0.15rem] p-0 flex items-start"><strong class="min-w-[55px] text-right flex-shrink-0 inline-block font-bold mr-1 text-[#b38600]">50% Dmg:</strong> Weapon Damage -1 (min 1)</p>
            <p v-if="structureMarker_75_Percent > 1" class="threshold-desc-red my-[0.15rem] p-0 flex items-start"><strong class="min-w-[55px] text-right flex-shrink-0 inline-block font-bold mr-1 text-danger">75% Dmg:</strong> Only 1 Order per activation</p>
          </div>
        </div>
      </div>
      <div class="form-section defense-section placeholder-section flex-1 min-w-[280px]" v-else>
        <h3 class="section-title text-[1.05rem] text-secondary border-b border-border pb-1 mb-3 font-medium">Armor & Structure</h3>
        <p class="text-text-muted text-center mt-4">Select Class to configure Defense</p>
      </div>
    </div>

    <div class="form-group equipment-section" v-if="selectedClass">
      <h3 class="section-title">Weapon Systems</h3>
      <div class="selection-layout flex flex-wrap gap-4 items-start">
        <div class="selection-control flex-1 min-w-[230px] flex flex-col">
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
        <div class="selection-list-container flex-2 min-w-[280px]">
          <ul class="item-list list-none p-0 m-0 max-h-[150px] overflow-y-auto border border-medium-grey rounded bg-white min-h-[35px]">
            <li
              v-for="(weapon, index) in selectedWeapons"
              :key="'selWpn-' + index + '-' + weapon.id"
              class="selected-item single-line-item flex justify-between items-center gap-2 border-b border-medium-grey px-3 py-2 text-[0.85rem]"
            >
              <div class="item-info-line flex flex-wrap items-baseline gap-2 flex-grow overflow-hidden">
                <span class="item-name font-medium text-dark-grey whitespace-nowrap mr-1">{{ weapon.name }}</span>
                <span class="item-stats text-[0.85em] text-secondary whitespace-nowrap mr-1">(Damage: {{ weapon.damageRating?.[selectedClass?.name ?? ''] ?? '?' }}, Range: {{ weapon.rangeCategory || 'N/A' }})</span>
                <span class="item-traits text-[0.8em] text-text-muted whitespace-normal" v-html="`Traits: [${weapon.traits?.map(formatTraitDisplay).join(', ') || 'None'}]`"></span>
              </div>
              <button @click="removeWeapon(index)" class="btn btn-remove bg-danger text-white rounded-full w-5 h-5 leading-[18px] text-center font-bold cursor-pointer p-0 ml-2 flex-shrink-0 hover:bg-[#a71d2a]" title="Remove Weapon">
                X
              </button>
            </li>
            <li v-if="selectedWeapons.length === 0" class="text-text-muted w-full text-center py-2 italic"><i>No weapons added.</i></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="form-group equipment-section mt-6 mb-4 w-full" v-if="selectedClass">
      <h3 class="section-title text-[1.05rem] text-secondary border-b border-border pb-1 mb-3 font-medium">Upgrades</h3>
      <div class="selection-layout flex flex-wrap gap-4 items-start">
        <div class="selection-control flex-1 min-w-[230px] flex flex-col">
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
        <div class="selection-list-container flex-2 min-w-[280px]">
          <ul class="item-list list-none p-0 m-0 max-h-[150px] overflow-y-auto border border-medium-grey rounded bg-white min-h-[35px]">
            <li
              v-for="(upgrade, index) in selectedUpgrades"
              :key="'selUpg-' + index + '-' + upgrade.id"
              class="selected-item single-line-item flex justify-between items-center gap-2 border-b border-medium-grey px-3 py-2 text-[0.85rem]"
            >
              <div class="item-info-line flex flex-wrap items-baseline gap-2 flex-grow overflow-hidden">
                <span class="item-name font-medium text-dark-grey whitespace-nowrap mr-1">{{ upgrade.name }}</span>
                <span class="item-stats text-[0.85em] text-secondary whitespace-nowrap mr-1">
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
              <button @click="removeUpgrade(index)" class="btn btn-remove bg-danger text-white rounded-full w-5 h-5 leading-[18px] text-center font-bold cursor-pointer p-0 ml-2 flex-shrink-0 hover:bg-[#a71d2a]" title="Remove Upgrade">
                X
              </button>
            </li>
            <li v-if="selectedUpgrades.length === 0" class="text-text-muted w-full text-center py-2 italic"><i>No upgrades added.</i></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="summary card summary-compact mt-6 p-4 border border-border rounded bg-light-grey" v-if="selectedClass">
      <h4 class="mb-0 mb-3 pb-2 text-lg text-center border-b border-medium-grey">Unit Summary</h4>
      <div class="summary-grid grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-y-1 gap-x-4 text-[0.85rem]">
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
        <div class="summary-item flex justify-between">
          <span class="summary-label pr-2 text-secondary">Motive Mods:</span>
          <strong class="summary-value font-semibold text-right">
            {{ motiveTonnageModifier >= 0 ? '+' : '' }}{{ motiveTonnageModifier }}T /
            {{ motiveSlotModifier >= 0 ? '+' : '' }}{{ motiveSlotModifier }}S
          </strong>
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
      <button
        @click="submitHev"
        :disabled="!isValidUnit || isOverTonnage || isOverSlots"
        class="btn btn-success btn-add-hev px-6 py-2 text-lg font-semibold rounded bg-success text-white disabled:opacity-60 disabled:cursor-not-allowed"
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

<style scoped></style>
