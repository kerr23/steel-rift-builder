<script setup>
// Import necessary functions from Vue and data/helpers from gameData.js
import { ref, computed, watch, defineProps, defineEmits, defineExpose } from 'vue'
// Correct the path if gameData.js is not exactly one level up from components/
import { gameData as importedGameRulesData, getMaxDieStep } from '../gameData.js'
// *** Import the new component ***
import DiceTrack from './DiceTrack.vue'

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
// *** State needed for v-model with DiceTrack ***
const armorModification = ref('standard')
const structureModification = ref('standard')

// Max die step is still needed for passing down
const maxDieStep = computed(() => (props.gameRules ? getMaxDieStep() : -1))

// --- Helper Functions ---
const calculateWeaponTonnage = (weapon, quantity) => {
  if (!weapon || quantity <= 0) return 0
  const baseCost = weapon.tonnage || 0
  if (quantity === 1) return baseCost
  return baseCost + (quantity - 1) * (baseCost > 0 ? 1 : 0)
}
// Helper to find die object, still needed for base die calculation here
const findDieObject = (dieString) => {
  if (!props.gameRules?.dice) return null
  return props.gameRules.dice.find((d) => d.die === dieString)
}
// Helper to find die by step, needed for cost calculation here
const findDieByStep = (step) => {
  if (!props.gameRules?.dice || step < 0) return null
  return props.gameRules.dice.find((d) => d.step === step)
}

// --- Computed Properties ---
const baseTonnage = computed(() => selectedClass.value?.baseTonnage ?? 0)
const baseSlots = computed(() => selectedClass.value?.baseSlots ?? 0)
const motiveTonnageModifier = computed(() => selectedMotiveType.value?.tonnageModifier ?? 0)
const motiveSlotModifier = computed(() => selectedMotiveType.value?.slotModifier ?? 0)
const maxSlots = computed(() => (baseSlots.value || 0) + motiveSlotModifier.value)

// Compute base die objects to pass as props
const baseArmorDieObject = computed(() => {
  if (!selectedClass.value) return null
  return findDieObject(selectedClass.value.defaultArmorDie)
})
const baseStructureDieObject = computed(() => {
  if (!selectedClass.value) return null
  return findDieObject(selectedClass.value.defaultStructureDie)
})

// Compute effective costs based on parent state (modification) and base die
// Helper to get effective step
const getEffectiveDieStep = (baseDie, modification) => {
  if (!baseDie) return -1
  let targetStep = baseDie.step
  if (modification === 'stripped') {
    targetStep = Math.max(0, baseDie.step - 1)
  } else if (modification === 'reinforced') {
    targetStep = Math.min(maxDieStep.value, baseDie.step + 1)
  }
  return targetStep
}

// Armor/Structure Costs computed in parent for summary
const armorCost = computed(() => {
  const step = getEffectiveDieStep(baseArmorDieObject.value, armorModification.value)
  return findDieByStep(step)?.armorCost ?? 0
})
const structureCost = computed(() => {
  const step = getEffectiveDieStep(baseStructureDieObject.value, structureModification.value)
  // Use structureCost field if available, otherwise fallback to armorCost (as defined in DiceTrack)
  return findDieByStep(step)?.structureCost ?? findDieByStep(step)?.armorCost ?? 0
})

// Weapon/Upgrade details remain the same
const weaponDetails = computed(() => {
  const counts = {}
  let totalTonnage = 0
  let totalSlots = 0
  selectedWeapons.value.forEach((weapon) => {
    if (weapon && weapon.id) {
      counts[weapon.id] = (counts[weapon.id] || 0) + 1
    }
  })
  Object.entries(counts).forEach(([weaponId, quantity]) => {
    const weaponData = props.gameRules.weapons.find((w) => w.id === weaponId)
    if (weaponData) {
      const tonnageForGroup = calculateWeaponTonnage(weaponData, quantity)
      totalTonnage += tonnageForGroup
      totalSlots += (weaponData.slots || 0) * quantity
    }
  })
  return { totalTonnage, totalSlots }
})
const upgradeDetails = computed(() => {
  const totalTonnage = selectedUpgrades.value.reduce((sum, up) => sum + (up?.tonnage || 0), 0)
  const totalSlots = selectedUpgrades.value.reduce((sum, up) => sum + (up?.slots || 0), 0)
  return { totalTonnage, totalSlots }
})
const usedSlots = computed(() => weaponDetails.value.totalSlots + upgradeDetails.value.totalSlots)

// Total Tonnage - uses the locally computed armor/structure costs
const totalUnitTonnageUsed = computed(
  () =>
    armorCost.value +
    structureCost.value +
    weaponDetails.value.totalTonnage +
    upgradeDetails.value.totalTonnage +
    motiveTonnageModifier.value,
)
const remainingUnitTonnage = computed(() => baseTonnage.value - totalUnitTonnageUsed.value)

