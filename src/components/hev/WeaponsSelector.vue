<template>
  <div class="weapons-selector">
    <h3 class="text-lg font-semibold mb-2">Weapon Systems</h3>

    <div class="add-weapon-form mb-4">
      <FormSelect
        ref="weaponSelectRef"
        :options="availableWeapons"
        placeholder="Select weapons to add"
        label="Available Weapons"
        :disabled="!canAddMoreWeapons"
        class="mb-2"
      />

      <div class="flex justify-between items-center">
        <span class="text-sm" :class="slotUsageClass">
          {{ weaponSlotUsage }} / {{ maxSlots }} slots used
        </span>
        <Button
          @click="addSelectedWeapon"
          :disabled="!canAddMoreWeapons"
          size="sm"
        >
          Add Weapon
        </Button>
      </div>
    </div>

    <div v-if="selectedWeapons.length === 0" class="empty-state">
      <p class="text-gray-500 dark:text-gray-400 text-sm italic">No weapons selected</p>
    </div>

    <div v-else class="selected-weapons">
      <div v-for="(weapon, index) in selectedWeapons" :key="index" class="weapon-item">
        <div class="flex justify-between items-start p-3 mb-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
          <div class="weapon-details">
            <div class="font-medium">{{ weapon.name }}</div>
            <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">Damage:</span>
                {{ weapon.damage }}
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Range:</span>
                {{ weapon.range }}"
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Slots:</span>
                {{ weapon.slots }}
              </div>
            </div>
            <div v-if="weapon.traits && weapon.traits.length > 0" class="mt-1 text-sm">
              <span class="text-gray-600 dark:text-gray-400">Traits:</span>
              {{ weapon.traits.join(', ') }}
            </div>
          </div>
          <Button @click="removeWeapon(index)" variant="danger" size="sm">Remove</Button>
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
 * Weapons Selector Component
 *
 * A component for selecting and managing weapons for a HE-V unit.
 * Extracted from the hevCustomizer component for better maintainability.
 */
const props = defineProps({
  /**
   * The currently selected weapons
   */
  selectedWeapons: {
    type: Array,
    default: () => []
  },

  /**
   * Available weapons to choose from
   */
  availableWeapons: {
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
   * Currently used upgrade slots (to calculate remaining slots)
   */
  upgradeSlotUsage: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:selectedWeapons'])
const weaponSelectRef = ref(null)

/**
 * Calculate the total slots used by selected weapons
 */
const weaponSlotUsage = computed(() => {
  return props.selectedWeapons.reduce((total, weapon) => total + (weapon.slots || 0), 0)
})

/**
 * Total slots used by both weapons and upgrades
 */
const totalSlotUsage = computed(() => {
  return weaponSlotUsage.value + props.upgradeSlotUsage
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
 * Determine if more weapons can be added
 */
const canAddMoreWeapons = computed(() => {
  // Always allow weapon selection, but slot limit warning will be displayed
  return true
})

/**
 * Add the selected weapon to the unit
 */
function addSelectedWeapon() {
  if (!weaponSelectRef.value || !weaponSelectRef.value.selectedOption) {
    return
  }

  const selectedWeapon = weaponSelectRef.value.selectedOption
  const updatedWeapons = [...props.selectedWeapons, selectedWeapon]
  emit('update:selectedWeapons', updatedWeapons)

  // Reset the selection
  weaponSelectRef.value.resetSelection()
}

/**
 * Remove a weapon from the unit
 *
 * @param {number} index - Index of the weapon to remove
 */
function removeWeapon(index) {
  const updatedWeapons = [...props.selectedWeapons]
  updatedWeapons.splice(index, 1)
  emit('update:selectedWeapons', updatedWeapons)
}
</script>

<style scoped>
.weapons-selector {
  @apply bg-gray-50 dark:bg-gray-800 p-3 rounded-md;
}

.empty-state {
  @apply p-3 text-center;
}
</style>
