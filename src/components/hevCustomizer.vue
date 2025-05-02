<script setup>
// Import necessary functions from Vue and data/helpers from gameData.js
import { ref, computed, watch, defineProps, defineEmits, defineExpose, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
// Correct the path if gameData.js is not exactly one level up from components/
import { gameData as importedGameRulesData, getMaxDieStep } from '../gameData.js'
// Import the custom DiceTrack component
import DiceTrack from './DiceTrack.vue'

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
const selectedClass = ref(null) // This holds the CLASS OBJECT { name: 'Light', ... }
const selectedWeapons = ref([])
const selectedUpgrades = ref([])
const selectedMotiveType = ref(null)
const armorModification = ref('standard')
const structureModification = ref('standard')

// Refs for selects (needed for clearing with standard select)
const weaponSelectRef = ref(null)
const upgradeSelectRef = ref(null)

const maxDieStep = computed(() => (props.gameRules ? getMaxDieStep() : -1))
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
  // Still potentially needed by DiceTrack or other logic
  if (!props.gameRules?.dice || step < 0) return null
  return props.gameRules.dice.find((d) => d.step === step)
}
const getEffectiveDieStep = (baseDie, modification) => {
  // Still needed for cost calculation
  if (!baseDie) return -1
  let targetStep = baseDie.step
  if (modification === 'stripped') {
    targetStep = Math.max(0, baseDie.step - 1)
  } else if (modification === 'reinforced') {
    targetStep = Math.min(maxDieStep.value, baseDie.step + 1)
  }
  return targetStep
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
// NEW Helper: Calculate Tonnage Cost for a SPECIFIC modification
const getModificationCost = (baseDie, modification, costType = 'armor') => {
  const step = getEffectiveDieStep(baseDie, modification)
  const dieData = findDieByStep(step)
  if (!dieData) return 0
  // Use specific cost if available, else default to armorCost
  return costType === 'structure'
    ? (dieData.structureCost ?? dieData.armorCost ?? 0)
    : (dieData.armorCost ?? 0)
}

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

// Costs calculated based on current modification state
const armorCost = computed(() =>
  getModificationCost(baseArmorDieObject.value, armorModification.value, 'armor'),
)
const structureCost = computed(() =>
  getModificationCost(baseStructureDieObject.value, structureModification.value, 'structure'),
)

// Weapon/Upgrade Details
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
      totalSlots += quantity // Each weapon is 1 slot
    } else {
      console.warn(`Weapon data incomplete or missing for ID: ${weaponId}`)
    }
  })
  return { totalTonnage, totalSlots }
})
const upgradeDetails = computed(() => {
  const totalTonnage = selectedUpgrades.value.reduce((sum, up) => sum + (up?.tonnage || 0), 0)
  const totalSlots = selectedUpgrades.value.length // Each upgrade is 1 slot
  return { totalTonnage, totalSlots }
})
const usedSlots = computed(() => weaponDetails.value.totalSlots + upgradeDetails.value.totalSlots)

// Total Tonnage
const totalUnitTonnageUsed = computed(
  () =>
    armorCost.value +
    structureCost.value +
    weaponDetails.value.totalTonnage +
    upgradeDetails.value.totalTonnage +
    motiveTonnageModifier.value,
)
const remainingUnitTonnage = computed(() => baseTonnage.value - totalUnitTonnageUsed.value)

// Validation
const isValidUnit = computed(() => {
  return (
    !!selectedClass.value &&
    !!baseArmorDieObject.value &&
    !!baseStructureDieObject.value &&
    !!selectedMotiveType.value
  )
})
const isOverTonnage = computed(() => remainingUnitTonnage.value < 0)
const isOverSlots = computed(() => usedSlots.value > maxSlots.value)