// Validation - simplified as it relies on local costs/slots
const isValidUnit = computed(() => {
  // Base die objects need to exist (meaning class is selected)
  const hasRequiredSelections =
    !!selectedClass.value &&
    !!baseArmorDieObject.value &&
    !!baseStructureDieObject.value &&
    !!selectedMotiveType.value
  const withinLimits = remainingUnitTonnage.value >= 0 && usedSlots.value <= maxSlots.value
  return hasRequiredSelections && withinLimits
})

// Available Motive Types remain the same
const availableMotiveTypes = computed(() => {
  if (!selectedClass.value || !props.gameRules?.motiveTypes) return []
  return props.gameRules.motiveTypes.filter((mt) =>
    mt.classApplicability.includes(selectedClass.value.name),
  )
})

// --- Methods ---
// Weapon/Upgrade methods remain the same
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
    addWeapon(weaponToAdd)
    event.target.value = ''
  }
}
const handleUpgradeAdd = (event) => {
  const selectedUpgradeId = event.target.value
  if (selectedUpgradeId) {
    const upgradeToAdd = props.gameRules.upgrades.find((u) => u.id === selectedUpgradeId)
    addUpgrade(upgradeToAdd)
    event.target.value = ''
  }
}

// Reset form - simpler, just resets local state
const resetForm = () => {
  console.log('Resetting HEV form')
  unitName.value = ''
  selectedClass.value = null // Triggers watcher
  selectedWeapons.value = []
  selectedUpgrades.value = []
  // Modifications reset by watcher
}

