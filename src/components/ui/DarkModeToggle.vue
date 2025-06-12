<template>
  <button
    class="dark-mode-toggle btn bg-card-bg text-primary border border-border-color rounded px-4 py-1 text-base cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-white shadow"
    :aria-pressed="modelValue"
    aria-label="Toggle dark mode"
    @click="$emit('update:modelValue', !modelValue)"
    title="Toggle dark mode"
    role="button"
  >
    <span v-if="modelValue">☀️ Light Mode</span>
    <span v-else>🌙 Dark Mode</span>
  </button>
</template>

<script setup>
/**
 * Dark Mode Toggle component for toggling between light and dark themes
 *
 * @component
 */

const props = defineProps({
  /**
   * Boolean indicating if dark mode is enabled
   */
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
</script>
