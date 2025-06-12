<script setup>
/**
 * A utility component that provides memoized trait formatting functions
 *
 * @component
 */

import { computed } from 'vue';

// Cache for memoized trait formatting
const traitDisplayCache = new Map();

const props = defineProps({
  /**
   * The class name to use for context-specific trait values
   */
  className: {
    type: String,
    default: ''
  }
});

/**
 * Format a trait for display with memoization
 * @param {Object} trait - The trait to format
 * @returns {string} - Formatted trait string
 */
function formatTraitDisplay(trait) {
  if (!trait || typeof trait !== 'object' || !trait.name) return 'Unknown Trait';

  // Create a cache key based on trait and className
  const cacheKey = JSON.stringify({
    trait: trait,
    className: props.className
  });

  // Check if we have this formatting cached
  if (traitDisplayCache.has(cacheKey)) {
    return traitDisplayCache.get(cacheKey);
  }

  // Calculate the result
  let result;

  if (trait.name === 'Limited' && typeof trait.value === 'number') {
    result = `Limited(${Array(trait.value).fill('○').join('')})`;
  }
  else if (typeof trait.value === 'object' && trait.value !== null) {
    if (props.className && trait.value[props.className] !== undefined) {
      result = `${trait.name} ${trait.value[props.className]}`;
    } else if (trait.value.default !== undefined) {
      // Use default value when available and no class match found
      result = `${trait.name} ${trait.value.default}`;
    } else {
      const classValues = Object.entries(trait.value)
        .map(([k, v]) => `${k[0]}:${v}`)
        .join('/');
      result = `${trait.name} (${classValues})`;
    }
  }
  else if (trait.value === true) {
    result = `${trait.name}`;
  }
  else if (trait.value !== undefined) {
    result = `${trait.name} ${trait.value}`;
  }
  else {
    result = trait.name;
  }

  // Cache the result
  traitDisplayCache.set(cacheKey, result);

  return result;
}

// Export the format function for use in the parent component
defineExpose({ formatTraitDisplay });
</script>

<template>
  <!-- This component doesn't render anything -->
</template>
