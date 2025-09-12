<template>
  <div class="modification-selector">
    <h3 class="text-lg font-semibold mb-2">Armor & Structure Modification</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Armor Modification -->
      <div class="armor-modification">
        <div class="text-sm font-medium mb-1">Armor Modification</div>
        <FormSelect
          :modelValue="armorModification"
          @update:modelValue="(value) => updateModification('armor', value)"
          :options="modificationOptions"
          label="Armor Modification"
          class="mb-2"
        />
        <div class="flex items-center">
          <StatDisplay
            :value="effectiveArmorValue"
            label="Effective Armor"
            :highlight="armorModification !== 'standard'"
            :customClass="getModificationClass('armor')"
            :isDark="isDarkMode"
          />
        </div>
      </div>

      <!-- Structure Modification -->
      <div class="structure-modification">
        <div class="text-sm font-medium mb-1">Structure Modification</div>
        <FormSelect
          :modelValue="structureModification"
          @update:modelValue="(value) => updateModification('structure', value)"
          :options="modificationOptions"
          label="Structure Modification"
          class="mb-2"
        />
        <div class="flex items-center">
          <StatDisplay
            :value="effectiveStructureValue"
            label="Effective Structure"
            :highlight="structureModification !== 'standard'"
            :customClass="getModificationClass('structure')"
            :isDark="isDarkMode"
          />
        </div>
      </div>
    </div>

    <div v-if="showModificationWarning" class="modification-warning mt-2 text-sm text-amber-600 dark:text-amber-400">
      Note: Modifying armor and structure can impact overall performance.
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import FormSelect from '../ui/FormSelect.vue'
import StatDisplay from '../ui/StatDisplay.vue'

/**
 * HE-V Armor & Structure Modification Component
 *
 * A component for modifying and displaying HE-V armor and structure values.
 * Extracted from the hevCustomizer component for better maintainability.
 */
const props = defineProps({
  /**
   * Base armor value (from chassis class)
   */
  baseArmor: {
    type: Number,
    required: true
  },

  /**
   * Base structure value (from chassis class)
   */
  baseStructure: {
    type: Number,
    required: true
  },

  /**
   * Current armor modification (standard, enhanced, reinforced, etc.)
   */
  armorModification: {
    type: String,
    default: 'standard'
  },

  /**
   * Current structure modification (standard, enhanced, reinforced, etc.)
   */
  structureModification: {
    type: String,
    default: 'standard'
  },

  /**
   * Available modification options
   */
  modificationOptions: {
    type: Array,
    required: true
  },

  /**
   * Whether to use dark mode styling
   */
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:armorModification', 'update:structureModification'])

/**
 * Calculates the modified armor value based on the selected modification
 */
const effectiveArmorValue = computed(() => {
  return calculateModifiedValue(props.baseArmor, props.armorModification)
})

/**
 * Calculates the modified structure value based on the selected modification
 */
const effectiveStructureValue = computed(() => {
  return calculateModifiedValue(props.baseStructure, props.structureModification)
})

/**
 * Determines if a warning should be shown about modifications
 */
const showModificationWarning = computed(() => {
  return props.armorModification !== 'standard' || props.structureModification !== 'standard'
})

/**
 * Update the armor or structure modification
 *
 * @param {string} type - Either 'armor' or 'structure'
 * @param {string} value - The new modification value
 */
function updateModification(type, value) {
  if (type === 'armor') {
    emit('update:armorModification', value)
  } else if (type === 'structure') {
    emit('update:structureModification', value)
  }
}

/**
 * Calculate the modified value based on modification type
 *
 * @param {number} baseValue - The base value to modify
 * @param {string} modification - The modification type
 * @returns {number} - The modified value
 */
function calculateModifiedValue(baseValue, modification) {
  if (!baseValue) return 0

  switch (modification) {
    case 'stripped':
      return baseValue - 2
    case 'reinforced':
      return baseValue + 2
    case 'standard':
    default:
      return baseValue
  }
}

/**
 * Get CSS class based on modification type
 *
 * @param {string} type - Either 'armor' or 'structure'
 * @returns {string} - CSS class name
 */
function getModificationClass(type) {
  const modification = type === 'armor' ? props.armorModification : props.structureModification

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
.modification-selector {
  @apply bg-gray-50 dark:bg-gray-800 p-3 rounded-md;
}
</style>