// Available Motive Types & Formatting
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
    title: `${mt.name} (T: ${mt.tonnageModifier >= 0 ? '+' : ''}${mt.tonnageModifier}, S: ${mt.slotModifier >= 0 ? '+' : ''}${mt.slotModifier})`,
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
    return {
      title: `${wpn.name} [${range}] (Dmg: ${damageRating}, Cost: ${costToAddNext}T) - Tr: [${wpn.traits?.join(', ') ?? 'N/A'}]`,
      value: wpn.id,
    }
  })
})
const formattedUpgrades = computed(() => {
  const selectedUpgradeIds = selectedUpgrades.value.map((upg) => upg.id)
  return props.gameRules.upgrades
    .filter((upg) => !selectedUpgradeIds.includes(upg.id))
    .map((upg) => ({
      title: `${upg.name} (${upg.tonnage}T / 1S) - [${upg.traits?.join(', ') ?? ''}]`, // Show slot as 1
      value: upg.id,
    }))
})

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

// UPDATED: Check Tonnage Limit BEFORE adding weapon
const handleWeaponAdd = (event) => {
  const selectedWeaponId = event.target.value
  if (selectedWeaponId) {
    const weaponToAdd = props.gameRules.weapons.find((w) => w.id === selectedWeaponId)
    if (!weaponToAdd) return

    const potentialSlots = usedSlots.value + 1 // Assume 1 slot per weapon
    if (potentialSlots > maxSlots.value) {
      toast.error(`Cannot add ${weaponToAdd.name}: Exceeds maximum slots (${maxSlots.value}).`)
      if (weaponSelectRef.value) weaponSelectRef.value.value = ''
      return
    }

    // Check Tonnage Limit
    const currentClassName = selectedClass.value?.name
    if (!currentClassName) return
    const currentCount = selectedWeapons.value.filter((w) => w.id === weaponToAdd.id).length
    const costOfThisWeapon = calculateNthWeaponCost(weaponToAdd, currentCount + 1, currentClassName)
    const potentialTonnage = totalUnitTonnageUsed.value + costOfThisWeapon

    if (potentialTonnage > baseTonnage.value) {
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
// UPDATED: Check Tonnage Limit BEFORE adding upgrade
const handleUpgradeAdd = (event) => {
  const selectedUpgradeId = event.target.value
  if (selectedUpgradeId) {
    const upgradeToAdd = props.gameRules.upgrades.find((u) => u.id === selectedUpgradeId)
    if (!upgradeToAdd) return

    const potentialSlots = usedSlots.value + 1 // Assume 1 slot per upgrade
    if (potentialSlots > maxSlots.value) {
      toast.error(`Cannot add ${upgradeToAdd.name}: Exceeds maximum slots (${maxSlots.value}).`)
      if (upgradeSelectRef.value) upgradeSelectRef.value.value = ''
      return
    }

    const costOfThisUpgrade = upgradeToAdd.tonnage || 0
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
}

const loadHevForEditing = (unitData) => {
  console.log('Loading HEV data for editing:', unitData)
  try {
    resetForm()
    unitName.value = unitData.unitName || ''
    selectedClass.value =
      props.gameRules.classes.find((c) => c.name === unitData.selectedClass?.name) || null
    nextTick(() => {
      if (selectedClass.value) {
        const validMotives = props.gameRules.motiveTypes.filter(
          (mt) =>
            Array.isArray(mt.classApplicability) &&
            mt.classApplicability.includes(selectedClass.value.name),
        )
        selectedMotiveType.value =
          validMotives.find((mt) => mt.id === unitData.selectedMotiveType?.id) || null
        if (!selectedMotiveType.value && validMotives.length > 0) {
          selectedMotiveType.value = validMotives[0]
        }
      } else {
        selectedMotiveType.value = null
      }

      const baseArmor = baseArmorDieObject.value
      const baseStruct = baseStructureDieObject.value
      if (baseArmor && unitData.effectiveArmorDie) {
        if (unitData.effectiveArmorDie.step > baseArmor.step) {
          armorModification.value = 'reinforced'
        } else if (unitData.effectiveArmorDie.step < baseArmor.step) {
          armorModification.value = 'stripped'
        } else {
          armorModification.value = 'standard'
        }
      } else {
        armorModification.value = 'standard'
      }
      if (baseStruct && unitData.effectiveStructureDie) {
        if (unitData.effectiveStructureDie.step > baseStruct.step) {
          structureModification.value = 'reinforced'
        } else if (unitData.effectiveStructureDie.step < baseStruct.step) {
          structureModification.value = 'stripped'
        } else {
          structureModification.value = 'standard'
        }
      } else {
        structureModification.value = 'standard'
      }
      selectedWeapons.value = unitData.selectedWeapons
        ? JSON.parse(JSON.stringify(unitData.selectedWeapons))
        : []
      selectedUpgrades.value = unitData.selectedUpgrades
        ? JSON.parse(JSON.stringify(unitData.selectedUpgrades))
        : []
      console.log('HEV data loaded into form.')
    })
  } catch (error) {
    console.error('Error loading HEV data:', error, unitData)
    toast.error('Failed to load HEV data for editing.')
    resetForm()
  }
}

// Submit HEV - check limits before emitting
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
    toast.error('Cannot add HE-V: Configuration is incomplete (Class/Motive).')
    return
  }

  const finalArmorDie = effectiveArmorDie.value // Use computed property
  const finalStructDie = effectiveStructureDie.value // Use computed property

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

// --- Watchers ---
watch(selectedClass, (newClass, oldClass) => {
  if (oldClass !== undefined) {
    armorModification.value = 'standard'
    structureModification.value = 'standard'
  }
  if (
    selectedMotiveType.value &&
    newClass &&
    !availableMotiveTypes.value.some((mt) => mt.id === selectedMotiveType.value?.id)
  ) {
    selectedMotiveType.value = null
  }
  if (newClass && !selectedMotiveType.value) {
    const firstAvailable = availableMotiveTypes.value[0]
    selectedMotiveType.value = firstAvailable || null
  } else if (!newClass) {
    selectedMotiveType.value = null
  }
})

// NEW: Watch Armor Modification for Tonnage Check
watch(armorModification, (newValue, oldValue) => {
  if (oldValue === undefined || !selectedClass.value) return // Avoid initial/load checks
  const currentTotal = totalUnitTonnageUsed.value
  const oldArmorCost = getModificationCost(baseArmorDieObject.value, oldValue, 'armor')
  const newArmorCost = getModificationCost(baseArmorDieObject.value, newValue, 'armor')
  const potentialTotal = currentTotal - oldArmorCost + newArmorCost
  if (potentialTotal > baseTonnage.value) {
    toast.error(
      `Cannot change Armor to '${newValue}': Exceeds maximum tonnage (${baseTonnage.value}T).`,
    )
    nextTick(() => {
      armorModification.value = oldValue
    }) // Revert
  }
})

// NEW: Watch Structure Modification for Tonnage Check
watch(structureModification, (newValue, oldValue) => {
  if (oldValue === undefined || !selectedClass.value) return // Avoid initial/load checks
  const currentTotal = totalUnitTonnageUsed.value
  const oldStructureCost = getModificationCost(baseStructureDieObject.value, oldValue, 'structure')
  const newStructureCost = getModificationCost(baseStructureDieObject.value, newValue, 'structure')
  const potentialTotal = currentTotal - oldStructureCost + newStructureCost
  if (potentialTotal > baseTonnage.value) {
    toast.error(
      `Cannot change Structure to '${newValue}': Exceeds maximum tonnage (${baseTonnage.value}T).`,
    )
    nextTick(() => {
      structureModification.value = oldValue
    }) // Revert
  }
})

// --- Expose Methods ---
defineExpose({ resetForm, loadHevForEditing })
</script>

<template>
  <section class="hev-customizer card">
    <h2 class="component-title">HE-V Configuration</h2>

    <!-- Wrapper for Class and Defense Sections -->
    <div class="form-inline class-defense-wrapper">
      <!-- Class Section -->
      <div class="form-section class-section">
        <h3 class="section-title">Classification</h3>
        <div class="form-group">
          <label for="hevName">HE-V Name (Optional):</label>
          <input type="text" id="hevName" v-model="unitName" placeholder="e.g., 'Brawler Alpha'" />
        </div>
        <div class="form-group">
          <label for="hevClass">HE-V Class:</label>
          <select id="hevClass" v-model="selectedClass">
            <option :value="null" disabled>-- Select Class --</option>
            <option v-for="cls in gameRules.classes" :key="cls.name" :value="cls">
              {{ cls.name }} (Base: {{ cls.baseTonnage }}T / {{ cls.baseSlots }} Slots)
            </option>
          </select>
        </div>
        <div class="form-group" v-if="selectedClass">
          <label for="motiveType">Motive Type:</label>
          <select id="motiveType" v-model="selectedMotiveType" required>
            <option :value="null" disabled>-- Select Motive Type --</option>
            <option v-for="mt in availableMotiveTypes" :key="mt.id" :value="mt">
              {{ mt.name }} (T: {{ mt.tonnageModifier >= 0 ? '+' : '' }}{{ mt.tonnageModifier }}, S:
              {{ mt.slotModifier >= 0 ? '+' : '' }}{{ mt.slotModifier }})
            </option>
          </select>
          <p v-if="availableMotiveTypes.length === 0 && selectedClass" class="error">
            No valid motive types found!
          </p>
        </div>
        <div class="form-group form-group-placeholder" v-else>
          <label> </label>
          <div class="placeholder-input"></div>
        </div>
      </div>

      <!-- Defense Section -->
      <div class="form-section defense-section" v-if="selectedClass">
        <h3 class="section-title">Defense</h3>
        <DiceTrack
          label="Armor"
          :base-die="baseArmorDieObject"
          :all-dice="gameRules.dice"
          :max-die-step="maxDieStep"
          v-model:modification="armorModification"
          :is-structure-track="false"
          class="defense-item"
        />
        <DiceTrack
          label="Structure"
          :base-die="baseStructureDieObject"
          :all-dice="gameRules.dice"
          :max-die-step="maxDieStep"
          v-model:modification="structureModification"
          :is-structure-track="true"
          class="defense-item"
        />
      </div>
      <div class="form-section defense-section placeholder-section" v-else>
        <h3 class="section-title">Defense</h3>
        <p class="text-muted text-center mt-4">Select Class to configure Defense</p>
      </div>
    </div>
    <!-- End Class/Defense Wrapper -->

    <!-- Weapon Systems Selection -->
    <div class="form-group equipment-section" v-if="selectedClass">
      <h3 class="section-title">Weapon Systems</h3>
      <div class="selection-layout">
        <div class="selection-control">
          <select @change="handleWeaponAdd" :disabled="usedSlots >= maxSlots" ref="weaponSelectRef">
            <option value="" disabled selected>-- Add Weapon --</option>
            <option
              v-for="wpnOption in formattedWeapons"
              :key="wpnOption.value"
              :value="wpnOption.value"
            >
              {{ wpnOption.title }}
            </option>
          </select>
          <p v-if="usedSlots >= maxSlots" class="slot-limit-message selection-limit-message">
            Maximum slots used.
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
                <span class="item-traits">Tr: [{{ weapon.traits?.join(', ') || 'None' }}]</span>
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
            :disabled="usedSlots >= maxSlots || formattedUpgrades.length === 0"
            ref="upgradeSelectRef"
          >
            <option value="" disabled selected>-- Add Upgrade --</option>
            <option
              v-for="upgOption in formattedUpgrades"
              :key="upgOption.value"
              :value="upgOption.value"
            >
              {{ upgOption.title }}
            </option>
            <option v-if="formattedUpgrades.length === 0 && selectedUpgrades.length > 0" disabled>
              -- All available upgrades selected --
            </option>
          </select>
          <p v-if="usedSlots >= maxSlots" class="slot-limit-message selection-limit-message">
            Maximum slots used.
          </p>
        </div>
        <div class="selection-list-container">
          <ul class="item-list">
            <li
              v-for="(upgrade, index) in selectedUpgrades"
              :key="'selUpg-' + index + '-' + upgrade.id"
              class="selected-item single-line-item"
            >
              <div class="item-info-line">
                <span class="item-name">{{ upgrade.name }}</span>
                <span class="item-traits">Tr: [{{ upgrade.traits?.join(', ') || 'None' }}]</span>
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
          <span class="summary-label">Motive Mods:</span
          ><strong class="summary-value"
            >{{ motiveTonnageModifier >= 0 ? '+' : '' }}{{ motiveTonnageModifier }}T /
            {{ motiveSlotModifier >= 0 ? '+' : '' }}{{ motiveSlotModifier }}S</strong
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

<style src="./HevCustomizer.css" scoped></style>
