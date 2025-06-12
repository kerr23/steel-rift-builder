<template>
  <div class="tabbed-section">
    <div class="tab-header flex gap-2 mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', activeTab === tab.id ? 'tab-btn-active' : '']"
        @click="$emit('update:activeTab', tab.id)"
      >
        <span class="tab-indicator" v-if="activeTab === tab.id">•</span>
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
/**
 * Tab Navigation component for switching between different content tabs
 *
 * @component
 */
const props = defineProps({
  /**
   * Array of tab configuration objects
   * @type {Array<{id: string, label: string}>}
   */
  tabs: {
    type: Array,
    required: true,
    validator(value) {
      return value.every(tab => tab.id && tab.label);
    }
  },
  /**
   * The ID of the currently active tab
   */
  activeTab: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:activeTab']);
</script>

<style scoped>
.tabbed-section {
  margin-top: 2rem;
}
.tab-header {
  margin-bottom: 1rem;
}
.tab-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--border-color, #ccc);
  background: var(--light-grey);
  color: var(--text-muted-color);
  border-radius: 0.5rem 0.5rem 0 0;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  border-bottom-width: 3px;
}
.tab-btn:hover:not(.tab-btn-active) {
  background: var(--medium-grey);
  color: var(--text-color);
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}
.tab-btn-active {
  background: var(--info-color);
  color: #fff;
  font-weight: 600;
  border-bottom: 3px solid var(--primary-color);
  box-shadow: 0 -3px 8px rgba(0, 0, 0, 0.15);
}
.tab-content {
  background: var(--card-bg-color);
  border: 1px solid var(--border-color, #ccc);
  border-radius: 0 0 0.5rem 0.5rem;
  padding: 2rem 1rem 1rem 1rem;
}
.tab-indicator {
  display: inline-block;
  margin-right: 5px;
  font-size: 1.2em;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
