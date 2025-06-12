<template>
  <div class="print-defense-row">
    <span v-if="label" class="print-defense-label">{{ label }}:</span>
    <div class="bubble-display">
      <template v-if="value > 0">
        <template v-for="n in value" :key="`bubble-${n}`">
          <!-- Threshold dividers -->
          <span
            v-if="isStructure && n === thresholds.markerGreen && thresholds.markerGreen <= value"
            class="threshold-divider divider-green"
          ></span>
          <span
            v-if="isStructure && n === thresholds.markerYellow && thresholds.markerYellow <= value"
            class="threshold-divider divider-yellow"
          ></span>
          <span
            v-if="isStructure && n === thresholds.markerRed && thresholds.markerRed <= value"
            class="threshold-divider divider-red"
          ></span>
          <span
            class="bubble"
            :class="{ 'armor-bubble': !isStructure, 'structure-bubble': isStructure }"
          ></span>
        </template>
      </template>
      <span v-else class="placeholder-text-inline italic text-text-muted text-xs pl-1">N/A</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: Number,
    default: 0
  },
  isStructure: {
    type: Boolean,
    default: false
  }
})

const thresholds = computed(() => {
  if (!props.isStructure || props.value <= 0) return {}

  return {
    markerGreen: props.value - Math.floor(props.value * 0.25) > 0 ? props.value - Math.floor(props.value * 0.25) : 0,
    markerYellow: props.value - Math.floor(props.value * 0.5) > 0 ? props.value - Math.floor(props.value * 0.5) : 0,
    markerRed: props.value - Math.floor(props.value * 0.75) > 0 ? props.value - Math.floor(props.value * 0.75) : 0
  }
})
</script>

<style scoped>
.print-defense-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 20px;
}
.print-defense-label {
  font-weight: bold;
  min-width: 65px;
  text-align: left;
  flex-shrink: 0;
  font-size: 0.85rem;
}
.bubble-display {
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5px;
  align-items: left;
  flex-shrink: 0;
  min-width: 140px;
  overflow: hidden;
}
.bubble {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid var(--black-color);
  flex-shrink: 0;
  background-color: transparent;
  box-sizing: border-box;
}
.bubble.armor-bubble {
  border-color: var(--success-color);
}
.threshold-divider {
  display: inline-block;
  width: 1.5px;
  height: 10px;
  margin: 0 1px;
  vertical-align: middle;
  flex-shrink: 0;
}
.divider-green {
  background-color: var(--success-color);
}
.divider-yellow {
  background-color: var(--warning-color);
}
.divider-red {
  background-color: var(--danger-color);
}
.placeholder-text-inline {
  font-style: italic;
  color: var(--text-muted-color);
  font-size: 0.75rem;
  padding-left: 5px;
}
</style>
