<template>
  <footer class="disclaimer-footer mt-8 pt-4 border-t border-border-color text-sm text-muted text-center">
    <p>{{ disclaimer }}</p>
    <p v-if="versionTag" class="version-info mt-2 text-xs">
      <span class="font-mono">v{{ versionTag }}</span>
    </p>
  </footer>
</template>

<script setup>
/**
 * Footer component for displaying disclaimer and version information
 *
 * @component
 */

const props = defineProps({
  /**
   * Disclaimer text to display
   */
  disclaimer: {
    type: String,
    default: 'This site uses browser localStorage to save your dark mode preference and roster data.'
  },
  /**
   * Version tag to display
   */
  versionTag: {
    type: String,
    default: ''
  }
});
</script>
