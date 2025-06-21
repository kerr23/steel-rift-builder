<template>
  <div class="hev-editor">
    <h2 class="text-2xl font-bold mb-4">{{ isEditMode ? 'Edit HE-V' : 'Configure HE-V' }}</h2>

    <form @submit.prevent="submitHev" class="space-y-6">
      <!-- Unit Name -->
      <div class="form-group">
        <label for="unitName" class="block text-sm font-medium">Unit Name</label>
        <input
          id="unitName"
          type="text"
          v-model="unitName"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
          placeholder="Enter HE-V name"
          required
        />
      </div>

      <!-- Chassis Class Selection -->
      <ChassisClassSelector
        :selectedClass="selectedClass"
        :classOptions="gameRules.classes"
        :isDarkMode="isDarkMode"
        @update:selectedClass="selectedClass = $event"
      />

      <!-- Motive System Selection -->
      <MotiveSystemSelector
        :selectedMotiveType="selectedMotiveType"
        :motiveOptions="gameRules.motiveTypes"
        :isDarkMode="isDarkMode"
        @update:selectedMotiveType="selectedMotiveType = $event"
      />

      <!-- Armor & Structure Modification -->
      <ArmorStructureModifier
        :baseArmor="baseArmor"
        :baseStructure="baseStructure"
        :armorModification="armorModification"
        :structureModification="structureModification"
        :modificationOptions="modificationOptions"
        :isDarkMode="isDarkMode"
        @update:armorModification="armorModification = $event"
        @update:structureModification="structureModification = $event"
      />

      <!-- Weapon Selection -->
      <WeaponsSelector
        :selectedWeapons="selectedWeapons"
        :availableWeapons="gameRules.weapons"
        :maxSlots="maxSlots"
        :upgradeSlotUsage="upgradeSlotUsage"
        @update:selectedWeapons="selectedWeapons = $event"
      />

      <!-- Upgrade Pods Selection -->
      <UpgradesSelector
        :selectedUpgrades="selectedUpgrades"
        :availableUpgrades="gameRules.upgradePods"
        :maxSlots="maxSlots"
        :weaponSlotUsage="weaponSlotUsage"
        @update:selectedUpgrades="selectedUpgrades = $event"
      />

      <!-- Slot Usage Warning -->
      <div v-if="isSlotLimitExceeded" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 dark:bg-red-900 dark:text-red-200">
        <p class="font-medium">Warning: Slot limit exceeded!</p>
        <p>You are using {{ totalSlotUsage }} slots, but only have {{ maxSlots }} available.</p>
      </div>

      <!-- Summary -->
      <div class="hev-summary bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
        <h3 class="text-lg font-semibold mb-2">Summary</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <StatDisplay
            :value="baseTonnage"
            label="Base Tonnage"
            unit="T"
            :isDark="isDarkMode"
          />
          <StatDisplay
            :value="effectiveArmor"
            label="Effective Armor"
            :highlight="armorModification !== 'standard'"
            :customClass="armorModification !== 'standard' ? getModificationClass('armor') : ''"
            :isDark="isDarkMode"
          />
          <StatDisplay
            :value="effectiveStructure"
            label="Effective Structure"
            :highlight="structureModification !== 'standard'"
            :customClass="structureModification !== 'standard' ? getModificationClass('structure') : ''"
            :isDark="isDarkMode"
          />
          <StatDisplay
            :value="`${totalSlotUsage} / ${maxSlots}`"
            label="Slots Used"
            :highlight="isSlotLimitExceeded"
            :customClass="isSlotLimitExceeded ? 'text-red-600 dark:text-red-400' : ''"
            :isDark="isDarkMode"
          />
          <StatDisplay
            v-if="selectedMotiveType"
            :value="selectedMotiveType.baseMovement"
            label="Movement"
            unit="&quot;"
            :isDark="isDarkMode"
          />
        </div>
      </div>

      <!-- Form Buttons -->
      <div class="flex justify-between items-center">
        <Button
          type="button"
          @click="resetForm"
          variant="secondary"
        >
          Reset
        </Button>
        <Button
          type="submit"
          :disabled="!isFormValid"
          :variant="isFormValid ? 'primary' : 'disabled'"
        >
          {{ isEditMode ? 'Update HE-V' : 'Add to Roster' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import ChassisClassSelector from './ChassisClassSelector.vue'
import MotiveSystemSelector from './MotiveSystemSelector.vue'
import ArmorStructureModifier from './ArmorStructureModifier.vue'
import WeaponsSelector from './WeaponsSelector.vue'
import UpgradesSelector from './UpgradesSelector.vue'
import StatDisplay from '../ui/StatDisplay.vue'
import Button from '../ui/Button.vue'
import { useHevConfiguration } from '../../composables/useHevConfiguration'
import { MODIFICATION_OPTIONS } from '../../constants.js'

/**
 * HE-V Editor Component
 *
 * A component that combines various HE-V configuration components
 * and manages the state for creating or editing HE-V units.
 */
const props = defineProps({
  /**
   * Game rules data from gameData.js
   */
  gameRules: {
    type: Object,
    required: true
  },

  /**
   * HE-V data for editing (null for create mode)
   */
  editData: {
    type: Object,
    default: null
  },

  /**
   * Whether dark mode is enabled
   */
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

// Determine if in edit mode
const isEditMode = !!props.editData

// Configuration options
const modificationOptions = MODIFICATION_OPTIONS

// Use HEV configuration composable
const {
  unitName,
  selectedClass,
  selectedMotiveType,
  selectedWeapons,
  selectedUpgrades,
  armorModification,
  structureModification,
  baseArmor,
  baseStructure,
  baseTonnage,
  maxSlots,
  weaponSlotUsage,
  upgradeSlotUsage,
  totalSlotUsage,
  isSlotLimitExceeded,
  effectiveArmor,
  effectiveStructure,
  isFormValid,
  resetForm,
  submitHev
} = useHevConfiguration({
  initialData: props.editData,
  isEditMode,
  onSubmit: (hevData) => {
    if (isEditMode) {
      // In edit mode, emit update event
      emit('update-hev', hevData)
    } else {
      // In create mode, emit add event
      emit('add-hev', hevData)
    }
    return true
  }
})

// Emit events for parent component
const emit = defineEmits(['add-hev', 'update-hev'])

/**
 * Get CSS class for modified values
 */
function getModificationClass(type) {
  const modification = type === 'armor' ? armorModification.value : structureModification.value

  switch (modification) {
    case 'enhanced':
    case 'reinforced':
      return 'text-green-600 dark:text-green-400'
    case 'lightweight':
    case 'ultralight':
      return 'text-red-600 dark:text-red-400'
    default:
      return ''
  }
}
</script>

<style scoped>
.hev-editor {
  @apply max-w-4xl mx-auto p-4;
}
</style>
