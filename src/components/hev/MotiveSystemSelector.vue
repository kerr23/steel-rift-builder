<template>
  <div class="motive-system-selector">
    <h3 class="text-lg font-semibold mb-2">Motive System</h3>

    <FormSelect
      :modelValue="selectedMotiveType"
      @update:modelValue="updateMotiveType"
      :options="motiveOptions"
      label="Select a motive system"
      :error="error"
      class="mb-4"
    />

    <div v-if="selectedMotiveType" class="motive-details">
      <div class="flex flex-wrap gap-2">
        <StatDisplay
          :value="selectedMotiveType.baseMovement"
          label="Movement"
          unit="&quot;"
          :isDark="isDarkMode"
        />

        <StatDisplay
          :value="selectedMotiveType.slotModifier >= 0 ? `+${selectedMotiveType.slotModifier}` : selectedMotiveType.slotModifier"
          label="Slot Modifier"
          :customClass="selectedMotiveType.slotModifier >= 0 ? 'text-green-600' : 'text-red-600'"
          :isDark="isDarkMode"
        />
      </div>

      <div v-if="selectedMotiveType.traits && selectedMotiveType.traits.length > 0" class="mt-2">
        <span class="text-sm font-medium">Traits: </span>
        <span class="text-sm">{{ formatTraits(selectedMotiveType.traits) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import FormSelect from '../ui/FormSelect.vue'
import StatDisplay from '../ui/StatDisplay.vue'

/**
 * Motive System Selector Component
 *
 * A component for selecting and displaying details about HE-V motive systems.
 * Extracted from the hevCustomizer component for better maintainability.
 */
defineProps({
  /**
   * Currently selected motive type
   */
  selectedMotiveType: {
    type: Object,
    default: null
  },

  /**
   * Available motive options
   */
  motiveOptions: {
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

const emit = defineEmits(['update:selectedMotiveType'])

/**
 * Update the selected motive type
 *
 * @param {Object} motiveType - The selected motive type
 */
function updateMotiveType(motiveType) {
  emit('update:selectedMotiveType', motiveType)
}

/**
 * Format traits array into readable string
 *
 * @param {Array} traits - Array of trait strings
 * @returns {String} Comma-separated traits
 */
function formatTraits(traits) {
  return Array.isArray(traits) ? traits.join(', ') : ''
}
</script>

<style scoped>
.motive-details {
  @apply bg-gray-50 dark:bg-gray-800 p-3 rounded-md;
}
</style>
