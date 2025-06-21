<template>
  <div class="upgrades-selector">
    <h3 class="text-lg font-semibold mb-2">Upgrade Pods</h3>

    <div class="add-upgrade-form mb-4">
      <FormSelect
        ref="upgradeSelectRef"
        :options="availableUpgrades"
        placeholder="Select upgrade pods to add"
        label="Available Upgrades"
        :disabled="!canAddMoreUpgrades"
        class="mb-2"
      />

      <div class="flex justify-between items-center">
        <span class="text-sm" :class="slotUsageClass">
          {{ upgradeSlotUsage }} / {{ maxSlots }} slots used
        </span>
        <Button
          @click="addSelectedUpgrade"
          :disabled="!canAddMoreUpgrades"
          size="sm"
        >
          Add Upgrade
        </Button>
      </div>
    </div>

    <div v-if="selectedUpgrades.length === 0" class="empty-state">
      <p class="text-gray-500 dark:text-gray-400 text-sm italic">No upgrade pods selected</p>
    </div>

    <div v-else class="selected-upgrades">
      <div v-for="(upgrade, index) in selectedUpgrades" :key="index" class="upgrade-item">
        <div class="flex justify-between items-start p-3 mb-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
          <div class="upgrade-details">
            <div class="font-medium">{{ upgrade.name }}</div>
            <div class="flex items-center mt-1 text-sm">
              <span class="text-gray-600 dark:text-gray-400">Slots:</span>
              <span class="ml-1">{{ upgrade.slots }}</span>
            </div>
            <div v-if="upgrade.effect" class="mt-1 text-sm">
              <span class="text-gray-600 dark:text-gray-400">Effect:</span>
              <span class="ml-1">{{ upgrade.effect }}</span>
            </div>
          </div>
          <Button @click="removeUpgrade(index)" variant="danger" size="sm">Remove</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue'
import FormSelect from '../ui/FormSelect.vue'
import Button from '../ui/Button.vue'

/**
 * Upgrade Pods Selector Component
 *
 * A component for selecting and managing upgrade pods for a HE-V unit.
 * Extracted from the hevCustomizer component for better maintainability.
 */
const props = defineProps({
  /**
   * The currently selected upgrades
   */
  selectedUpgrades: {
    type: Array,
    default: () => []
  },

  /**
   * Available upgrades to choose from
   */
  availableUpgrades: {
    type: Array,
    required: true
  },

  /**
   * Maximum slots available for weapons and upgrades
   */
  maxSlots: {
    type: Number,
    required: true
  },

  /**
   * Currently used weapon slots (to calculate remaining slots)
   */
  weaponSlotUsage: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:selectedUpgrades'])
const upgradeSelectRef = ref(null)

/**
 * Calculate the total slots used by selected upgrades
 */
const upgradeSlotUsage = computed(() => {
  return props.selectedUpgrades.reduce((total, upgrade) => total + (upgrade.slots || 0), 0)
})

/**
 * Total slots used by both weapons and upgrades
 */
const totalSlotUsage = computed(() => {
  return upgradeSlotUsage.value + props.weaponSlotUsage
})

/**
 * CSS classes for the slot usage indicator
 */
const slotUsageClass = computed(() => {
  if (totalSlotUsage.value > props.maxSlots) {
    return 'text-red-600 dark:text-red-400 font-medium'
  }
  if (totalSlotUsage.value === props.maxSlots) {
    return 'text-amber-600 dark:text-amber-400 font-medium'
  }
  return 'text-gray-600 dark:text-gray-400'
})

/**
 * Determine if more upgrades can be added
 */
const canAddMoreUpgrades = computed(() => {
  // Always allow upgrade selection, but slot limit warning will be displayed
  return true
})

/**
 * Add the selected upgrade to the unit
 */
function addSelectedUpgrade() {
  if (!upgradeSelectRef.value || !upgradeSelectRef.value.selectedOption) {
    return
  }

  const selectedUpgrade = upgradeSelectRef.value.selectedOption
  const updatedUpgrades = [...props.selectedUpgrades, selectedUpgrade]
  emit('update:selectedUpgrades', updatedUpgrades)

  // Reset the selection
  upgradeSelectRef.value.resetSelection()
}

/**
 * Remove an upgrade from the unit
 *
 * @param {number} index - Index of the upgrade to remove
 */
function removeUpgrade(index) {
  const updatedUpgrades = [...props.selectedUpgrades]
  updatedUpgrades.splice(index, 1)
  emit('update:selectedUpgrades', updatedUpgrades)
}
</script>

<style scoped>
.upgrades-selector {
  @apply bg-gray-50 dark:bg-gray-800 p-3 rounded-md;
}

.empty-state {
  @apply p-3 text-center;
}
</style>