// Submit HEV - needs to get effective dice data to submit
const submitHev = () => {
  if (!isValidUnit.value) {
    console.warn('Submit blocked: Unit is not valid.')
    return
  }

  // Re-calculate effective dice just before submitting based on current state
  const finalArmorStep = getEffectiveDieStep(baseArmorDieObject.value, armorModification.value)
  const finalStructStep = getEffectiveDieStep(
    baseStructureDieObject.value,
    structureModification.value,
  )
  const finalArmorDie = findDieByStep(finalArmorStep)
  const finalStructDie = findDieByStep(finalStructStep)

  const hevData = {
    unitName: unitName.value,
    selectedClass: JSON.parse(JSON.stringify(selectedClass.value)),
    // Pass the *calculated* final effective die objects
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

// --- Watcher ---
// Simplified watcher
watch(selectedClass, (newClass) => {
  // Reset modifications when class changes (or is cleared)
  armorModification.value = 'standard'
  structureModification.value = 'standard'

  // Motive type logic remains the same
  if (
    selectedMotiveType.value &&
    newClass &&
    !selectedMotiveType.value.classApplicability.includes(newClass.name)
  ) {
    selectedMotiveType.value = null
  }
  if (newClass && !selectedMotiveType.value) {
    const directlyFilteredTypes =
      props.gameRules?.motiveTypes?.filter((mt) => mt.classApplicability.includes(newClass.name)) ??
      []
    const firstAvailable = directlyFilteredTypes[0]
    selectedMotiveType.value = firstAvailable || null
  } else if (!newClass) {
    selectedMotiveType.value = null
  }
})

// --- Expose Methods ---
defineExpose({ resetForm })
</script>

<template>
  <section class="hev-customizer card">
    <h2>HE-V Customization Area</h2>

    <!-- Name -->
    <div class="form-group">
      <label for="hevName">HE-V Name (Optional):</label>
      <input type="text" id="hevName" v-model="unitName" placeholder="e.g., 'Brawler Alpha'" />
    </div>

    <!-- Container for Class and Motive -->
    <div class="form-group form-inline">
      <!-- Class Selection -->
      <div class="form-group">
        <label for="hevClass">HE-V Class:</label>
        <select id="hevClass" v-model="selectedClass">
          <option :value="null" disabled>-- Select Class --</option>
          <option v-for="cls in gameRules.classes" :key="cls.name" :value="cls">
            {{ cls.name }} (Base: {{ cls.baseTonnage }}T / {{ cls.baseSlots }} Slots)
          </option>
        </select>
      </div>

      <!-- Motive Type Selection -->
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
          No valid motive types found for this class!
        </p>
      </div>
      <!-- Placeholder if no class selected -->
      <div class="form-group form-group-placeholder" v-else>
        <label> </label>
        <div class="placeholder-input"></div>
      </div>
    </div>
    <!-- End Container for Class and Motive -->

    <!-- Armor & Structure Section using DiceTrack Components -->
    <div class="form-group form-inline form-dice" v-if="selectedClass">
      <DiceTrack
        label="Armor"
        :base-die="baseArmorDieObject"
        :all-dice="gameRules.dice"
        :max-die-step="maxDieStep"
        v-model:modification="armorModification"
      />
      <DiceTrack
        label="Structure"
        :base-die="baseStructureDieObject"
        :all-dice="gameRules.dice"
        :max-die-step="maxDieStep"
        v-model:modification="structureModification"
        :is-structure-track="true"
      />
    </div>

    <!-- Weapon Systems Selection -->
    <div class="form-group" v-if="selectedClass">
      <label>Weapon Systems:</label>
      <div class="selection-box">
        <select
          @change="handleWeaponAdd"
          :disabled="usedSlots >= maxSlots"
          :title="usedSlots >= maxSlots ? 'Maximum slots reached' : 'Add a weapon system'"
        >
          <option value="" disabled selected>-- Add Weapon --</option>
          <option v-for="wpn in gameRules.weapons" :key="wpn.id" :value="wpn.id">
            {{ wpn.name }} ({{ wpn.tonnage }}T / {{ wpn.slots }}S) - [{{
              wpn.traits?.join(', ') ?? 'No Traits'
            }}]
          </option>
        </select>
        <ul class="item-list">
          <li v-for="(weapon, index) in selectedWeapons" :key="'selWpn-' + index + '-' + weapon.id">
            <span>{{ weapon.name }}</span>
            <button @click="removeWeapon(index)" class="btn btn-remove" title="Remove Weapon">
              X
            </button>
          </li>
          <li v-if="selectedWeapons.length === 0"><i>No weapons added.</i></li>
        </ul>
      </div>
      <p v-if="usedSlots >= maxSlots" class="slot-limit-message">Maximum slots used.</p>
    </div>

    <!-- Upgrades Selection -->
    <div class="form-group" v-if="selectedClass">
      <label>Upgrades:</label>
      <div class="selection-box">
        <select
          @change="handleUpgradeAdd"
          :disabled="usedSlots >= maxSlots"
          :title="usedSlots >= maxSlots ? 'Maximum slots reached' : 'Add an upgrade'"
        >
          <option value="" disabled selected>-- Add Upgrade --</option>
          <option v-for="upg in gameRules.upgrades" :key="upg.id" :value="upg.id">
            {{ upg.name }} ({{ upg.tonnage }}T / {{ upg.slots }}S) - [{{
              upg.traits?.join(', ') ?? 'No Traits'
            }}]
          </option>
        </select>
        <ul class="item-list">
          <li
            v-for="(upgrade, index) in selectedUpgrades"
            :key="'selUpg-' + index + '-' + upgrade.id"
          >
            <span>{{ upgrade.name }}</span>
            <button @click="removeUpgrade(index)" class="btn btn-remove" title="Remove Upgrade">
              X
            </button>
          </li>
          <li v-if="selectedUpgrades.length === 0"><i>No upgrades added.</i></li>
        </ul>
      </div>
      <p v-if="usedSlots >= maxSlots" class="slot-limit-message">Maximum slots used.</p>
    </div>

    <!-- Unit Summary Display -->
    <div class="summary card" v-if="selectedClass">
      <h4>Unit Summary</h4>
      <p>
        Base Tonnage: <strong>{{ baseTonnage }}</strong>
      </p>
      <p>
        Armor Cost: <strong>{{ armorCost }}T</strong>
      </p>
      <p>
        Structure Cost: <strong>{{ structureCost }}T</strong>
      </p>
      <p>
        Weapon System Cost:
        <strong>{{ weaponDetails.totalTonnage }}T / {{ weaponDetails.totalSlots }} Slots</strong>
      </p>
      <p>
        Upgrade Cost:
        <strong>{{ upgradeDetails.totalTonnage }}T / {{ upgradeDetails.totalSlots }} Slots</strong>
      </p>
      <p v-if="selectedMotiveType && selectedMotiveType.tonnageModifier !== 0">
        Motive Tonnage Mod:
        <strong
          >{{ selectedMotiveType.tonnageModifier >= 0 ? '+' : ''
          }}{{ selectedMotiveType.tonnageModifier }}T</strong
        >
      </p>
      <p v-if="selectedMotiveType && selectedMotiveType.slotModifier !== 0">
        Motive Slot Mod:
        <strong
          >{{ selectedMotiveType.slotModifier >= 0 ? '+' : ''
          }}{{ selectedMotiveType.slotModifier }} Slots</strong
        >
      </p>
      <hr class="summary-hr" />
      <p>
        Total Tonnage Used: <strong>{{ totalUnitTonnageUsed }} / {{ baseTonnage }}</strong>
      </p>
      <p :class="{ error: remainingUnitTonnage < 0 }">
        Remaining Tonnage: <strong>{{ remainingUnitTonnage }}</strong>
      </p>
      <p :class="{ error: usedSlots > maxSlots }">
        Slots Used: <strong>{{ usedSlots }} / {{ maxSlots }}</strong>
      </p>
      <p v-if="remainingUnitTonnage < 0" class="error">Error: Tonnage limit exceeded!</p>
    </div>

    <!-- Action Button to Add HE-V -->
    <div class="action-buttons" v-if="selectedClass">
      <button
        @click="submitHev"
        :disabled="!isValidUnit"
        class="btn btn-success btn-add-hev"
        :title="
          isValidUnit
            ? 'Add this HE-V configuration to the roster'
            : 'Complete HE-V configuration (Class, Motive) and ensure Tonnage/Slots are valid'
        "
      >
        Add HE-V to Roster
      </button>
    </div>
  </section>
</template>

<style src="./HevCustomizer.css" scoped></style>
