<template>
  <div class="chassis-class-selector">
    <h3 class="text-lg font-semibold mb-2">Chassis Class</h3>

    <FormSelect
      :modelValue="selectedClass"
      @update:modelValue="updateClass"
      :options="classOptions"
      label="Select a chassis class"
      :error="error"
      class="mb-4"
    />

    <div v-if="selectedClass" class="chassis-details">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
        <StatDisplay
          :value="selectedClass.baseTonnage"
          label="Tonnage"
          unit="T"
          :isDark="isDarkMode"
        />

        <StatDisplay
          :value="selectedClass.baseSlots"
          label="Base Slots"
          :isDark="isDarkMode"
        />

        <StatDisplay
          :value="selectedClass.baseArmor"
          label="Base Armor"
          :isDark="isDarkMode"
        />

        <StatDisplay
          :value="selectedClass.baseStructure"
          label="Base Structure"
          :isDark="isDarkMode"
        />

        <StatDisplay
          :value="selectedClass.baseMovement"
          label="Base Movement"
          unit="&quot;"
          :isDark="isDarkMode"
        />

        <StatDisplay
          :value="selectedClass.defenseRoll"
          label="Defense Roll"
          :isDark="isDarkMode"
        />
      </div>

      <div v-if="selectedClass.special" class="special-rules text-sm mt-2">
        <div class="font-medium">Special Rules:</div>
        <div>{{ selectedClass.special }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import FormSelect from '../ui/FormSelect.vue'
import StatDisplay from '../ui/StatDisplay.vue'

/**
 * Chassis Class Selector Component
 *
 * A component for selecting and displaying details about HE-V chassis classes.
 * Extracted from the hevCustomizer component for better maintainability.
 */
defineProps({
  /**
   * Currently selected chassis class
   */
  selectedClass: {
    type: Object,
    default: null
  },

  /**
   * Available chassis class options
   */
  classOptions: {
    type: Array,
    required: true
  },

  /**
   * Error message to display if selection is invalid
   */
  error: {
    type: String,
    default: ''
  },

  /**
   * Whether to use dark mode styling
   */
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:selectedClass'])

/**
 * Update the selected chassis class
 *
 * @param {Object} chassisClass - The selected chassis class
 */
function updateClass(chassisClass) {
  emit('update:selectedClass', chassisClass)
}
</script>

<style scoped>
.chassis-details {
  @apply bg-gray-50 dark:bg-gray-800 p-3 rounded-md;
}

.special-rules {
  @apply border-t border-gray-200 dark:border-gray-700 pt-2 mt-2;
}
</style>
