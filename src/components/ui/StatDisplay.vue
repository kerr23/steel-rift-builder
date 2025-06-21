<template>
  <div class="stat-display" :class="{ 'dark:bg-gray-800': isDark }">
    <label v-if="label" class="stat-label">{{ label }}</label>
    <div class="stat-value" :class="valueClass">
      {{ value }}
      <span v-if="unit" class="stat-unit">{{ unit }}</span>
    </div>
    <div v-if="description" class="stat-description">{{ description }}</div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';

/**
 * StatDisplay Component
 *
 * A reusable component for displaying numerical or text statistics with consistent styling.
 * Can be used for displaying armor values, tonnage, structure points, etc.
 */
const props = defineProps({
  /**
   * The main value to be displayed
   */
  value: {
    type: [Number, String],
    required: true
  },

  /**
   * Optional label to show above the value
   */
  label: {
    type: String,
    default: ''
  },

  /**
   * Optional unit to display after the value (e.g., "tons", "pts")
   */
  unit: {
    type: String,
    default: ''
  },

  /**
   * Optional description text to display below the value
   */
  description: {
    type: String,
    default: ''
  },

  /**
   * Indicates if the display should use a highlighted style (for important stats)
   */
  highlight: {
    type: Boolean,
    default: false
  },

  /**
   * Indicates if the component should use dark mode styling
   */
  isDark: {
    type: Boolean,
    default: false
  },

  /**
   * Custom CSS classes to apply to the value
   */
  customClass: {
    type: String,
    default: ''
  }
});

const valueClass = computed(() => {
  return {
    'highlighted': props.highlight,
    [props.customClass]: !!props.customClass
  };
});
</script>

<style scoped>
.stat-display {
  padding: 0.5rem;
  border-radius: 0.375rem;
  @apply bg-gray-100 dark:bg-gray-800;
  @apply border border-gray-200 dark:border-gray-700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.75rem;
  @apply text-gray-600 dark:text-gray-400;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  @apply text-gray-900 dark:text-white;
}

.stat-value.highlighted {
  @apply text-blue-600 dark:text-blue-400;
}

.stat-unit {
  font-size: 0.875rem;
  @apply text-gray-600 dark:text-gray-400;
  margin-left: 0.125rem;
}

.stat-description {
  font-size: 0.75rem;
  @apply text-gray-500 dark:text-gray-400;
  margin-top: 0.25rem;
}
</style>
